
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useChatSettings, useUpdateChatSettings } from '@/hooks/useChatSettings';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const ChatSettings = () => {
  const { data: settings } = useChatSettings();
  const updateSettings = useUpdateChatSettings();

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      is_enabled: settings?.is_enabled || true,
      max_file_size_mb: settings?.max_file_size_mb || 10,
      auto_delete_messages_days: settings?.auto_delete_messages_days || null,
      enable_typing_indicators: settings?.enable_typing_indicators || true,
      enable_read_receipts: settings?.enable_read_receipts || true,
      enable_file_upload: settings?.enable_file_upload || true,
      allowed_file_types: settings?.allowed_file_types?.join(', ') || 'image/jpeg, image/png, image/gif, video/mp4, audio/mpeg, audio/wav',
    },
  });

  const isEnabled = watch('is_enabled');
  const enableTypingIndicators = watch('enable_typing_indicators');
  const enableReadReceipts = watch('enable_read_receipts');
  const enableFileUpload = watch('enable_file_upload');

  const onSubmit = async (data: any) => {
    if (!settings?.id) return;

    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        is_enabled: data.is_enabled,
        max_file_size_mb: data.max_file_size_mb,
        auto_delete_messages_days: data.auto_delete_messages_days || null,
        enable_typing_indicators: data.enable_typing_indicators,
        enable_read_receipts: data.enable_read_receipts,
        enable_file_upload: data.enable_file_upload,
        allowed_file_types: data.allowed_file_types.split(',').map((type: string) => type.trim()),
        updated_at: new Date().toISOString(),
      });
      
      toast.success('Configurações do chat atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      toast.error('Erro ao atualizar configurações do chat');
    }
  };

  if (!settings) {
    return (
      <Card className="bg-zinc-900 border-zinc-700">
        <CardContent className="p-6">
          <p className="text-zinc-400">Carregando configurações...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-white">Configurações do Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Configurações Gerais */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
              Configurações Gerais
            </h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_enabled"
                checked={isEnabled}
                onCheckedChange={(checked) => setValue('is_enabled', checked)}
              />
              <Label htmlFor="is_enabled" className="text-white">Chat Habilitado</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auto_delete_messages_days" className="text-white">
                Auto-deletar mensagens após (dias)
              </Label>
              <Input
                id="auto_delete_messages_days"
                type="number"
                {...register('auto_delete_messages_days', { valueAsNumber: true })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Deixe em branco para não deletar"
              />
              <p className="text-zinc-400 text-sm">
                Mensagens serão deletadas automaticamente após este período
              </p>
            </div>
          </div>

          {/* Funcionalidades */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
              Funcionalidades
            </h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="enable_typing_indicators"
                checked={enableTypingIndicators}
                onCheckedChange={(checked) => setValue('enable_typing_indicators', checked)}
              />
              <Label htmlFor="enable_typing_indicators" className="text-white">
                Indicadores de Digitação
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enable_read_receipts"
                checked={enableReadReceipts}
                onCheckedChange={(checked) => setValue('enable_read_receipts', checked)}
              />
              <Label htmlFor="enable_read_receipts" className="text-white">
                Confirmação de Leitura
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enable_file_upload"
                checked={enableFileUpload}
                onCheckedChange={(checked) => setValue('enable_file_upload', checked)}
              />
              <Label htmlFor="enable_file_upload" className="text-white">
                Upload de Arquivos
              </Label>
            </div>
          </div>

          {/* Configurações de Upload */}
          {enableFileUpload && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
                Configurações de Upload
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="max_file_size_mb" className="text-white">
                  Tamanho Máximo de Arquivo (MB)
                </Label>
                <Input
                  id="max_file_size_mb"
                  type="number"
                  {...register('max_file_size_mb', { valueAsNumber: true })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowed_file_types" className="text-white">
                  Tipos de Arquivo Permitidos (separados por vírgula)
                </Label>
                <Textarea
                  id="allowed_file_types"
                  {...register('allowed_file_types')}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="image/jpeg, image/png, video/mp4, audio/mpeg"
                  rows={3}
                />
                <p className="text-zinc-400 text-sm">
                  Use MIME types separados por vírgula
                </p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={updateSettings.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {updateSettings.isPending ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChatSettings;
