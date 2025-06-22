import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type SystemUser = Tables<'system_users'> & {
  plans?: Tables<'plans'> | null;
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<SystemUser[]> => {
      console.log('Fetching admin users...');
      
      // First get all users
      const { data: users, error: usersError } = await supabase
        .from('system_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      // Then get plans separately and join them
      const { data: plans, error: plansError } = await supabase
        .from('plans')
        .select('*');

      if (plansError) {
        console.error('Error fetching plans:', plansError);
        throw plansError;
      }

      // Manually join the data
      const usersWithPlans = users.map(user => ({
        ...user,
        plans: user.plan_id ? plans.find(plan => plan.id === user.plan_id) || null : null
      }));

      console.log('Fetched users with plans:', usersWithPlans);
      return usersWithPlans;
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: TablesInsert<'system_users'> & { password: string }) => {
      console.log('Creating user with data:', userData);
      
      try {
        // Get current session to send auth token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Não autenticado');
        }

        // Call the Edge Function to create user
        const response = await fetch('https://hhpcrtpevucuucoiodxh.supabase.co/functions/v1/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(userData),
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Erro ao criar usuário');
        }

        console.log('User created successfully:', result.user);
        return result.user;
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
