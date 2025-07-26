import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface PixDeposit {
  id: string;
  user_id: string;
  amount: number;
  pix_id: string;
  status: string;
  br_code: string | null;
  expires_at: string | null;
  processed: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserPixDeposits = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-pix-deposits', user?.id],
    queryFn: async (): Promise<PixDeposit[]> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('pix_deposits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
};

export const useCheckPixStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (pixId: string) => {
      const { data, error } = await supabase.functions.invoke('abacatepay-pix', {
        body: { action: 'status', pixId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, pixId) => {
      // Invalidar queries para atualizar a UI
      queryClient.invalidateQueries({ queryKey: ['user-pix-deposits'] });
      queryClient.invalidateQueries({ queryKey: ['user-privabank-account'] });
      
      if (data.status === 'PAID') {
        toast({
          title: "PIX Pago!",
          description: "Seu PIX foi pago com sucesso e o valor foi creditado em sua conta.",
          variant: "default"
        });
      }
    }
  });
};

export const useProcessPixPayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ pixId, amount, userId }: { pixId: string; amount: number; userId: string }) => {
      // Primeiro atualizar o status do PIX deposit
      const { error: updatePixError } = await supabase
        .from('pix_deposits')
        .update({ 
          status: 'PAID', 
          processed: true 
        })
        .eq('pix_id', pixId);

      if (updatePixError) throw updatePixError;

      // Buscar a conta PrivaBank do usuário
      const { data: account, error: accountError } = await supabase
        .from('privabank_accounts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (accountError) throw accountError;

      // Atualizar o saldo em Reais
      const newBalanceBrl = Number(account.balance_brl) + amount;
      const { error: updateBalanceError } = await supabase
        .from('privabank_accounts')
        .update({ balance_brl: newBalanceBrl })
        .eq('id', account.id);

      if (updateBalanceError) throw updateBalanceError;

      // Criar transação de depósito PIX
      const { error: transactionError } = await supabase
        .from('privabank_transactions')
        .insert({
          to_account_id: account.id,
          amount: amount,
          transaction_type: 'deposit_pix',
          description: `Depósito PIX - R$ ${amount.toFixed(2)}`,
          status: 'completed',
          currency: 'BRL'
        });

      if (transactionError) throw transactionError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-pix-deposits'] });
      queryClient.invalidateQueries({ queryKey: ['user-privabank-account'] });
      queryClient.invalidateQueries({ queryKey: ['privabank-transactions'] });
      
      toast({
        title: "PIX Processado!",
        description: "Seu depósito PIX foi processado e creditado em sua conta.",
        variant: "default"
      });
    }
  });
};