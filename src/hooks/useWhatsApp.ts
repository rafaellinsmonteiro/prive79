import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useWhatsAppConnection = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['whatsapp-connection', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useWhatsAppNotifications = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['whatsapp-notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('whatsapp_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useConnectWhatsApp = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (phoneNumber: string) => {
      if (!user) throw new Error('User not authenticated');
      
      // Gerar instance ID único
      const instanceId = `user_${user.id}_${Date.now()}`;
      
      // Salvar conexão no banco
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .upsert({
          user_id: user.id,
          phone_number: phoneNumber,
          instance_id: instanceId,
          is_connected: false
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Aqui você integraria com a Evolution API para gerar QR Code
      // Por exemplo: POST /instance/create { instanceName: instanceId }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connection'] });
      toast.success('Conexão WhatsApp iniciada!');
    },
    onError: (error) => {
      console.error('Error connecting WhatsApp:', error);
      toast.error('Erro ao conectar WhatsApp');
    },
  });
};

export const useDisconnectWhatsApp = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('whatsapp_connections')
        .update({ is_connected: false })
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connection'] });
      toast.success('WhatsApp desconectado');
    },
    onError: (error) => {
      console.error('Error disconnecting WhatsApp:', error);
      toast.error('Erro ao desconectar WhatsApp');
    },
  });
};

export const useSendWhatsAppNotification = () => {
  return useMutation({
    mutationFn: async (params: {
      userIds?: string[];
      userType?: 'all' | 'models' | 'clients';
      notificationType: string;
      title: string;
      message: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('whatsapp-notifications', {
        body: params
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Notificações enviadas: ${data.sent} de ${data.total}`);
    },
    onError: (error) => {
      console.error('Error sending notifications:', error);
      toast.error('Erro ao enviar notificações');
    },
  });
};

export const useMirrorChatToWhatsApp = () => {
  return useMutation({
    mutationFn: async (params: {
      userId: string;
      message: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('whatsapp-sender', {
        body: {
          userId: params.userId,
          message: params.message,
          type: 'chat_mirror'
        }
      });
      
      if (error) throw error;
      return data;
    },
    onError: (error) => {
      console.error('Error mirroring to WhatsApp:', error);
    },
  });
};