import React from 'react';
import { usePrivaBankLogs } from '@/hooks/usePrivaBankLogs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const BankLogsManager = () => {
  const { data: logs = [], isLoading } = usePrivaBankLogs(100);

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'account_access':
        return <Activity className="h-4 w-4" />;
      case 'transfer_attempt':
      case 'transfer_success':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActionBadge = (actionType: string, success: boolean) => {
    if (!success) {
      return <Badge className="bg-red-600 text-white">Erro</Badge>;
    }

    switch (actionType) {
      case 'account_access':
        return <Badge className="bg-blue-600 text-white">Acesso</Badge>;
      case 'transfer_attempt':
        return <Badge className="bg-yellow-600 text-white">Tentativa</Badge>;
      case 'transfer_success':
        return <Badge className="bg-green-600 text-white">Sucesso</Badge>;
      default:
        return <Badge className="bg-zinc-700 text-zinc-300">{actionType}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <p className="text-zinc-400">Carregando logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Logs do PriveBank</h3>
              <p className="text-sm text-zinc-400">Histórico completo de ações e eventos do sistema</p>
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
                <TableHead className="text-zinc-300">Status</TableHead>
                <TableHead className="text-zinc-300">IP</TableHead>
                <TableHead className="text-zinc-300">User Agent</TableHead>
                <TableHead className="text-zinc-300">Detalhes</TableHead>
                <TableHead className="text-zinc-300">Erro</TableHead>
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
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action_type)}
                      <span className="text-zinc-300 capitalize">
                        {log.action_type.replace('_', ' ')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getActionBadge(log.action_type, log.success)}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {log.ip_address || 'N/A'}
                  </TableCell>
                  <TableCell className="text-zinc-300 max-w-xs truncate">
                    {log.user_agent || 'N/A'}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {log.action_details && (
                      <details className="cursor-pointer">
                        <summary className="text-blue-400 hover:text-blue-300 text-sm">
                          Ver detalhes
                        </summary>
                        <pre className="mt-2 p-2 bg-zinc-800 rounded text-xs overflow-auto max-w-xs border border-zinc-700">
                          {JSON.stringify(log.action_details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </TableCell>
                  <TableCell className="text-red-400 text-sm">
                    {log.error_message || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {logs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">Nenhum log encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankLogsManager;