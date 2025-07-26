import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DollarSign, Search, RefreshCw, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type BankTransaction = {
  id: string;
  from_account_id: string | null;
  to_account_id: string | null;
  transaction_type: string;
  amount: number;
  description: string | null;
  status: string;
  currency: string;
  created_at: string;
  from_user_name?: string;
  to_user_name?: string;
  from_user_email?: string;
  to_user_email?: string;
};

const BankTransactionsManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('7d');

  const { data: transactions = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-bank-transactions', searchTerm, statusFilter, typeFilter, timeFilter],
    queryFn: async (): Promise<BankTransaction[]> => {
      // Definir filtro de tempo
      const now = new Date();
      let timeFilterDate = new Date();
      
      switch (timeFilter) {
        case '24h':
          timeFilterDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          timeFilterDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          timeFilterDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          timeFilterDate.setDate(now.getDate() - 90);
          break;
        default:
          timeFilterDate.setDate(now.getDate() - 7);
      }

      let query = supabase
        .from('privabank_transactions')
        .select('*')
        .gte('created_at', timeFilterDate.toISOString())
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (typeFilter !== 'all') {
        query = query.eq('transaction_type', typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Buscar dados dos usuários para cada transação
      const transactionsWithUsers = await Promise.all(
        (data || []).map(async (transaction) => {
          let from_user_name = 'Sistema';
          let from_user_email = 'Sistema';
          let to_user_name = 'Sistema';
          let to_user_email = 'Sistema';

          // Buscar usuário de origem
          if (transaction.from_account_id) {
            const { data: fromAccount } = await supabase
              .from('privabank_accounts')
              .select('user_id')
              .eq('id', transaction.from_account_id)
              .single();

            if (fromAccount) {
              const { data: fromUser } = await supabase
                .from('system_users')
                .select('name, email')
                .eq('user_id', fromAccount.user_id)
                .single();

              if (fromUser) {
                from_user_name = fromUser.name || 'N/A';
                from_user_email = fromUser.email || 'N/A';
              }
            }
          }

          // Buscar usuário de destino
          if (transaction.to_account_id) {
            const { data: toAccount } = await supabase
              .from('privabank_accounts')
              .select('user_id')
              .eq('id', transaction.to_account_id)
              .single();

            if (toAccount) {
              const { data: toUser } = await supabase
                .from('system_users')
                .select('name, email')
                .eq('user_id', toAccount.user_id)
                .single();

              if (toUser) {
                to_user_name = toUser.name || 'N/A';
                to_user_email = toUser.email || 'N/A';
              }
            }
          }

          return {
            ...transaction,
            from_user_name,
            from_user_email,
            to_user_name,
            to_user_email,
          };
        })
      );

      // Filtrar por termo de busca
      if (searchTerm) {
        return transactionsWithUsers.filter(transaction => 
          transaction.from_user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.to_user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.from_user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.to_user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return transactionsWithUsers;
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'transfer':
        return <TrendingUp className="h-4 w-4" />;
      case 'deposit':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'withdrawal':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600 text-white">Concluída</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600 text-white">Pendente</Badge>;
      case 'failed':
        return <Badge className="bg-red-600 text-white">Falhada</Badge>;
      default:
        return <Badge className="bg-zinc-700 text-zinc-300">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <p className="text-zinc-400">Carregando transações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Transações Bancárias</h3>
              <p className="text-sm text-zinc-400">Monitore todas as movimentações financeiras</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="failed">Falhada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="transfer">Transferência</SelectItem>
                <SelectItem value="deposit">Depósito</SelectItem>
                <SelectItem value="withdrawal">Saque</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="24h">Últimas 24 horas</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center text-sm text-zinc-400">
              <Filter className="h-4 w-4 mr-2" />
              {transactions.length} transações
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Transações */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-300">Data/Hora</TableHead>
                <TableHead className="text-zinc-300">Tipo</TableHead>
                <TableHead className="text-zinc-300">De</TableHead>
                <TableHead className="text-zinc-300">Para</TableHead>
                <TableHead className="text-zinc-300">Valor</TableHead>
                <TableHead className="text-zinc-300">Status</TableHead>
                <TableHead className="text-zinc-300">Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="border-zinc-800">
                  <TableCell className="text-white">
                    {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTransactionTypeIcon(transaction.transaction_type)}
                      <span className="text-zinc-300 capitalize">
                        {transaction.transaction_type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    <div className="text-sm">
                      <div className="font-medium">{transaction.from_user_name}</div>
                      <div className="text-zinc-500">{transaction.from_user_email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    <div className="text-sm">
                      <div className="font-medium">{transaction.to_user_name}</div>
                      <div className="text-zinc-500">{transaction.to_user_email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-green-400">
                        {transaction.currency === 'PCoins' ? 'P$' : '$'}
                        {Number(transaction.amount).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(transaction.status)}
                  </TableCell>
                  <TableCell className="text-zinc-300 max-w-xs truncate">
                    {transaction.description || 'Sem descrição'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {transactions.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">Nenhuma transação encontrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankTransactionsManager;