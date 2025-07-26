
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Users, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ChatStats = () => {
  const { data: stats } = useQuery({
    queryKey: ['chat-stats'],
    queryFn: async () => {
      // Total de conversas
      const { count: totalConversations } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true });

      // Total de mensagens
      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      // Conversas ativas (com mensagem nos últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: activeConversations } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .gte('last_message_at', sevenDaysAgo.toISOString());

      // Mensagens por dia (últimos 7 dias)
      const { data: dailyMessages } = await supabase
        .from('messages')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      // Agrupar mensagens por dia
      const messagesByDay = dailyMessages?.reduce((acc: Record<string, number>, message) => {
        const date = new Date(message.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}) || {};

      // Converter para formato do gráfico
      const chartData = Object.entries(messagesByDay).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        mensagens: count,
      }));

      return {
        totalConversations: totalConversations || 0,
        totalMessages: totalMessages || 0,
        activeConversations: activeConversations || 0,
        chartData,
      };
    },
  });

  if (!stats) {
    return (
      <Card className="bg-zinc-900 border-zinc-700">
        <CardContent className="p-6">
          <p className="text-zinc-400">Carregando estatísticas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Total de Conversas</p>
                <p className="text-2xl font-bold text-white">{stats.totalConversations}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Total de Mensagens</p>
                <p className="text-2xl font-bold text-white">{stats.totalMessages}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Conversas Ativas</p>
                <p className="text-2xl font-bold text-white">{stats.activeConversations}</p>
                <p className="text-xs text-zinc-500 mt-1">Últimos 7 dias</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Média por Conversa</p>
                <p className="text-2xl font-bold text-white">
                  {stats.totalConversations > 0 
                    ? Math.round(stats.totalMessages / stats.totalConversations)
                    : 0
                  }
                </p>
                <p className="text-xs text-zinc-500 mt-1">Mensagens por conversa</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Mensagens por Dia */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-1">Mensagens por Dia</h3>
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
              />
              <Bar dataKey="mensagens" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChatStats;
