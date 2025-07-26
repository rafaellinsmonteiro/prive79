import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, Search, Eye, Plus, Edit, DollarSign, Clock, Activity, UserPlus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import UserSearchActivateBank from './UserSearchActivateBank';

type BankAccount = {
  id: string;
  user_id: string;
  balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
  user_role?: string;
  transaction_count?: number;
  last_transaction?: string;
};

const BankAccountsManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['admin-bank-accounts', searchTerm],
    queryFn: async (): Promise<BankAccount[]> => {
      // Buscar contas do PriveBank
      const { data: accountsData, error } = await supabase
        .from('privabank_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar dados dos usuários e estatísticas
      const accountsWithDetails = await Promise.all(
        (accountsData || []).map(async (account) => {
          // Buscar dados do usuário
          const { data: userData } = await supabase
            .from('system_users')
            .select('user_role, email, name')
            .eq('user_id', account.user_id)
            .single();

          // Contar transações
          const { count: transactionCount } = await supabase
            .from('privabank_transactions')
            .select('*', { count: 'exact', head: true })
            .or(`from_account_id.eq.${account.id},to_account_id.eq.${account.id}`);

          // Última transação
          const { data: lastTransaction } = await supabase
            .from('privabank_transactions')
            .select('created_at')
            .or(`from_account_id.eq.${account.id},to_account_id.eq.${account.id}`)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            ...account,
            user_name: userData?.name || 'N/A',
            user_email: userData?.email || 'N/A',
            user_role: userData?.user_role || 'cliente',
            transaction_count: transactionCount || 0,
            last_transaction: lastTransaction?.[0]?.created_at || null,
          };
        })
      );

      // Filtrar por termo de busca
      if (searchTerm) {
        return accountsWithDetails.filter(account => 
          account.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return accountsWithDetails;
    },
  });

  const { data: accountDetails } = useQuery({
    queryKey: ['admin-bank-account-details', selectedAccount],
    queryFn: async () => {
      if (!selectedAccount) return null;

      // Buscar transações da conta
      const { data: transactions } = await supabase
        .from('privabank_transactions')
        .select('*')
        .or(`from_account_id.eq.${selectedAccount},to_account_id.eq.${selectedAccount}`)
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        transactions: transactions || [],
      };
    },
    enabled: !!selectedAccount,
  });

  if (isLoading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <p className="text-zinc-400">Carregando contas...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Lista de Contas */}
      <div className="xl:col-span-2">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Contas PriveBank</h3>
                  <p className="text-sm text-zinc-400">{accounts.length} contas registradas</p>
                </div>
              </div>
              <UserSearchActivateBank />
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
          </div>
          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-300">Usuário</TableHead>
                  <TableHead className="text-zinc-300">Email</TableHead>
                  <TableHead className="text-zinc-300">Saldo</TableHead>
                  <TableHead className="text-zinc-300">Transações</TableHead>
                  <TableHead className="text-zinc-300">Última Atividade</TableHead>
                  <TableHead className="text-zinc-300">Status</TableHead>
                  <TableHead className="text-zinc-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id} className="border-zinc-800">
                    <TableCell className="text-white">
                      {account.user_name}
                    </TableCell>
                    <TableCell className="text-zinc-300 max-w-xs truncate">
                      {account.user_email}
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <span className="font-semibold text-green-400">
                          {Number(account.balance).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      <Badge className="bg-blue-600 text-white">
                        {account.transaction_count}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {account.last_transaction ? (
                        <div className="text-sm">
                          {format(new Date(account.last_transaction), 'dd/MM/yyyy HH:mm', {
                            locale: ptBR,
                          })}
                        </div>
                      ) : (
                        <span className="text-zinc-500">Nunca</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={account.is_active ? 'default' : 'secondary'}
                        className={account.is_active 
                          ? 'bg-green-600 text-white' 
                          : 'bg-zinc-700 text-zinc-300'
                        }
                      >
                        {account.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAccount(account.id)}
                          className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Detalhes da Conta */}
      <div className="xl:col-span-1">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="p-6 border-b border-zinc-800">
            <h3 className="text-lg font-semibold text-white">
              {selectedAccount ? 'Detalhes da Conta' : 'Selecione uma conta'}
            </h3>
          </div>
          <div className="p-6">
            {selectedAccount && accountDetails ? (
              <div className="space-y-6">
                {/* Transações Recentes */}
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                      <Activity className="h-3 w-3 text-white" />
                    </div>
                    Transações Recentes
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {accountDetails.transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className="bg-zinc-700 text-zinc-300">
                            {transaction.transaction_type}
                          </Badge>
                          <span className={`text-sm font-semibold ${
                            transaction.from_account_id === selectedAccount 
                              ? 'text-red-400' 
                              : 'text-green-400'
                          }`}>
                            {transaction.from_account_id === selectedAccount ? '-' : '+'}
                            ${Number(transaction.amount).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2
                            })}
                          </span>
                        </div>
                        <div className="text-zinc-400 text-xs mb-1">
                          {format(new Date(transaction.created_at), 'dd/MM HH:mm', {
                            locale: ptBR,
                          })}
                        </div>
                        <div className="text-white text-sm">
                          {transaction.description || 'Sem descrição'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400">Clique em uma conta para ver os detalhes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankAccountsManager;