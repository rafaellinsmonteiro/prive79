import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Payment {
  id: string;
  appointment_id: string;
  amount: number;
  payment_date: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const usePayments = (appointmentId?: string) => {
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments', appointmentId],
    queryFn: async () => {
      if (!appointmentId) return [];
      
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('appointment_id', appointmentId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!appointmentId,
  });

  const createPayment = useMutation({
    mutationFn: async (paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Pagamento adicionado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating payment:', error);
      toast.error('Erro ao adicionar pagamento');
    },
  });

  const deletePayment = useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Pagamento removido com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting payment:', error);
      toast.error('Erro ao remover pagamento');
    },
  });

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return {
    payments,
    isLoading,
    createPayment,
    deletePayment,
    totalPaid,
  };
};