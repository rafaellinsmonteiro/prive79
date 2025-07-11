import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Appointment {
  id: string;
  model_id: string;
  client_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  price: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'partial' | 'paid';
  location?: string;
  observations?: string;
  created_by_admin?: boolean;
  created_at: string;
  updated_at: string;
  // Dados relacionados
  client?: {
    id: string;
    name: string;
    phone?: string;
  };
  service?: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
  // Dados de pagamento calculados
  total_paid?: number;
}

export const useAppointments = () => {
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar model_id do usuário
      const { data: profile } = await supabase
        .from('model_profiles')
        .select('model_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!profile) throw new Error('Perfil de modelo não encontrado');

      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          *,
          clients (id, name, phone),
          services (id, name, price, duration)
        `)
        .eq('model_id', profile.model_id)
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      // Buscar pagamentos para cada agendamento
      const appointmentsWithPayments = await Promise.all(
        appointmentsData.map(async (appointment) => {
          const { data: paymentsData } = await supabase
            .from('payments')
            .select('amount')
            .eq('appointment_id', appointment.id);

          const totalPaid = paymentsData?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
          
          // Calcular status de pagamento
          let paymentStatus: 'pending' | 'partial' | 'paid' = 'pending';
          if (totalPaid > 0) {
            paymentStatus = totalPaid >= appointment.price ? 'paid' : 'partial';
          }

          return {
            ...appointment,
            payment_status: paymentStatus,
            total_paid: totalPaid,
          };
        })
      );

      return appointmentsWithPayments as Appointment[];
    },
  });

  const createAppointment = useMutation({
    mutationFn: async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'model_id' | 'client' | 'service'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('model_profiles')
        .select('model_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!profile) throw new Error('Perfil de modelo não encontrado');

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...appointmentData,
          model_id: profile.model_id,
        })
        .select(`
          *,
          clients (id, name, phone),
          services (id, name, price, duration)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Agendamento criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating appointment:', error);
      toast.error('Erro ao criar agendamento');
    },
  });

  const updateAppointment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Appointment> & { id: string }) => {
      // Verificar se o agendamento foi criado pelo admin
      const { data: appointmentData } = await supabase
        .from('appointments')
        .select('created_by_admin')
        .eq('id', id)
        .single();

      if (appointmentData?.created_by_admin) {
        throw new Error('Agendamentos criados pelo admin não podem ser editados por modelos');
      }

      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          clients (id, name, phone),
          services (id, name, price, duration)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Agendamento atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating appointment:', error);
      if (error.message.includes('criados pelo admin')) {
        toast.error('Este agendamento não pode ser editado pois foi criado pelo admin');
      } else {
        toast.error('Erro ao atualizar agendamento');
      }
    },
  });

  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      // Verificar se o agendamento foi criado pelo admin
      const { data: appointmentData } = await supabase
        .from('appointments')
        .select('created_by_admin')
        .eq('id', id)
        .single();

      if (appointmentData?.created_by_admin) {
        throw new Error('Agendamentos criados pelo admin não podem ser excluídos por modelos');
      }

      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Agendamento removido com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting appointment:', error);
      if (error.message.includes('criados pelo admin')) {
        toast.error('Este agendamento não pode ser excluído pois foi criado pelo admin');
      } else {
        toast.error('Erro ao remover agendamento');
      }
    },
  });

  return {
    appointments,
    isLoading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  };
};