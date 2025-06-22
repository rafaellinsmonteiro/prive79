
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
        const { password, ...systemUserData } = userData;
        
        // Primeiro, criar o usuário no sistema de autenticação do Supabase
        console.log('Creating auth user for:', systemUserData.email);
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: systemUserData.email,
          password: password,
          email_confirm: true, // Auto-confirma o email para não precisar de verificação
          user_metadata: {
            name: systemUserData.name,
            user_role: systemUserData.user_role,
          }
        });

        if (authError) {
          console.error('Auth user creation failed:', authError);
          throw new Error(`Erro ao criar usuário de autenticação: ${authError.message}`);
        }

        console.log('Auth user created:', authData.user?.id);

        // Agora criar o registro na tabela system_users com o user_id
        const { data: systemData, error: systemError } = await supabase
          .from('system_users')
          .insert({
            ...systemUserData,
            user_id: authData.user?.id,
          })
          .select()
          .single();

        if (systemError) {
          console.error('System user creation failed:', systemError);
          // Se falhar ao criar o system_user, tentar limpar o usuário de auth criado
          try {
            await supabase.auth.admin.deleteUser(authData.user?.id || '');
          } catch (cleanupError) {
            console.error('Failed to cleanup auth user:', cleanupError);
          }
          throw new Error(`Erro ao criar usuário no sistema: ${systemError.message}`);
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
