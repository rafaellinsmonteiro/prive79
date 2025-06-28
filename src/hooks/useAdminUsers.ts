
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type SystemUser = Tables<'system_users'> & {
  plans?: Tables<'plans'> | null;
  model_profiles?: (Tables<'model_profiles'> & {
    models?: Tables<'models'> | null;
  })[] | null;
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

      // Get model profiles with associated models
      const { data: modelProfiles, error: modelProfilesError } = await supabase
        .from('model_profiles')
        .select(`
          *,
          models (*)
        `);

      if (modelProfilesError) {
        console.error('Error fetching model profiles:', modelProfilesError);
        throw modelProfilesError;
      }

      // Manually join the data
      const usersWithRelations = users.map(user => ({
        ...user,
        plans: user.plan_id ? plans.find(plan => plan.id === user.plan_id) || null : null,
        model_profiles: modelProfiles.filter(profile => profile.user_id === user.user_id) || null
      }));

      console.log('Fetched users with relations:', usersWithRelations);
      return usersWithRelations;
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: TablesInsert<'system_users'> & { password: string; model_id?: string }) => {
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

        // If user is a modelo and has model_id, create model_profile
        if (userData.user_role === 'modelo' && userData.model_id && result.user?.user_id) {
          const { error: profileError } = await supabase
            .from('model_profiles')
            .insert({
              user_id: result.user.user_id,
              model_id: userData.model_id,
              is_active: true
            });

          if (profileError) {
            console.error('Error creating model profile:', profileError);
            // Don't throw error here, user is created successfully
          }
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
    mutationFn: async ({ id, password, model_id, ...userData }: TablesUpdate<'system_users'> & { id: string; password?: string; model_id?: string }) => {
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

        // Handle model profile association
        if (userData.user_role === 'modelo' && systemData.user_id) {
          // Remove existing model profiles for this user
          await supabase
            .from('model_profiles')
            .delete()
            .eq('user_id', systemData.user_id);

          // Create new model profile if model_id is provided
          if (model_id && model_id !== 'no_model') {
            const { error: profileError } = await supabase
              .from('model_profiles')
              .insert({
                user_id: systemData.user_id,
                model_id: model_id,
                is_active: true
              });

            if (profileError) {
              console.error('Error updating model profile:', profileError);
            }
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
