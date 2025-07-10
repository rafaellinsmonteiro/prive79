import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useLogPrivaBankAction } from './usePrivaBankLogs';

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
  const { logAction } = useLogPrivaBankAction();
  
  return useQuery({
    queryKey: ['user-privabank-account'],
    queryFn: async (): Promise<PrivaBankAccount | null> => {
      console.log('🔍 Buscando conta PriveBank do usuário atual...');
      
      try {
        // First get current user ID
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('❌ Usuário não autenticado');
          await logAction({
            action_type: 'account_access',
            action_details: { reason: 'user_not_authenticated' },
            success: false,
            error_message: 'Usuário não autenticado'
          });
          return null;
        }

        console.log('👤 Usuário atual:', user.id);
        
        const { data, error } = await supabase
          .from('privabank_accounts')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            console.log('❌ Nenhuma conta PriveBank encontrada para o usuário:', user.id);
            await logAction({
              action_type: 'account_access',
              action_details: { user_id: user.id, reason: 'account_not_found' },
              success: false,
              error_message: 'Conta PriveBank não encontrada',
              user_id: user.id
            });
            return null;
          }
          console.error('❌ Erro ao buscar conta PriveBank:', error);
          await logAction({
            action_type: 'account_access',
            action_details: { user_id: user.id, error_code: error.code },
            success: false,
            error_message: error.message,
            user_id: user.id
          });
          throw error;
        }

        console.log('✅ Conta PriveBank encontrada:', data);
        await logAction({
          action_type: 'account_access',
          action_details: { 
            user_id: user.id, 
            account_id: data.id,
            balance: data.balance 
          },
          success: true,
          user_id: user.id
        });
        
        return data;
      } catch (error) {
        console.error('Erro geral ao acessar conta:', error);
        await logAction({
          action_type: 'account_access',
          action_details: { error: String(error) },
          success: false,
          error_message: String(error)
        });
        throw error;
      }
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
  const { logAction } = useLogPrivaBankAction();

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
      console.log('🔄 Iniciando transferência:', { fromAccountId, toUserEmail, amount });
      
      // Log da tentativa de transferência
      await logAction({
        action_type: 'transfer_attempt',
        action_details: {
          fromAccountId,
          toUserEmail,
          amount,
          description
        },
        success: true
      });

      try {

      // Primeiro, encontrar a conta do destinatário pelo email
      console.log('🔍 Buscando usuário destinatário:', toUserEmail);
      const { data: toUser, error: userError } = await supabase
        .from('system_users')
        .select('user_id')
        .eq('email', toUserEmail)
        .maybeSingle();

      if (userError) {
        console.error('❌ Erro ao buscar usuário destinatário:', userError);
        await logAction({
          action_type: 'transfer_attempt',
          action_details: { fromAccountId, toUserEmail, amount, error: 'user_not_found' },
          success: false,
          error_message: 'Usuário destinatário não encontrado'
        });
        throw new Error('Usuário destinatário não encontrado');
      }
      
      if (!toUser) {
        console.error('❌ Usuário destinatário não existe:', toUserEmail);
        await logAction({
          action_type: 'transfer_attempt',
          action_details: { fromAccountId, toUserEmail, amount, error: 'user_does_not_exist' },
          success: false,
          error_message: 'Usuário destinatário não encontrado'
        });
        throw new Error('Usuário destinatário não encontrado');
      }

      console.log('✅ Usuário destinatário encontrado:', toUser);

      console.log('🔍 Buscando conta PriveBank do destinatário...');
      const { data: toAccount, error: accountError } = await supabase
        .from('privabank_accounts')
        .select('id, is_active')
        .eq('user_id', toUser.user_id)
        .maybeSingle();

      if (accountError) {
        console.error('❌ Erro ao buscar conta do destinatário:', accountError);
        await logAction({
          action_type: 'transfer_attempt',
          action_details: { fromAccountId, toUserEmail, amount, error: 'recipient_account_error' },
          success: false,
          error_message: 'Conta PriveBank do destinatário não encontrada'
        });
        throw new Error('Conta PriveBank do destinatário não encontrada');
      }
      
      if (!toAccount) {
        console.error('❌ Conta do destinatário não existe para user_id:', toUser.user_id);
        await logAction({
          action_type: 'transfer_attempt',
          action_details: { fromAccountId, toUserEmail, amount, error: 'recipient_account_not_found' },
          success: false,
          error_message: 'Conta PriveBank do destinatário não encontrada'
        });
        throw new Error('Conta PriveBank do destinatário não encontrada');
      }

      console.log('✅ Conta destinatário encontrada:', toAccount);

      if (!toAccount.is_active) {
        console.error('❌ Conta destinatário inativa');
        await logAction({
          action_type: 'transfer_attempt',
          action_details: { fromAccountId, toUserEmail, amount, error: 'recipient_account_inactive' },
          success: false,
          error_message: 'Conta do destinatário não está ativa'
        });
        throw new Error('Conta do destinatário não está ativa');
      }

      // Verificar saldo da conta origem
      console.log('🔍 Verificando saldo da conta origem:', fromAccountId);
      const { data: fromAccount, error: fromAccountError } = await supabase
        .from('privabank_accounts')
        .select('balance')
        .eq('id', fromAccountId)
        .single();

      if (fromAccountError) {
        console.error('❌ Erro ao buscar conta origem:', fromAccountError);
        await logAction({
          action_type: 'transfer_attempt',
          action_details: { fromAccountId, toUserEmail, amount, error: 'source_account_error' },
          success: false,
          error_message: 'Conta de origem não encontrada'
        });
        throw new Error('Conta de origem não encontrada');
      }
      
      if (!fromAccount) {
        console.error('❌ Conta origem não existe:', fromAccountId);
        await logAction({
          action_type: 'transfer_attempt',
          action_details: { fromAccountId, toUserEmail, amount, error: 'source_account_not_found' },
          success: false,
          error_message: 'Conta de origem não encontrada'
        });
        throw new Error('Conta de origem não encontrada');
      }

      console.log('✅ Conta origem encontrada. Saldo:', fromAccount.balance);

      if (Number(fromAccount.balance) < amount) {
        console.error('❌ Saldo insuficiente. Saldo atual:', fromAccount.balance, 'Valor transferência:', amount);
        await logAction({
          action_type: 'transfer_attempt',
          action_details: { 
            fromAccountId, 
            toUserEmail, 
            amount, 
            currentBalance: fromAccount.balance,
            error: 'insufficient_balance' 
          },
          success: false,
          error_message: 'Saldo insuficiente para transferência'
        });
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
        await logAction({
          action_type: 'transfer_attempt',
          action_details: { fromAccountId, toUserEmail, amount, error: 'transaction_creation_failed' },
          success: false,
          error_message: 'Erro ao criar transação de transferência'
        });
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
        await logAction({
          action_type: 'transfer_attempt',
          action_details: { fromAccountId, toUserEmail, amount, error: 'debit_failed' },
          success: false,
          error_message: 'Erro ao debitar da conta origem'
        });
        throw new Error('Erro ao debitar da conta origem');
      }

      // Creditar na conta destino
      const { data: currentToAccount, error: currentToAccountError } = await supabase
        .from('privabank_accounts')
        .select('balance')
        .eq('id', toAccount.id)
        .single();

      if (currentToAccountError) {
        await logAction({
          action_type: 'transfer_attempt',
          action_details: { fromAccountId, toUserEmail, amount, error: 'get_recipient_balance_failed' },
          success: false,
          error_message: 'Erro ao obter saldo da conta destino'
        });
        throw new Error('Erro ao obter saldo da conta destino');
      }

      const newToBalance = Number(currentToAccount.balance) + amount;
      const { error: updateToError } = await supabase
        .from('privabank_accounts')
        .update({ balance: newToBalance })
        .eq('id', toAccount.id);

      if (updateToError) {
        console.error('Error updating to account balance:', updateToError);
        await logAction({
          action_type: 'transfer_attempt',
          action_details: { fromAccountId, toUserEmail, amount, error: 'credit_failed' },
          success: false,
          error_message: 'Erro ao creditar na conta destino'
        });
        throw new Error('Erro ao creditar na conta destino');
      }

      console.log('Transfer completed successfully:', transaction);
      
      // Log de sucesso da transferência
      await logAction({
        action_type: 'transfer_success',
        action_details: {
          fromAccountId,
          toAccountId: toAccount.id,
          toUserEmail,
          amount,
          transactionId: transaction.id,
          description
        },
        success: true
      });
      
      return transaction;
      
      } catch (error) {
        // Log de erro geral se não foi capturado antes
        console.error('Erro geral na transferência:', error);
        await logAction({
          action_type: 'transfer_attempt',
          action_details: { 
            fromAccountId, 
            toUserEmail, 
            amount, 
            error: 'general_error',
            errorMessage: String(error)
          },
          success: false,
          error_message: String(error)
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privabank-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['privabank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['user-privabank-account'] });
    },
  });
};

export const useTransferByAccountId = () => {
  const queryClient = useQueryClient();
  const { logAction } = useLogPrivaBankAction();

  return useMutation({
    mutationFn: async ({ 
      fromAccountId, 
      toAccountId, 
      amount, 
      description 
    }: { 
      fromAccountId: string; 
      toAccountId: string; 
      amount: number; 
      description?: string;
    }) => {
      console.log('🔄 Iniciando transferência por ID:', { fromAccountId, toAccountId, amount });
      
      // Log da tentativa de transferência
      await logAction({
        action_type: 'transfer_by_id_attempt',
        action_details: {
          fromAccountId,
          toAccountId,
          amount,
          description
        },
        success: true
      });

      try {
        // Verificar se a conta de destino existe e está ativa
        console.log('🔍 Verificando conta destinatário:', toAccountId);
        const { data: toAccount, error: accountError } = await supabase
          .from('privabank_accounts')
          .select('id, is_active, user_id')
          .eq('id', toAccountId)
          .maybeSingle();

        if (accountError) {
          console.error('❌ Erro ao buscar conta destinatário:', accountError);
          await logAction({
            action_type: 'transfer_by_id_attempt',
            action_details: { fromAccountId, toAccountId, amount, error: 'recipient_account_error' },
            success: false,
            error_message: 'Conta PriveBank destinatário não encontrada'
          });
          throw new Error('Conta PriveBank destinatário não encontrada');
        }
        
        if (!toAccount) {
          console.error('❌ Conta destinatário não existe:', toAccountId);
          await logAction({
            action_type: 'transfer_by_id_attempt',
            action_details: { fromAccountId, toAccountId, amount, error: 'recipient_account_not_found' },
            success: false,
            error_message: 'Conta PriveBank destinatário não encontrada'
          });
          throw new Error('Conta PriveBank destinatário não encontrada');
        }

        if (!toAccount.is_active) {
          console.error('❌ Conta destinatário inativa');
          await logAction({
            action_type: 'transfer_by_id_attempt',
            action_details: { fromAccountId, toAccountId, amount, error: 'recipient_account_inactive' },
            success: false,
            error_message: 'Conta do destinatário não está ativa'
          });
          throw new Error('Conta do destinatário não está ativa');
        }

        // Verificar se não está tentando transferir para a mesma conta
        if (fromAccountId === toAccountId) {
          await logAction({
            action_type: 'transfer_by_id_attempt',
            action_details: { fromAccountId, toAccountId, amount, error: 'same_account_transfer' },
            success: false,
            error_message: 'Não é possível transferir para a mesma conta'
          });
          throw new Error('Não é possível transferir para a mesma conta');
        }

        console.log('✅ Conta destinatário encontrada:', toAccount);

        // Verificar saldo da conta origem
        console.log('🔍 Verificando saldo da conta origem:', fromAccountId);
        const { data: fromAccount, error: fromAccountError } = await supabase
          .from('privabank_accounts')
          .select('balance, user_id')
          .eq('id', fromAccountId)
          .single();

        if (fromAccountError) {
          console.error('❌ Erro ao buscar conta origem:', fromAccountError);
          await logAction({
            action_type: 'transfer_by_id_attempt',
            action_details: { fromAccountId, toAccountId, amount, error: 'source_account_error' },
            success: false,
            error_message: 'Conta de origem não encontrada'
          });
          throw new Error('Conta de origem não encontrada');
        }
        
        if (!fromAccount) {
          console.error('❌ Conta origem não existe:', fromAccountId);
          await logAction({
            action_type: 'transfer_by_id_attempt',
            action_details: { fromAccountId, toAccountId, amount, error: 'source_account_not_found' },
            success: false,
            error_message: 'Conta de origem não encontrada'
          });
          throw new Error('Conta de origem não encontrada');
        }

        console.log('✅ Conta origem encontrada. Saldo:', fromAccount.balance);

        if (Number(fromAccount.balance) < amount) {
          console.error('❌ Saldo insuficiente. Saldo atual:', fromAccount.balance, 'Valor transferência:', amount);
          await logAction({
            action_type: 'transfer_by_id_attempt',
            action_details: { 
              fromAccountId, 
              toAccountId, 
              amount, 
              currentBalance: fromAccount.balance,
              error: 'insufficient_balance' 
            },
            success: false,
            error_message: 'Saldo insuficiente para transferência'
          });
          throw new Error('Saldo insuficiente para transferência');
        }

        // Criar a transação de transferência
        const { data: transaction, error: transactionError } = await supabase
          .from('privabank_transactions')
          .insert({
            from_account_id: fromAccountId,
            to_account_id: toAccountId,
            transaction_type: 'transfer',
            amount,
            description: description || `Transferência via ID da carteira`,
            status: 'completed'
          })
          .select()
          .single();

        if (transactionError) {
          console.error('Error creating transfer transaction:', transactionError);
          await logAction({
            action_type: 'transfer_by_id_attempt',
            action_details: { fromAccountId, toAccountId, amount, error: 'transaction_creation_failed' },
            success: false,
            error_message: 'Erro ao criar transação de transferência'
          });
          throw new Error('Erro ao criar transação de transferência');
        }

        // Atualizar saldos das contas
        // Debitar da conta origem
        const newFromBalance = Number(fromAccount.balance) - amount;
        const { error: updateFromError } = await supabase
          .from('privabank_accounts')
          .update({ balance: newFromBalance })
          .eq('id', fromAccountId);

        if (updateFromError) {
          console.error('Error updating from account balance:', updateFromError);
          await logAction({
            action_type: 'transfer_by_id_attempt',
            action_details: { fromAccountId, toAccountId, amount, error: 'debit_failed' },
            success: false,
            error_message: 'Erro ao debitar da conta origem'
          });
          throw new Error('Erro ao debitar da conta origem');
        }

        // Creditar na conta destino
        const { data: currentToAccount, error: currentToAccountError } = await supabase
          .from('privabank_accounts')
          .select('balance')
          .eq('id', toAccountId)
          .single();

        if (currentToAccountError) {
          await logAction({
            action_type: 'transfer_by_id_attempt',
            action_details: { fromAccountId, toAccountId, amount, error: 'get_recipient_balance_failed' },
            success: false,
            error_message: 'Erro ao obter saldo da conta destino'
          });
          throw new Error('Erro ao obter saldo da conta destino');
        }

        const newToBalance = Number(currentToAccount.balance) + amount;
        const { error: updateToError } = await supabase
          .from('privabank_accounts')
          .update({ balance: newToBalance })
          .eq('id', toAccountId);

        if (updateToError) {
          console.error('Error updating to account balance:', updateToError);
          await logAction({
            action_type: 'transfer_by_id_attempt',
            action_details: { fromAccountId, toAccountId, amount, error: 'credit_failed' },
            success: false,
            error_message: 'Erro ao creditar na conta destino'
          });
          throw new Error('Erro ao creditar na conta destino');
        }

        console.log('Transfer by ID completed successfully:', transaction);
        
        // Log de sucesso da transferência
        await logAction({
          action_type: 'transfer_by_id_success',
          action_details: {
            fromAccountId,
            toAccountId,
            amount,
            transactionId: transaction.id,
            description
          },
          success: true
        });
        
        return transaction;
        
      } catch (error) {
        // Log de erro geral se não foi capturado antes
        console.error('Erro geral na transferência por ID:', error);
        await logAction({
          action_type: 'transfer_by_id_attempt',
          action_details: { 
            fromAccountId, 
            toAccountId, 
            amount, 
            error: 'general_error',
            errorMessage: String(error)
          },
          success: false,
          error_message: String(error)
        });
        throw error;
      }
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