import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

type PrivaBankLog = Tables<'privabank_logs'>;
type PrivaBankLogInsert = TablesInsert<'privabank_logs'>;

export const usePrivaBankLogs = (limit = 100) => {
  return useQuery({
    queryKey: ['privabank-logs', limit],
    queryFn: async (): Promise<PrivaBankLog[]> => {
      console.log('📊 Buscando logs do PriveBank...');
      
      const { data, error } = await supabase
        .from('privabank_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Erro ao buscar logs do PriveBank:', error);
        throw error;
      }

      console.log('✅ Logs PriveBank carregados:', data?.length);
      return data || [];
    },
  });
};

export const useCreatePrivaBankLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logData: Omit<PrivaBankLogInsert, 'created_at'>) => {
      console.log('📝 Criando log PriveBank:', logData);
      
      const { data, error } = await supabase
        .from('privabank_logs')
        .insert(logData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar log PriveBank:', error);
        throw error;
      }

      console.log('✅ Log PriveBank criado:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privabank-logs'] });
    },
  });
};

// Hook para logar ações do PriveBank
export const useLogPrivaBankAction = () => {
  const createLog = useCreatePrivaBankLog();

  const logAction = async ({
    action_type,
    action_details,
    success = true,
    error_message,
    user_id
  }: {
    action_type: string;
    action_details?: any;
    success?: boolean;
    error_message?: string;
    user_id?: string;
  }) => {
    try {
      // Obter user_id atual se não fornecido
      let currentUserId = user_id;
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        currentUserId = user?.id;
      }

      await createLog.mutateAsync({
        user_id: currentUserId,
        action_type,
        action_details: action_details ? JSON.stringify(action_details) : null,
        success,
        error_message,
        ip_address: null, // Could be enhanced to capture real IP
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Erro ao registrar log:', error);
    }
  };

  return { logAction, isLogging: createLog.isPending };
};