import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type PrivaBankAccount = Tables<'privabank_accounts'>;
type PrivaBankTransaction = Tables<'privabank_transactions'>;

export const usePrivaBankAccounts = () => {
  return useQuery({
    queryKey: ['privabank-accounts'],
    queryFn: async (): Promise<(PrivaBankAccount & { user_name?: string; user_email?: string })[]> => {
      console.log('Fetching PrivaBank accounts...');
      
      const { data: accounts, error } = await supabase
        .from('privabank_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching PrivaBank accounts:', error);
        throw error;
      }

      // Buscar informações dos usuários
      const { data: users, error: usersError } = await supabase
        .from('system_users')
        .select('user_id, name, email');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      // Fazer join manual dos dados
      const accountsWithUsers = accounts.map(account => {
        const user = users.find(u => u.user_id === account.user_id);
        return {
          ...account,
          user_name: user?.name || 'Usuário não encontrado',
          user_email: user?.email || 'Email não encontrado'
        };
      });

      console.log('Fetched PrivaBank accounts with users:', accountsWithUsers);
      return accountsWithUsers;
    },
  });
};

export const usePrivaBankTransactions = (accountId?: string) => {
  return useQuery({
    queryKey: ['privabank-transactions', accountId],
    queryFn: async (): Promise<PrivaBankTransaction[]> => {
      console.log('Fetching PrivaBank transactions for account:', accountId);
      
      let query = supabase
        .from('privabank_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (accountId) {
        query = query.or(`from_account_id.eq.${accountId},to_account_id.eq.${accountId}`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching PrivaBank transactions:', error);
        throw error;
      }

      console.log('Fetched PrivaBank transactions:', data);
      return data || [];
    },
    enabled: !!accountId,
  });
};

export const useUserPrivaBankAccount = () => {
  return useQuery({
    queryKey: ['user-privabank-account'],
    queryFn: async (): Promise<PrivaBankAccount | null> => {
      console.log('Fetching user PrivaBank account...');
      
      const { data, error } = await supabase
        .from('privabank_accounts')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No account found
          return null;
        }
        console.error('Error fetching user PrivaBank account:', error);
        throw error;
      }

      console.log('Fetched user PrivaBank account:', data);
      return data;
    },
  });
};

export const useCreatePrivaBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user_id, initial_balance = 0 }: { user_id: string; initial_balance?: number }) => {
      console.log('Creating PrivaBank account for user:', user_id, 'with balance:', initial_balance);
      
      const { data, error } = await supabase
        .from('privabank_accounts')
        .insert({
          user_id,
          balance: initial_balance,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating PrivaBank account:', error);
        throw error;
      }

      console.log('PrivaBank account created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privabank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['user-privabank-account'] });
    },
  });
};

export const useUpdatePrivaBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'privabank_accounts'> & { id: string }) => {
      console.log('Updating PrivaBank account:', id, 'with data:', updates);
      
      const { data, error } = await supabase
        .from('privabank_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating PrivaBank account:', error);
        throw error;
      }

      console.log('PrivaBank account updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privabank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['user-privabank-account'] });
    },
  });
};

export const useCreatePrivaBankTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionData: TablesInsert<'privabank_transactions'>) => {
      console.log('Creating PrivaBank transaction:', transactionData);
      
      const { data, error } = await supabase
        .from('privabank_transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) {
        console.error('Error creating PrivaBank transaction:', error);
        throw error;
      }

      console.log('PrivaBank transaction created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privabank-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['privabank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['user-privabank-account'] });
    },
  });
};

export const useDeletePrivaBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting PrivaBank account:', id);
      
      const { error } = await supabase
        .from('privabank_accounts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting PrivaBank account:', error);
        throw error;
      }

      console.log('PrivaBank account deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privabank-accounts'] });
    },
  });
};