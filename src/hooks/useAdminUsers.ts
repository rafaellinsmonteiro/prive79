
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
      
      // Create the system user record directly without creating auth user
      // The auth user will be created when they first login
      const { password, ...systemUserData } = userData;
      
      const { data: systemData, error: systemError } = await supabase
        .from('system_users')
        .insert(systemUserData)
        .select()
        .single();

      if (systemError) {
        console.error('System user creation failed:', systemError);
        throw systemError;
      }

      console.log('System user created:', systemData);
      return systemData;
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
      
      // Update system user record
      const { data, error } = await supabase
        .from('system_users')
        .update(userData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Failed to update system user:', error);
        throw error;
      }

      console.log('User updated successfully:', data);
      return data;
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
      
      // Delete from system_users
      const { error: systemError } = await supabase
        .from('system_users')
        .delete()
        .eq('id', id);

      if (systemError) {
        console.error('Failed to delete system user:', systemError);
        throw systemError;
      }

      console.log('User deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};
