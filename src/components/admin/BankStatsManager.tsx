import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, Users, TrendingUp, Activity, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const BankStatsManager = () => {
  const { data: stats } = useQuery({
    queryKey: ['bank-stats'],
    queryFn: async () => {
      // Total de contas
      const { count: totalAccounts } = await supabase
        .from('privabank_accounts')
        .select('*', { count: 'exact', head: true });

      // Contas ativas
      const { count: activeAccounts } = await supabase
        .from('privabank_accounts')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Total de transações
      const { count: totalTransactions } = await supabase
        .from('privabank_transactions')
        .select('*', { count: 'exact', head: true });

      // Transações das últimas 24 horas
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: recentTransactions } = await supabase
        .from('privabank_transactions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString());

      // Volume total
      const { data: volumeData } = await supabase
        .from('privabank_transactions')
        .select('amount');

      const totalVolume = volumeData?.reduce((sum, transaction) => sum + Number(transaction.amount), 0) || 0;

      // Saldo total em todas as contas
      const { data: balanceData } = await supabase
        .from('privabank_accounts')
        .select('balance');

      const totalBalance = balanceData?.reduce((sum, account) => sum + Number(account.balance), 0) || 0;

      // Transações por dia (últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: dailyTransactions } = await supabase
        .from('privabank_transactions')
        .select('created_at, amount')
        .gte('created_at', sevenDaysAgo.toISOString());

      // Agrupar transações por dia
      const transactionsByDay = dailyTransactions?.reduce((acc: Record<string, { count: number; volume: number }>, transaction) => {
        const date = new Date(transaction.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { count: 0, volume: 0 };
        }
        acc[date].count += 1;
        acc[date].volume += Number(transaction.amount);
        return acc;
      }, {}) || {};

      // Converter para formato do gráfico
      const chartData = Object.entries(transactionsByDay).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        transacoes: data.count,
        volume: data.volume,
      }));

      // Distribuição por tipo de transação
      const { data: transactionTypes } = await supabase
        .from('privabank_transactions')
        .select('transaction_type');

      const typeDistribution = transactionTypes?.reduce((acc: Record<string, number>, transaction) => {
        acc[transaction.transaction_type] = (acc[transaction.transaction_type] || 0) + 1;
        return acc;
      }, {}) || {};

      const pieData = Object.entries(typeDistribution).map(([type, count]) => ({
        name: type === 'transfer' ? 'Transferência' : type === 'deposit' ? 'Depósito' : 'Saque',
        value: count,
      }));

      return {
        totalAccounts: totalAccounts || 0,
        activeAccounts: activeAccounts || 0,
        totalTransactions: totalTransactions || 0,
        recentTransactions: recentTransactions || 0,
        totalVolume,
        totalBalance,
        chartData,
        pieData,
      };
    },
  });

  if (!stats) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <p className="text-zinc-400">Carregando estatísticas...</p>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Total de Contas</p>
                <p className="text-2xl font-bold text-white">{stats.totalAccounts}</p>
                <p className="text-xs text-zinc-500 mt-1">{stats.activeAccounts} ativas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Saldo Total</p>
                <p className="text-2xl font-bold text-white">
                  P${stats.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Total Transações</p>
                <p className="text-2xl font-bold text-white">{stats.totalTransactions}</p>
                <p className="text-xs text-zinc-500 mt-1">{stats.recentTransactions} nas últimas 24h</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Volume Total</p>
                <p className="text-2xl font-bold text-white">
                  P${stats.totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Transações por Dia */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-1">Transações por Dia</h3>
            <p className="text-sm text-zinc-400">Atividade dos últimos 7 dias</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6',
                  }}
                  formatter={(value, name) => [
                    name === 'transacoes' ? value : `P$${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    name === 'transacoes' ? 'Transações' : 'Volume'
                  ]}
                />
                <Bar dataKey="transacoes" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Distribuição por Tipo */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-1">Distribuição por Tipo</h3>
            <p className="text-sm text-zinc-400">Tipos de transações realizadas</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankStatsManager;