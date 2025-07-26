import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Search, Filter, RefreshCw, Activity } from 'lucide-react';
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

type SystemLog = {
  id: string;
  action_type: string;
  description: string;
  user_id: string | null;
  created_at: string;
  metadata?: any;
  user_email?: string;
  user_role?: string;
};

const ChatLogsManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('24h');

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-chat-logs', searchTerm, actionFilter, timeFilter],
    queryFn: async (): Promise<SystemLog[]> => {
      // Definir intervalo de tempo
      const now = new Date();
      let timeFilterDate = new Date();
      
      switch (timeFilter) {
        case '1h':
          timeFilterDate.setHours(now.getHours() - 1);
          break;
        case '24h':
          timeFilterDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          timeFilterDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          timeFilterDate.setDate(now.getDate() - 30);
          break;
        default:
          timeFilterDate.setDate(now.getDate() - 1);
      }

      // Buscar logs do sistema relacionados ao chat
      const chatActions = [
        'message_sent',
        'message_received',
        'conversation_created',
        'user_login_chat',
        'user_logout_chat',
        'contact_added',
        'contact_removed',
        'typing_started',
        'typing_stopped',
        'message_read',
        'conversation_archived',
        'user_blocked',
        'user_unblocked'
      ];

      // Simular logs do sistema (em produção, viria de uma tabela de logs)
      const mockLogs: SystemLog[] = [
        {
          id: '1',
          action_type: 'message_sent',
          description: 'Mensagem enviada em conversa',
          user_id: 'user-1',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min atrás
          user_email: 'usuario@demo.com',
          user_role: 'cliente',
          metadata: { conversation_id: 'conv-1', message_type: 'text' }
        },
        {
          id: '2',
          action_type: 'conversation_created',
          description: 'Nova conversa iniciada',
          user_id: 'user-2',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h atrás
          user_email: 'cliente@demo.com',
          user_role: 'cliente',
          metadata: { model_id: 'model-1' }
        },
        {
          id: '3',
          action_type: 'user_login_chat',
          description: 'Usuário entrou no chat',
          user_id: 'user-3',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4h atrás
          user_email: 'modelo@demo.com',
          user_role: 'modelo',
          metadata: { device: 'mobile', ip: '192.168.1.1' }
        },
        {
          id: '4',
          action_type: 'contact_added',
          description: 'Contato adicionado automaticamente',
          user_id: 'user-1',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6h atrás
          user_email: 'usuario@demo.com',
          user_role: 'cliente',
          metadata: { contact_user_id: 'user-4', auto_added: true }
        },
        {
          id: '5',
          action_type: 'message_read',
          description: 'Mensagem marcada como lida',
          user_id: 'user-4',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8h atrás
          user_email: 'modelo2@demo.com',
          user_role: 'modelo',
          metadata: { message_id: 'msg-1', conversation_id: 'conv-1' }
        }
      ];

      // Aplicar filtros
      let filteredLogs = mockLogs.filter(log => 
        new Date(log.created_at) >= timeFilterDate
      );

      if (actionFilter !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.action_type === actionFilter);
      }

      if (searchTerm) {
        filteredLogs = filteredLogs.filter(log => 
          log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action_type.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return filteredLogs.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const getActionBadgeVariant = (actionType: string) => {
    switch (actionType) {
      case 'message_sent':
      case 'message_received':
        return 'default';
      case 'conversation_created':
        return 'secondary';
      case 'user_login_chat':
        return 'outline';
      case 'user_logout_chat':
        return 'destructive';
      case 'contact_added':
        return 'default';
      case 'contact_removed':
        return 'destructive';
      case 'user_blocked':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getActionLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      'message_sent': 'Mensagem Enviada',
      'message_received': 'Mensagem Recebida',
      'conversation_created': 'Conversa Criada',
      'user_login_chat': 'Login Chat',
      'user_logout_chat': 'Logout Chat',
      'contact_added': 'Contato Adicionado',
      'contact_removed': 'Contato Removido',
      'typing_started': 'Começou a Digitar',
      'typing_stopped': 'Parou de Digitar',
      'message_read': 'Mensagem Lida',
      'conversation_archived': 'Conversa Arquivada',
      'user_blocked': 'Usuário Bloqueado',
      'user_unblocked': 'Usuário Desbloqueado'
    };
    return labels[actionType] || actionType;
  };

  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-700">
        <CardContent className="p-6">
          <p className="text-zinc-400">Carregando logs...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Logs do Sistema de Chat</h3>
              <p className="text-sm text-zinc-400">Monitore todas as ações do sistema em tempo real</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Buscar logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Tipo de ação" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="all">Todas as ações</SelectItem>
                <SelectItem value="message_sent">Mensagem Enviada</SelectItem>
                <SelectItem value="message_received">Mensagem Recebida</SelectItem>
                <SelectItem value="conversation_created">Conversa Criada</SelectItem>
                <SelectItem value="user_login_chat">Login Chat</SelectItem>
                <SelectItem value="contact_added">Contato Adicionado</SelectItem>
                <SelectItem value="user_blocked">Usuário Bloqueado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="1h">Última hora</SelectItem>
                <SelectItem value="24h">Últimas 24 horas</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center text-sm text-zinc-400">
              <Activity className="h-4 w-4 mr-2" />
              {logs.length} eventos
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-300">Data/Hora</TableHead>
                <TableHead className="text-zinc-300">Ação</TableHead>
                <TableHead className="text-zinc-300">Descrição</TableHead>
                <TableHead className="text-zinc-300">Usuário</TableHead>
                <TableHead className="text-zinc-300">Perfil</TableHead>
                <TableHead className="text-zinc-300">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="border-zinc-800">
                  <TableCell className="text-white">
                    {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(log.action_type)}>
                      {getActionLabel(log.action_type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {log.description}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {log.user_email || 'Sistema'}
                  </TableCell>
                  <TableCell>
                    {log.user_role && (
                      <Badge 
                        variant={log.user_role === 'modelo' ? 'default' : 'secondary'}
                        className={log.user_role === 'modelo' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-zinc-700 text-zinc-300'
                        }
                      >
                        {log.user_role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm">
                    {log.metadata && (
                      <details className="cursor-pointer">
                        <summary className="text-blue-400 hover:text-blue-300">Ver detalhes</summary>
                        <pre className="mt-2 p-2 bg-zinc-800 rounded text-xs overflow-auto max-w-xs border border-zinc-700">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {logs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">Nenhum log encontrado para os filtros selecionados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatLogsManager;