import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Goal {
  id: string;
  model_id: string | null;
  admin_defined: boolean;
  is_active: boolean;
  goal_type: 'work_hours' | 'appointments' | 'points' | 'platform_access' | 'content_delivery' | 'live_minutes';
  title: string;
  description: string | null;
  target_value: number;
  current_value: number;
  period_type: 'daily' | 'weekly' | 'monthly';
  period_start: string | null;
  period_end: string | null;
  appointment_types: string[] | null;
  content_formats: string[] | null;
  reward_points: number | null;
  reward_description: string | null;
  created_at: string;
  updated_at: string;
  created_by_user_id: string | null;
  model?: {
    name: string;
  };
}

export interface GoalProgress {
  id: string;
  goal_id: string;
  progress_date: string;
  progress_value: number;
  notes: string | null;
  created_at: string;
}

export const useGoals = (modelId?: string) => {
  return useQuery({
    queryKey: ['goals', modelId],
    queryFn: async () => {
      let query = supabase
        .from('goals')
        .select(`
          *,
          model:models(name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Se modelId for fornecido, filtrar para esta modelo ou metas globais
      if (modelId) {
        query = query.or(`model_id.eq.${modelId},model_id.is.null`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Goal[];
    },
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'current_value'>) => {
      const { data, error } = await supabase
        .from('goals')
        .insert([goalData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Meta criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar meta: ${error.message}`);
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...goalData }: Partial<Goal> & { id: string }) => {
      const { data, error } = await supabase
        .from('goals')
        .update(goalData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Meta atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar meta: ${error.message}`);
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Meta deletada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao deletar meta: ${error.message}`);
    },
  });
};

export const useGoalProgress = (goalId: string) => {
  return useQuery({
    queryKey: ['goal-progress', goalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goal_progress')
        .select('*')
        .eq('goal_id', goalId)
        .order('progress_date', { ascending: false });

      if (error) throw error;
      return data as GoalProgress[];
    },
    enabled: !!goalId,
  });
};

export const useUpdateGoalProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ goalId, progressValue, notes }: { goalId: string; progressValue: number; notes?: string }) => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('goal_progress')
        .upsert({
          goal_id: goalId,
          progress_date: today,
          progress_value: progressValue,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar o valor atual da meta
      await supabase
        .from('goals')
        .update({ current_value: progressValue })
        .eq('id', goalId);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goal-progress', variables.goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Progresso atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar progresso: ${error.message}`);
    },
  });
};