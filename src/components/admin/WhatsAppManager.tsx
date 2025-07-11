import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWhatsAppConnection, useConnectWhatsApp, useDisconnectWhatsApp, useSendWhatsAppNotification } from '@/hooks/useWhatsApp';
import { Smartphone, QrCode, Send, Users, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export const WhatsAppManager = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('general');
  const [targetUserType, setTargetUserType] = useState<'all' | 'models' | 'clients'>('all');

  const { data: connection, isLoading } = useWhatsAppConnection();
  const connectMutation = useConnectWhatsApp();
  const disconnectMutation = useDisconnectWhatsApp();
  const sendNotificationMutation = useSendWhatsAppNotification();

  const handleConnect = () => {
    if (!phoneNumber) {
      toast.error('Digite o número do WhatsApp');
      return;
    }
    connectMutation.mutate(phoneNumber);
  };

  const handleSendNotification = () => {
    if (!notificationTitle || !notificationMessage) {
      toast.error('Preencha título e mensagem');
      return;
    }

    sendNotificationMutation.mutate({
      userType: targetUserType,
      notificationType,
      title: notificationTitle,
      message: notificationMessage
    });

    // Limpar campos após envio
    setNotificationTitle('');
    setNotificationMessage('');
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Status da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Conexão WhatsApp
          </CardTitle>
          <CardDescription>
            Configure a conexão com WhatsApp para envio de notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!connection ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Número do WhatsApp</Label>
                <Input
                  id="phone"
                  placeholder="5511999999999"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleConnect}
                disabled={connectMutation.isPending}
                className="w-full"
              >
                <QrCode className="h-4 w-4 mr-2" />
                {connectMutation.isPending ? 'Conectando...' : 'Conectar WhatsApp'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Número: {connection.phone_number}</p>
                  <Badge variant={connection.is_connected ? 'default' : 'secondary'}>
                    {connection.is_connected ? 'Conectado' : 'Desconectado'}
                  </Badge>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                >
                  Desconectar
                </Button>
              </div>
              
              {!connection.is_connected && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    ⚠️ Para completar a conexão, escaneie o QR Code no seu WhatsApp
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Envio de Notificações */}
      {connection?.is_connected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Enviar Notificações
            </CardTitle>
            <CardDescription>
              Envie notificações importantes para os usuários via WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userType">Destinatários</Label>
                <Select value={targetUserType} onValueChange={(value: any) => setTargetUserType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os usuários</SelectItem>
                    <SelectItem value="models">Apenas modelos</SelectItem>
                    <SelectItem value="clients">Apenas clientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notificationType">Tipo</Label>
                <Select value={notificationType} onValueChange={setNotificationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Geral</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="promotion">Promoção</SelectItem>
                    <SelectItem value="update">Atualização</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Ex: Manutenção programada"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Digite a mensagem que será enviada..."
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                rows={4}
              />
            </div>
            
            <Button 
              onClick={handleSendNotification}
              disabled={sendNotificationMutation.isPending}
              className="w-full"
            >
              <Users className="h-4 w-4 mr-2" />
              {sendNotificationMutation.isPending ? 'Enviando...' : 'Enviar Notificação'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Funcionalidades Ativas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Funcionalidades Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Notificações Importantes</p>
                <p className="text-sm text-muted-foreground">
                  Alertas automáticos enviados via WhatsApp
                </p>
              </div>
              <Badge variant="default">Ativo</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Chat Inteligente</p>
                <p className="text-sm text-muted-foreground">
                  Acesso ao chat IA diretamente pelo WhatsApp
                </p>
              </div>
              <Badge variant="default">Ativo</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Espelhamento de Chat</p>
                <p className="text-sm text-muted-foreground">
                  Mensagens sincronizadas entre WhatsApp e chat interno
                </p>
              </div>
              <Badge variant="default">Ativo</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};