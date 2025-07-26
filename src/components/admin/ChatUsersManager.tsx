import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, Search, Eye, MessageCircle, Clock, Activity } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type ChatUserWithStats = {
  id: string;
  user_id: string;
  chat_display_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Estatísticas calculadas
  total_conversations: number;
  total_messages_sent: number;
  total_messages_received: number;
  last_activity: string | null;
  user_role: string;
  user_email: string;
};

const ChatUsersManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const { data: chatUsers = [], isLoading } = useQuery({
    queryKey: ['admin-chat-users', searchTerm],
    queryFn: async (): Promise<ChatUserWithStats[]> => {
      const { data: chatUsersData, error } = await supabase
        .from('chat_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calcular estatísticas para cada usuário
      const usersWithStats = await Promise.all(
        (chatUsersData || []).map(async (user) => {
          // Buscar dados do usuário do sistema
          const { data: systemUser } = await supabase
            .from('system_users')
            .select('user_role, email')
            .eq('user_id', user.user_id)
            .single();
          // Total de conversas onde o usuário participa
          const { count: totalConversations } = await supabase
            .from('conversations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.user_id);

          // Mensagens enviadas pelo usuário
          const { count: messagesSent } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', user.user_id);

          // Mensagens recebidas (nas conversas do usuário)
          const { data: userConversations } = await supabase
            .from('conversations')
            .select('id')
            .eq('user_id', user.user_id);

          let messagesReceived = 0;
          if (userConversations && userConversations.length > 0) {
            const conversationIds = userConversations.map(c => c.id);
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .in('conversation_id', conversationIds)
              .neq('sender_id', user.user_id);
            messagesReceived = count || 0;
          }

          // Última atividade (última mensagem enviada)
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('created_at')
            .eq('sender_id', user.user_id)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            ...user,
            total_conversations: totalConversations || 0,
            total_messages_sent: messagesSent || 0,
            total_messages_received: messagesReceived,
            last_activity: lastMessage?.[0]?.created_at || null,
            user_role: systemUser?.user_role || 'cliente',
            user_email: systemUser?.email || 'N/A',
          };
        })
      );

      // Filtrar por termo de busca
      if (searchTerm) {
        return usersWithStats.filter(user => 
          user.chat_display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.user_email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return usersWithStats;
    },
  });

  const { data: userDetails } = useQuery({
    queryKey: ['admin-chat-user-details', selectedUser],
    queryFn: async () => {
      if (!selectedUser) return null;

      // Buscar conversas do usuário
      const { data: conversations } = await supabase
        .from('conversations')
        .select(`
          *,
          models(name)
        `)
        .eq('user_id', selectedUser)
        .order('last_message_at', { ascending: false });

      // Buscar mensagens recentes do usuário
      const { data: recentMessages } = await supabase
        .from('messages')
        .select(`
          *,
          conversations!inner(models(name))
        `)
        .eq('sender_id', selectedUser)
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        conversations: conversations || [],
        recentMessages: recentMessages || [],
      };
    },
    enabled: !!selectedUser,
  });

  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-700">
        <CardContent className="p-6">
          <p className="text-zinc-400">Carregando usuários...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Lista de Usuários */}
      <div className="xl:col-span-2">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Usuários do Chat</h3>
                <p className="text-sm text-zinc-400">{chatUsers.length} usuários registrados</p>
              </div>
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
                  <TableHead className="text-zinc-300">Nome</TableHead>
                  <TableHead className="text-zinc-300">Email</TableHead>
                  <TableHead className="text-zinc-300">Perfil</TableHead>
                  <TableHead className="text-zinc-300">Conversas</TableHead>
                  <TableHead className="text-zinc-300">Mensagens</TableHead>
                  <TableHead className="text-zinc-300">Última Atividade</TableHead>
                  <TableHead className="text-zinc-300">Status</TableHead>
                  <TableHead className="text-zinc-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chatUsers.map((user) => (
                  <TableRow key={user.id} className="border-zinc-800">
                    <TableCell className="text-white">
                      {user.chat_display_name || 'Sem nome'}
                    </TableCell>
                    <TableCell className="text-zinc-300 max-w-xs truncate">
                      {user.user_email}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.user_role === 'modelo' ? 'default' : 'secondary'}
                        className={user.user_role === 'modelo' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-zinc-700 text-zinc-300'
                        }
                      >
                        {user.user_role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {user.total_conversations}
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      <div className="text-sm space-y-1">
                        <div className="text-green-400">↑ {user.total_messages_sent}</div>
                        <div className="text-blue-400">↓ {user.total_messages_received}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {user.last_activity ? (
                        <div className="text-sm">
                          {format(new Date(user.last_activity), 'dd/MM/yyyy HH:mm', {
                            locale: ptBR,
                          })}
                        </div>
                      ) : (
                        <span className="text-zinc-500">Nunca</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.is_active ? 'default' : 'secondary'}
                        className={user.is_active 
                          ? 'bg-green-600 text-white' 
                          : 'bg-zinc-700 text-zinc-300'
                        }
                      >
                        {user.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user.user_id)}
                        className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Detalhes do Usuário */}
      <div className="xl:col-span-1">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="p-6 border-b border-zinc-800">
            <h3 className="text-lg font-semibold text-white">
              {selectedUser ? 'Detalhes do Usuário' : 'Selecione um usuário'}
            </h3>
          </div>
          <div className="p-6">
            {selectedUser && userDetails ? (
              <div className="space-y-6">
                {/* Conversas */}
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                      <MessageCircle className="h-3 w-3 text-white" />
                    </div>
                    Conversas ({userDetails.conversations.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {userDetails.conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg"
                      >
                        <div className="text-white text-sm font-medium">
                          {conversation.models?.name || 'Conversa sem modelo'}
                        </div>
                        <div className="text-zinc-400 text-xs mt-1">
                          {conversation.last_message_at ? (
                            format(new Date(conversation.last_message_at), 'dd/MM HH:mm', {
                              locale: ptBR,
                            })
                          ) : (
                            'Sem mensagens'
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mensagens Recentes */}
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center">
                      <Clock className="h-3 w-3 text-white" />
                    </div>
                    Mensagens Recentes
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {userDetails.recentMessages.map((message) => (
                      <div
                        key={message.id}
                        className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg"
                      >
                        <div className="text-zinc-400 text-xs mb-1">
                          Para: {message.conversations?.models?.name || 'Desconhecido'} •{' '}
                          {format(new Date(message.created_at), 'dd/MM HH:mm', {
                            locale: ptBR,
                          })}
                        </div>
                        <div className="text-white text-sm">
                          {message.content ? (
                            message.content.length > 100 
                              ? `${message.content.substring(0, 100)}...`
                              : message.content
                          ) : (
                            <em className="text-zinc-400">
                              [{message.message_type}]
                            </em>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400">Clique em um usuário para ver os detalhes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatUsersManager;