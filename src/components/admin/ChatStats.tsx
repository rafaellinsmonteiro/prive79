
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Total de Conversas
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalConversations}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Total de Mensagens
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalMessages}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Conversas Ativas
            </CardTitle>
            <Users className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.activeConversations}
            </div>
            <p className="text-xs text-zinc-400">
              Últimos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Média por Conversa
            </CardTitle>
            <Clock className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalConversations > 0 
                ? Math.round(stats.totalMessages / stats.totalConversations)
                : 0
              }
            </div>
            <p className="text-xs text-zinc-400">
              Mensagens por conversa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Mensagens por Dia */}
      <Card className="bg-zinc-900 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-white">Mensagens por Dia (Últimos 7 dias)</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatStats;
