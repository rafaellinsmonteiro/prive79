import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Review {
  id: string;
  appointment_id: string;
  reviewer_id: string;
  reviewed_id: string;
  reviewer_type: 'model' | 'client';
  overall_rating: number;
  description: string;
  positive_points?: string;
  improvement_points?: string;
  negative_points?: string;
  status: 'draft' | 'pending_publication' | 'published';
  is_approved?: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PendingReview {
  appointment_id: string;
  appointment_date: string;
  appointment_time: string;
  client_name?: string;
  model_name?: string;
  service_name?: string;
  review_type: 'model' | 'client';
  reviewed_user_id: string;
}

export const useReviews = () => {
  const queryClient = useQueryClient();

  // Buscar avaliações pendentes
  const { data: pendingReviews = [], isLoading: loadingPending } = useQuery({
    queryKey: ['pending-reviews'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar o model_profile se for modelo
      const { data: modelProfile } = await supabase
        .from('model_profiles')
        .select('model_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      // Buscar agendamentos concluídos sem avaliação
      let query = supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          model_id,
          client_id,
          clients (name),
          services (name),
          models (name)
        `)
        .eq('status', 'completed');

      if (modelProfile) {
        query = query.eq('model_id', modelProfile.model_id);
      } else {
        query = query.eq('client_id', user.id);
      }

      const { data: appointments, error } = await query;
      if (error) throw error;

      // Filtrar apenas os que não foram avaliados ainda
      const pendingList: PendingReview[] = [];
      
      for (const appointment of appointments || []) {
        const { data: existingReview } = await supabase
          .from('reviews')
          .select('id')
          .eq('appointment_id', appointment.id)
          .eq('reviewer_id', user.id)
          .maybeSingle();

        if (!existingReview) {
          pendingList.push({
            appointment_id: appointment.id,
            appointment_date: appointment.appointment_date,
            appointment_time: appointment.appointment_time,
            client_name: appointment.clients?.name,
            model_name: appointment.models?.name,
            service_name: appointment.services?.name,
            review_type: modelProfile ? 'model' : 'client',
            reviewed_user_id: modelProfile ? appointment.client_id : appointment.model_id
          });
        }
      }

      return pendingList;
    },
  });

  // Buscar avaliações do usuário
  const { data: myReviews = [], isLoading: loadingReviews } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
  });

  // Criar avaliação
  const createReview = useMutation({
    mutationFn: async (reviewData: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'published_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          ...reviewData,
          reviewer_id: user.id,
          status: 'pending_publication'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      toast.success('Avaliação enviada! Será publicada em 24h.');
    },
    onError: (error) => {
      console.error('Error creating review:', error);
      toast.error('Erro ao enviar avaliação');
    },
  });

  // Atualizar avaliação
  const updateReview = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Review> & { id: string }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id)
        .eq('status', 'draft')
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      toast.success('Avaliação atualizada!');
    },
    onError: (error) => {
      console.error('Error updating review:', error);
      toast.error('Erro ao atualizar avaliação');
    },
  });

  return {
    pendingReviews,
    loadingPending,
    myReviews,
    loadingReviews,
    createReview,
    updateReview,
  };
};