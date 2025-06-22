
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
    mutationFn: async (userData: TablesInsert<'system_users'> & { password?: string }) => {
      const { password, ...userSystemData } = userData;
      
      // First create the auth user if password is provided
      let authUserId = null;
      if (password && userData.email) {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: password,
          email_confirm: true,
        });

        if (authError) throw authError;
        authUserId = authData.user?.id;
      }

      // Then create the system user record
      const { data, error } = await supabase
        .from('system_users')
        .insert({
          ...userSystemData,
          user_id: authUserId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
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
      // Update auth user password if provided
      if (password) {
        const user = await supabase
          .from('system_users')
          .select('user_id')
          .eq('id', id)
          .single();

        if (user.data?.user_id) {
          const { error: authError } = await supabase.auth.admin.updateUserById(
            user.data.user_id,
            { password: password }
          );
          if (authError) throw authError;
        }
      }

      // Update system user record
      const { data, error } = await supabase
        .from('system_users')
        .update(userData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
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
      const { error } = await supabase
        .from('system_users')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};
