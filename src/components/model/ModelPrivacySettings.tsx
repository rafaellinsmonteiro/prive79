
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield } from 'lucide-react';
import { useModelDashboardSettings } from '@/hooks/useModelDashboardSettings';

interface ModelPrivacySettingsProps {
  modelId: string;
}

const ModelPrivacySettings = ({ modelId }: ModelPrivacySettingsProps) => {
  const { settings, isLoading, updateSettings } = useModelDashboardSettings(modelId);

  const handleSettingChange = (key: string, value: boolean) => {
    updateSettings.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="text-zinc-400">Carregando configurações...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configurações de Privacidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-zinc-300">Modo Privacidade</Label>
              <p className="text-sm text-zinc-500">
                Ativar para tornar seu perfil menos visível
              </p>
            </div>
            <Switch
              checked={settings?.privacy_mode || false}
              onCheckedChange={(checked) => handleSettingChange('privacy_mode', checked)}
              disabled={updateSettings.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-zinc-300">Auto-Aprovação de Fotos</Label>
              <p className="text-sm text-zinc-500">
                Aprovar automaticamente fotos enviadas
              </p>
            </div>
            <Switch
              checked={settings?.auto_approve_photos || false}
              onCheckedChange={(checked) => handleSettingChange('auto_approve_photos', checked)}
              disabled={updateSettings.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-zinc-300">Mostrar Status Online</Label>
              <p className="text-sm text-zinc-500">
                Exibir quando você está online
              </p>
            </div>
            <Switch
              checked={settings?.show_online_status || false}
              onCheckedChange={(checked) => handleSettingChange('show_online_status', checked)}
              disabled={updateSettings.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-zinc-300">Permitir Mensagens Diretas</Label>
              <p className="text-sm text-zinc-500">
                Receber mensagens diretas de usuários
              </p>
            </div>
            <Switch
              checked={settings?.allow_direct_messages || false}
              onCheckedChange={(checked) => handleSettingChange('allow_direct_messages', checked)}
              disabled={updateSettings.isPending}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelPrivacySettings;
