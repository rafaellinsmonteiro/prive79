
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle, Search, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type ConversationWithDetails = {
  id: string;
  user_id: string;
  model_id: string | null;
  created_at: string;
  last_message_at: string | null;
  is_active: boolean;
  models: { name: string } | null;
  message_count: number;
  last_message: string | null;
};

const ConversationsMonitor = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['admin-conversations', searchTerm],
    queryFn: async (): Promise<ConversationWithDetails[]> => {
      let query = supabase
        .from('conversations')
        .select(`
          *,
          models (name)
        `)
        .order('last_message_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`models.name.ilike.%${searchTerm}%`);
      }

      const { data: conversationsData, error } = await query;

      if (error) throw error;

      // Buscar contagem de mensagens e última mensagem para cada conversa
      const conversationsWithDetails = await Promise.all(
        (conversationsData || []).map(async (conversation) => {
          const { data: messagesData } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversation.id);

          return {
            ...conversation,
            message_count: count || 0,
            last_message: messagesData?.[0]?.content || null,
          };
        })
      );

      return conversationsWithDetails;
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['admin-conversation-messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedConversation,
  });

  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-700">
        <CardContent className="p-6">
          <p className="text-zinc-400">Carregando conversas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Lista de Conversas */}
      <div className="lg:col-span-2">
        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversas ({conversations.length})
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Buscar por modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-zinc-300">Modelo</TableHead>
                  <TableHead className="text-zinc-300">Mensagens</TableHead>
                  <TableHead className="text-zinc-300">Última Mensagem</TableHead>
                  <TableHead className="text-zinc-300">Criada em</TableHead>
                  <TableHead className="text-zinc-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversations.map((conversation) => (
                  <TableRow key={conversation.id}>
                    <TableCell className="text-white">
                      {conversation.models?.name || 'Sem modelo'}
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {conversation.message_count}
                    </TableCell>
                    <TableCell className="text-zinc-300 max-w-xs truncate">
                      {conversation.last_message || 'Nenhuma mensagem'}
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {format(new Date(conversation.created_at), 'dd/MM/yyyy HH:mm', {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedConversation(conversation.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes da Conversa */}
      <div className="lg:col-span-1">
        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-white">
              {selectedConversation ? 'Mensagens' : 'Selecione uma conversa'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedConversation ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.sender_type === 'user'
                        ? 'bg-blue-600 ml-4'
                        : 'bg-zinc-800 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-zinc-300">
                        {message.sender_type === 'user' ? 'Usuario' : 'Modelo'}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {format(new Date(message.created_at), 'HH:mm', {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <p className="text-white text-sm">
                      {message.content || (
                        <em className="text-zinc-400">
                          {message.message_type !== 'text' ? `[${message.message_type}]` : 'Sem conteúdo'}
                        </em>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-400 text-center py-8">
                Clique em uma conversa para ver as mensagens
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConversationsMonitor;
