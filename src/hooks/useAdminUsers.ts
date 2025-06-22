
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
      
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Auto-confirm the email
      });

      if (authError) {
        console.error('Auth user creation failed:', authError);
        throw authError;
      }

      console.log('Auth user created:', authData.user?.id);

      // Then create the system user record with the auth user ID
      const { password, ...systemUserData } = userData;
      const systemUser = {
        ...systemUserData,
        user_id: authData.user?.id,
      };

      const { data: systemData, error: systemError } = await supabase
        .from('system_users')
        .insert(systemUser)
        .select()
        .single();

      if (systemError) {
        console.error('System user creation failed:', systemError);
        // If system user creation fails, we should clean up by deleting the auth user
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.error('Failed to cleanup auth user:', cleanupError);
        }
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
      
      // Get the current user data to find the auth user_id
      const { data: currentUser, error: fetchError } = await supabase
        .from('system_users')
        .select('user_id')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Failed to fetch current user:', fetchError);
        throw fetchError;
      }

      // Update password in auth if provided and user_id exists
      if (password && currentUser.user_id) {
        console.log('Updating password for auth user:', currentUser.user_id);
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          currentUser.user_id,
          { password }
        );

        if (passwordError) {
          console.error('Failed to update password:', passwordError);
          throw passwordError;
        }
      }

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
      
      // Get the current user data to find the auth user_id
      const { data: currentUser, error: fetchError } = await supabase
        .from('system_users')
        .select('user_id')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Failed to fetch user for deletion:', fetchError);
        throw fetchError;
      }

      // Delete from system_users first
      const { error: systemError } = await supabase
        .from('system_users')
        .delete()
        .eq('id', id);

      if (systemError) {
        console.error('Failed to delete system user:', systemError);
        throw systemError;
      }

      // Delete from auth if user_id exists
      if (currentUser.user_id) {
        console.log('Deleting auth user:', currentUser.user_id);
        const { error: authError } = await supabase.auth.admin.deleteUser(currentUser.user_id);
        
        if (authError) {
          console.error('Failed to delete auth user:', authError);
          // Don't throw here as the system user is already deleted
          // This prevents orphaned auth users but doesn't fail the operation
        }
      }

      console.log('User deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};
