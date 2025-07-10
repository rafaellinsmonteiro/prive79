import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Activity, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { usePrivaBankLogs } from '@/hooks/usePrivaBankLogs';

const PrivaBankLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState('all');
  const [successFilter, setSuccessFilter] = useState('all');
  
  const { data: logs = [], isLoading } = usePrivaBankLogs(500);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      searchTerm === '' ||
      log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.error_message && log.error_message.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.user_id && log.user_id.includes(searchTerm));
    
    const matchesActionType = actionTypeFilter === 'all' || log.action_type === actionTypeFilter;
    const matchesSuccess = successFilter === 'all' || 
      (successFilter === 'success' && log.success) ||
      (successFilter === 'error' && !log.success);

    return matchesSearch && matchesActionType && matchesSuccess;
  });

  const actionTypes = [...new Set(logs.map(log => log.action_type))];

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case 'account_access':
        return <User className="h-4 w-4" />;
      case 'transfer_attempt':
      case 'transfer_success':
        return <Activity className="h-4 w-4" />;
      case 'balance_check':
        return <Search className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionTypeColor = (actionType: string, success: boolean) => {
    if (!success) return 'destructive';
    
    switch (actionType) {
      case 'account_access':
        return 'secondary';
      case 'transfer_success':
        return 'default';
      case 'transfer_attempt':
        return 'outline';
      case 'balance_check':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="text-center text-zinc-400">Carregando logs...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Logs do PriveBank
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Buscar</label>
              <Input
                placeholder="Buscar por ação, erro ou user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Tipo de Ação</label>
              <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  {actionTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Status</label>
              <Select value={successFilter} onValueChange={setSuccessFilter}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="success">Sucessos</SelectItem>
                  <SelectItem value="error">Erros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6 text-center text-zinc-400">
              Nenhum log encontrado
            </CardContent>
          </Card>
        ) : (
          filteredLogs.map((log) => (
            <Card key={log.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {log.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge 
                          variant={getActionTypeColor(log.action_type, log.success)}
                          className="flex items-center gap-1"
                        >
                          {getActionTypeIcon(log.action_type)}
                          {log.action_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        
                        {log.user_id && (
                          <div className="flex items-center gap-1 text-xs text-zinc-400">
                            <User className="h-3 w-3" />
                            {log.user_id.substring(0, 8)}...
                          </div>
                        )}
                      </div>
                      
                      {log.action_details && (
                        <div className="text-sm text-zinc-300">
                          <pre className="text-xs bg-zinc-800 p-2 rounded overflow-x-auto">
                            {JSON.stringify(JSON.parse(String(log.action_details)), null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {log.error_message && (
                        <div className="text-sm text-red-400 bg-red-500/10 p-2 rounded">
                          <strong>Erro:</strong> {log.error_message}
                        </div>
                      )}
                      
                      {log.user_agent && (
                        <div className="text-xs text-zinc-500 truncate">
                          <strong>User Agent:</strong> {log.user_agent}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-zinc-400 whitespace-nowrap">
                    <Calendar className="h-3 w-3" />
                    {new Date(log.created_at).toLocaleDateString('pt-BR')}
                    <Clock className="h-3 w-3 ml-2" />
                    {new Date(log.created_at).toLocaleTimeString('pt-BR')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Estatísticas */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{logs.length}</div>
              <div className="text-sm text-zinc-400">Total de Logs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">
                {logs.filter(log => log.success).length}
              </div>
              <div className="text-sm text-zinc-400">Sucessos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">
                {logs.filter(log => !log.success).length}
              </div>
              <div className="text-sm text-zinc-400">Erros</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {actionTypes.length}
              </div>
              <div className="text-sm text-zinc-400">Tipos de Ação</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivaBankLogs;