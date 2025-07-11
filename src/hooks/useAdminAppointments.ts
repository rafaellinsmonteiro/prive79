import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminAppointment {
  id: string;
  model_id: string;
  client_id: string;
  service_id?: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  price: number;
  currency?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  payment_status: 'pending' | 'partial' | 'paid';
  location?: string;
  observations?: string;
  created_by_admin: boolean;
  recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrence_end_date?: string;
  parent_appointment_id?: string;
  admin_notes?: string;
  is_recurring_series: boolean;
  created_at: string;
  updated_at: string;
  // Dados relacionados
  models?: {
    id: string;
    name: string;
  };
  clients?: {
    id: string;
    name: string;
    phone?: string;
  };
  services?: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
  // Dados de pagamento calculados
  total_paid?: number;
  comments?: AppointmentComment[];
  attachments?: AppointmentAttachment[];
}

export interface AppointmentComment {
  id: string;
  appointment_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentAttachment {
  id: string;
  appointment_id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  created_at: string;
}

export const useAdminAppointments = () => {
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: async () => {
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          *,
          models (id, name),
          clients (id, name, phone),
          services (id, name, price, duration)
        `)
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      // Buscar pagamentos para cada agendamento
      const appointmentsWithPayments = await Promise.all(
        appointmentsData.map(async (appointment) => {
          const { data: paymentsData } = await supabase
            .from('payments')
            .select('amount')
            .eq('appointment_id', appointment.id);

          const { data: commentsData } = await supabase
            .from('appointment_comments')
            .select('*')
            .eq('appointment_id', appointment.id)
            .order('created_at', { ascending: true });

          const { data: attachmentsData } = await supabase
            .from('appointment_attachments')
            .select('*')
            .eq('appointment_id', appointment.id)
            .order('created_at', { ascending: true });

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
            comments: commentsData || [],
            attachments: attachmentsData || [],
          };
        })
      );

      return appointmentsWithPayments as AdminAppointment[];
    },
  });

  const createAppointment = useMutation({
    mutationFn: async (appointmentData: {
      model_id: string;
      client_id: string;
      service_id?: string;
      appointment_date: string;
      appointment_time: string;
      duration: number;
      price: number;
      currency?: 'BRL' | 'PRIV';
      location?: string;
      observations?: string;
      admin_notes?: string;
      recurrence_type?: 'none' | 'daily' | 'weekly' | 'monthly';
      recurrence_end_date?: string;
    }) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          model_id: appointmentData.model_id,
          client_id: appointmentData.client_id,
          service_id: appointmentData.service_id || null,
          appointment_date: appointmentData.appointment_date,
          appointment_time: appointmentData.appointment_time,
          duration: appointmentData.duration,
          price: appointmentData.price,
          currency: appointmentData.currency || 'BRL',
          location: appointmentData.location,
          observations: appointmentData.observations,
          admin_notes: appointmentData.admin_notes,
          recurrence_type: appointmentData.recurrence_type || 'none',
          recurrence_end_date: appointmentData.recurrence_end_date,
          created_by_admin: true,
          status: 'confirmed',
          payment_status: 'pending',
        })
        .select(`
          *,
          models (id, name),
          clients (id, name, phone),
          services (id, name, price, duration)
        `)
        .single();

      if (error) throw error;

      // Se tem recorrência, criar os agendamentos adicionais
      if (appointmentData.recurrence_type && appointmentData.recurrence_type !== 'none' && appointmentData.recurrence_end_date) {
        const { error: recurError } = await supabase.rpc('create_recurring_appointments', {
          _appointment_id: data.id,
          _recurrence_type: appointmentData.recurrence_type,
          _recurrence_end_date: appointmentData.recurrence_end_date,
        });

        if (recurError) {
          console.error('Error creating recurring appointments:', recurError);
          toast.error('Agendamento criado, mas erro ao criar recorrências');
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      toast.success('Agendamento criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating appointment:', error);
      toast.error('Erro ao criar agendamento');
    },
  });

  const updateAppointment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AdminAppointment> & { id: string }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          models (id, name),
          clients (id, name, phone),
          services (id, name, price, duration)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      toast.success('Agendamento atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating appointment:', error);
      toast.error('Erro ao atualizar agendamento');
    },
  });

  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      toast.success('Agendamento removido com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting appointment:', error);
      toast.error('Erro ao remover agendamento');
    },
  });

  const addComment = useMutation({
    mutationFn: async ({ appointment_id, comment }: { appointment_id: string; comment: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('appointment_comments')
        .insert({
          appointment_id,
          user_id: user.id,
          comment,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      toast.success('Comentário adicionado!');
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      toast.error('Erro ao adicionar comentário');
    },
  });

  const addAttachment = useMutation({
    mutationFn: async ({ 
      appointment_id, 
      file_name, 
      file_url, 
      file_size, 
      file_type 
    }: { 
      appointment_id: string; 
      file_name: string; 
      file_url: string; 
      file_size?: number; 
      file_type?: string; 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('appointment_attachments')
        .insert({
          appointment_id,
          user_id: user.id,
          file_name,
          file_url,
          file_size,
          file_type,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      toast.success('Arquivo anexado!');
    },
    onError: (error) => {
      console.error('Error adding attachment:', error);
      toast.error('Erro ao anexar arquivo');
    },
  });

  return {
    appointments,
    isLoading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    addComment,
    addAttachment,
  };
};