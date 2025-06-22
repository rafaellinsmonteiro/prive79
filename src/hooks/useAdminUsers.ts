
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type SystemUser = Tables<'system_users'> & {
  plans?: Tables<'plans'>;
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_users')
        .select(`
          *,
          plans (
            id,
            name,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SystemUser[];
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: TablesInsert<'system_users'> & { password: string }) => {
      console.log('Creating user with data:', userData);
      
      try {
        // Criar apenas na tabela system_users
        // O usuário poderá se registrar depois usando o email e senha fornecidos
        const { password, ...systemUserData } = userData;
        
        const { data: systemData, error: systemError } = await supabase
          .from('system_users')
          .insert({
            ...systemUserData,
            // Não definimos user_id ainda - será preenchido quando o usuário fizer login
          })
          .select()
          .single();

        if (systemError) {
          console.error('System user creation failed:', systemError);
          throw new Error(`Erro ao criar usuário: ${systemError.message}`);
        }

        console.log('System user created:', systemData);
        return systemData;
      } catch (error) {
        console.error('User creation failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, password, ...userData }: TablesUpdate<'system_users'> & { id: string; password?: string }) => {
      console.log('Updating user:', id, 'with data:', userData);
      
      try {
        // Atualizar apenas a tabela system_users
        const { data: systemData, error: systemError } = await supabase
          .from('system_users')
          .update(userData)
          .eq('id', id)
          .select()
          .single();

        if (systemError) {
          console.error('Failed to update system user:', systemError);
          throw new Error(`Erro ao atualizar usuário: ${systemError.message}`);
        }

        console.log('User updated successfully:', systemData);
        return systemData;
      } catch (error) {
        console.error('User update failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting user:', id);
      
      try {
        // Deletar apenas da tabela system_users
        const { error: systemError } = await supabase
          .from('system_users')
          .delete()
          .eq('id', id);

        if (systemError) {
          console.error('Failed to delete system user:', systemError);
          throw new Error(`Erro ao deletar usuário: ${systemError.message}`);
        }

        console.log('User deleted successfully');
      } catch (error) {
        console.error('User deletion failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};
