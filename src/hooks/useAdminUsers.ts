
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
        // 1. Primeiro, criar o usuário na tabela de autenticação
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true, // Confirma o email automaticamente
        });

        if (authError) {
          console.error('Auth user creation failed:', authError);
          throw new Error(`Erro ao criar usuário de autenticação: ${authError.message}`);
        }

        console.log('Auth user created:', authData.user);

        // 2. Depois, criar o registro na tabela system_users
        const { password, ...systemUserData } = userData;
        const systemUserPayload = {
          ...systemUserData,
          user_id: authData.user.id, // Vincular com o usuário de autenticação
        };

        const { data: systemData, error: systemError } = await supabase
          .from('system_users')
          .insert(systemUserPayload)
          .select()
          .single();

        if (systemError) {
          console.error('System user creation failed:', systemError);
          
          // Se falhar na criação do system_user, tentar limpar o usuário de auth criado
          try {
            await supabase.auth.admin.deleteUser(authData.user.id);
          } catch (cleanupError) {
            console.error('Failed to cleanup auth user:', cleanupError);
          }
          
          throw new Error(`Erro ao criar usuário do sistema: ${systemError.message}`);
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
        // 1. Atualizar a tabela system_users
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

        // 2. Se uma nova senha foi fornecida, atualizar no auth também
        if (password && systemData.user_id) {
          const { error: authError } = await supabase.auth.admin.updateUserById(
            systemData.user_id,
            { password: password }
          );

          if (authError) {
            console.error('Failed to update auth user password:', authError);
            // Não falhar a operação inteira por causa da senha, apenas avisar
            console.warn('Password update failed, but user data was updated successfully');
          } else {
            console.log('Auth user password updated successfully');
          }
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
        // 1. Primeiro, buscar o user_id do auth
        const { data: systemUser, error: fetchError } = await supabase
          .from('system_users')
          .select('user_id')
          .eq('id', id)
          .single();

        if (fetchError) {
          console.error('Failed to fetch system user:', fetchError);
          throw new Error(`Erro ao buscar usuário: ${fetchError.message}`);
        }

        // 2. Deletar da tabela system_users
        const { error: systemError } = await supabase
          .from('system_users')
          .delete()
          .eq('id', id);

        if (systemError) {
          console.error('Failed to delete system user:', systemError);
          throw new Error(`Erro ao deletar usuário do sistema: ${systemError.message}`);
        }

        // 3. Se existe user_id, deletar também do auth
        if (systemUser.user_id) {
          const { error: authError } = await supabase.auth.admin.deleteUser(systemUser.user_id);
          
          if (authError) {
            console.error('Failed to delete auth user:', authError);
            console.warn('Auth user deletion failed, but system user was deleted');
          } else {
            console.log('Auth user deleted successfully');
          }
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
