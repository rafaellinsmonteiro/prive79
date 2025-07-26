import React, { useState } from 'react';
import { Puzzle, Zap, Settings, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface Gateway {
  id: string;
  name: string;
  description: string;
  provider: string;
  isActive: boolean;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  supportedMethods: string[];
  configFields: {
    key: string;
    label: string;
    type: 'text' | 'password' | 'url';
    required: boolean;
    value?: string;
  }[];
}

const BankIntegrationsManager = () => {
  const { toast } = useToast();
  const [gateways, setGateways] = useState<Gateway[]>([
    {
      id: 'abacatepay',
      name: 'AbacatePay',
      description: 'Gateway de pagamento brasileiro que permite depósitos via PIX para carteiras em Reais',
      provider: 'AbacatePay',
      isActive: false,
      status: 'disconnected',
      supportedMethods: ['PIX', 'Cartão de Crédito', 'Cartão de Débito'],
      configFields: [
        {
          key: 'api_key',
          label: 'Chave da API',
          type: 'password',
          required: true,
          value: ''
        },
        {
          key: 'webhook_url',
          label: 'URL do Webhook',
          type: 'url',
          required: true,
          value: ''
        },
        {
          key: 'environment',
          label: 'Ambiente',
          type: 'text',
          required: true,
          value: 'sandbox'
        }
      ]
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-zinc-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-600 text-white">Conectado</Badge>;
      case 'error':
        return <Badge className="bg-red-600 text-white">Erro</Badge>;
      case 'testing':
        return <Badge className="bg-yellow-600 text-white">Testando</Badge>;
      default:
        return <Badge className="bg-zinc-700 text-zinc-300">Desconectado</Badge>;
    }
  };

  const handleToggleGateway = (gatewayId: string) => {
    setGateways(prev => 
      prev.map(gateway => 
        gateway.id === gatewayId 
          ? { 
              ...gateway, 
              isActive: !gateway.isActive,
              status: !gateway.isActive ? 'connected' : 'disconnected'
            }
          : gateway
      )
    );
    
    const gateway = gateways.find(g => g.id === gatewayId);
    toast({
      title: gateway?.isActive ? 'Gateway desativado' : 'Gateway ativado',
      description: `${gateway?.name} foi ${gateway?.isActive ? 'desativado' : 'ativado'} com sucesso.`,
    });
  };

  const handleConfigUpdate = (gatewayId: string, field: string, value: string) => {
    setGateways(prev => 
      prev.map(gateway => 
        gateway.id === gatewayId 
          ? {
              ...gateway,
              configFields: gateway.configFields.map(configField =>
                configField.key === field
                  ? { ...configField, value }
                  : configField
              )
            }
          : gateway
      )
    );
  };

  const handleTestConnection = (gatewayId: string) => {
    const gateway = gateways.find(g => g.id === gatewayId);
    
    setGateways(prev => 
      prev.map(g => 
        g.id === gatewayId 
          ? { ...g, status: 'testing' }
          : g
      )
    );

    // Simular teste de conexão
    setTimeout(() => {
      setGateways(prev => 
        prev.map(g => 
          g.id === gatewayId 
            ? { ...g, status: 'connected' }
            : g
        )
      );
      
      toast({
        title: 'Conexão testada',
        description: `Conexão com ${gateway?.name} foi testada com sucesso.`,
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Puzzle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Integrações de Pagamento</h3>
              <p className="text-sm text-zinc-400">Configure gateways de pagamento para depósitos e saques</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gateway Cards */}
      <div className="grid gap-6">
        {gateways.map((gateway) => (
          <Card key={gateway.id} className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                    <Zap className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-white">{gateway.name}</CardTitle>
                      {getStatusIcon(gateway.status)}
                      {getStatusBadge(gateway.status)}
                    </div>
                    <CardDescription className="text-zinc-400">
                      {gateway.description}
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={gateway.isActive}
                  onCheckedChange={() => handleToggleGateway(gateway.id)}
                />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Métodos suportados */}
              <div>
                <Label className="text-sm text-zinc-300 mb-2 block">Métodos de Pagamento Suportados</Label>
                <div className="flex gap-2 flex-wrap">
                  {gateway.supportedMethods.map((method) => (
                    <Badge key={method} variant="outline" className="border-zinc-700 text-zinc-300">
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              {/* Configurações */}
              <div className="space-y-4">
                <Label className="text-sm text-zinc-300">Configurações</Label>
                <div className="grid gap-4">
                  {gateway.configFields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={`${gateway.id}-${field.key}`} className="text-sm text-zinc-400">
                        {field.label}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </Label>
                      <Input
                        id={`${gateway.id}-${field.key}`}
                        type={field.type}
                        value={field.value || ''}
                        onChange={(e) => handleConfigUpdate(gateway.id, field.key, e.target.value)}
                        placeholder={`Digite ${field.label.toLowerCase()}`}
                        className="bg-zinc-800 border-zinc-700 text-white"
                        disabled={!gateway.isActive}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestConnection(gateway.id)}
                  disabled={!gateway.isActive || gateway.status === 'testing'}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {gateway.status === 'testing' ? 'Testando...' : 'Testar Conexão'}
                </Button>
                <Button
                  size="sm"
                  disabled={!gateway.isActive}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Informações adicionais */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div>
            <h4 className="text-white font-medium mb-2">Importante sobre as Integrações</h4>
            <ul className="text-sm text-zinc-400 space-y-1">
              <li>• Certifique-se de configurar os webhooks corretamente para receber notificações de pagamento</li>
              <li>• Teste sempre as integrações em ambiente de sandbox antes de ativar em produção</li>
              <li>• Mantenha suas chaves de API seguras e nunca as compartilhe</li>
              <li>• Os depósitos via PIX são processados automaticamente quando confirmados pelo gateway</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankIntegrationsManager;