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

export const useTransferBetweenAccounts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      fromAccountId, 
      toUserEmail, 
      amount, 
      description 
    }: { 
      fromAccountId: string; 
      toUserEmail: string; 
      amount: number; 
      description?: string;
    }) => {
      console.log('Processing transfer:', { fromAccountId, toUserEmail, amount });

      // Primeiro, encontrar a conta do destinatário pelo email
      const { data: toUser, error: userError } = await supabase
        .from('system_users')
        .select('user_id')
        .eq('email', toUserEmail)
        .single();

      if (userError || !toUser) {
        throw new Error('Usuário destinatário não encontrado');
      }

      const { data: toAccount, error: accountError } = await supabase
        .from('privabank_accounts')
        .select('id, is_active')
        .eq('user_id', toUser.user_id)
        .single();

      if (accountError || !toAccount) {
        throw new Error('Conta PriveBank do destinatário não encontrada');
      }

      if (!toAccount.is_active) {
        throw new Error('Conta do destinatário não está ativa');
      }

      // Verificar saldo da conta origem
      const { data: fromAccount, error: fromAccountError } = await supabase
        .from('privabank_accounts')
        .select('balance')
        .eq('id', fromAccountId)
        .single();

      if (fromAccountError || !fromAccount) {
        throw new Error('Conta de origem não encontrada');
      }

      if (Number(fromAccount.balance) < amount) {
        throw new Error('Saldo insuficiente para transferência');
      }

      // Criar a transação de transferência
      const { data: transaction, error: transactionError } = await supabase
        .from('privabank_transactions')
        .insert({
          from_account_id: fromAccountId,
          to_account_id: toAccount.id,
          transaction_type: 'transfer',
          amount,
          description: description || `Transferência para ${toUserEmail}`,
          status: 'completed'
        })
        .select()
        .single();

      if (transactionError) {
        console.error('Error creating transfer transaction:', transactionError);
        throw new Error('Erro ao criar transação de transferência');
      }

      // Atualizar saldos das contas (isso deveria idealmente ser feito com uma stored procedure)
      // Debitar da conta origem
      const newFromBalance = Number(fromAccount.balance) - amount;
      const { error: updateFromError } = await supabase
        .from('privabank_accounts')
        .update({ balance: newFromBalance })
        .eq('id', fromAccountId);

      if (updateFromError) {
        console.error('Error updating from account balance:', updateFromError);
        throw new Error('Erro ao debitar da conta origem');
      }

      // Creditar na conta destino
      const { data: currentToAccount, error: currentToAccountError } = await supabase
        .from('privabank_accounts')
        .select('balance')
        .eq('id', toAccount.id)
        .single();

      if (currentToAccountError) {
        throw new Error('Erro ao obter saldo da conta destino');
      }

      const newToBalance = Number(currentToAccount.balance) + amount;
      const { error: updateToError } = await supabase
        .from('privabank_accounts')
        .update({ balance: newToBalance })
        .eq('id', toAccount.id);

      if (updateToError) {
        console.error('Error updating to account balance:', updateToError);
        throw new Error('Erro ao creditar na conta destino');
      }

      console.log('Transfer completed successfully:', transaction);
      return transaction;
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

// Hook principal para usuários
export const usePrivaBank = () => {
  const account = useUserPrivaBankAccount();
  const transactions = usePrivaBankTransactions(account.data?.id);
  const createTransaction = useCreatePrivaBankTransaction();

  return {
    account: account.data,
    transactions: transactions.data,
    isLoading: account.isLoading || transactions.isLoading,
    createTransaction: createTransaction.mutateAsync,
    isCreatingTransaction: createTransaction.isPending
  };
};