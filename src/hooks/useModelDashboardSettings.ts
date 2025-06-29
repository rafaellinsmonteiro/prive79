
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DashboardSettings {
  privacy_mode: boolean;
  auto_approve_photos: boolean;
  show_online_status: boolean;
  allow_direct_messages: boolean;
}

export const useModelDashboardSettings = (modelId?: string) => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['model-dashboard-settings', modelId],
    queryFn: async () => {
      if (!modelId) return null;

      const { data, error } = await supabase
        .from('model_dashboard_settings')
        .select('*')
        .eq('model_id', modelId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!modelId,
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<DashboardSettings>) => {
      if (!modelId) throw new Error('Model ID não fornecido');

      const { data, error } = await supabase
        .from('model_dashboard_settings')
        .upsert({
          model_id: modelId,
          ...newSettings,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model-dashboard-settings', modelId] });
      toast.success('Configurações atualizadas com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast.error('Erro ao atualizar configurações');
    },
  });

  return {
    settings,
    isLoading,
    updateSettings,
  };
};
