import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Settings, 
  Copy, 
  ExternalLink,
  UserCheck,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentModel } from '@/hooks/useCurrentModel';

interface OnlineBookingSettings {
  id?: string;
  model_id: string;
  is_enabled: boolean;
  custom_slug: string | null;
  require_account: boolean;
}

const ModelOnlineBookingSettings = () => {
  const { data: currentModel } = useCurrentModel();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<OnlineBookingSettings>({
    model_id: currentModel?.models?.id || '',
    is_enabled: false,
    custom_slug: null,
    require_account: false,
  });
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['online-booking-settings', currentModel?.models?.id],
    queryFn: async () => {
      if (!currentModel?.models?.id) return null;
      
      const { data, error } = await supabase
        .from('model_online_booking_settings')
        .select('*')
        .eq('model_id', currentModel.models.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!currentModel?.models?.id,
  });

  // Create or update settings
  const updateSettings = useMutation({
    mutationFn: async (data: OnlineBookingSettings) => {
      if (settings?.id) {
        const { error } = await supabase
          .from('model_online_booking_settings')
          .update(data)
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('model_online_booking_settings')
          .insert([{ ...data, model_id: currentModel?.models?.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-booking-settings'] });
      setIsModalOpen(false);
      toast.success('Configurações salvas com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error updating settings:', error);
      if (error.message?.includes('duplicate key value violates unique constraint')) {
        toast.error('Este slug já está sendo usado por outra modelo');
      } else {
        toast.error('Erro ao salvar configurações');
      }
    },
  });

  const handleOpenModal = () => {
    if (settings) {
      setFormData({
        model_id: settings.model_id,
        is_enabled: settings.is_enabled,
        custom_slug: settings.custom_slug,
        require_account: settings.require_account,
      });
    } else {
      setFormData({
        model_id: currentModel?.models?.id || '',
        is_enabled: false,
        custom_slug: null,
        require_account: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar slug
    if (formData.custom_slug && !/^[a-z0-9\-]+$/.test(formData.custom_slug)) {
      toast.error('O slug deve conter apenas letras minúsculas, números e hífens');
      return;
    }
    
    updateSettings.mutate(formData);
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiada para a área de transferência!');
  };

  const generateUrl = () => {
    if (settings?.custom_slug) {
      return `https://prive.click/${settings.custom_slug}`;
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const bookingUrl = generateUrl();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Agendamento Online
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Status do Agendamento Online</p>
              <p className="text-xs text-muted-foreground">
                Permita que clientes agendem diretamente com você através de uma URL personalizada
              </p>
            </div>
            <Badge variant={settings?.is_enabled ? "default" : "secondary"}>
              {settings?.is_enabled ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>

          {settings?.is_enabled && bookingUrl && (
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Sua URL de Agendamento:</p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bookingUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(bookingUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-primary font-mono break-all">
                {bookingUrl}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {settings.require_account ? (
                  <>
                    <UserCheck className="h-3 w-3" />
                    Apenas clientes com conta
                  </>
                ) : (
                  <>
                    <Users className="h-3 w-3" />
                    Aberto ao público
                  </>
                )}
              </div>
            </div>
          )}

          <Button 
            onClick={handleOpenModal} 
            variant="outline" 
            className="w-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurar Agendamento Online
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configurações de Agendamento Online</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_enabled"
                checked={formData.is_enabled}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, is_enabled: checked }))
                }
              />
              <Label htmlFor="is_enabled">Ativar Agendamento Online</Label>
            </div>

            {formData.is_enabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="custom_slug">
                    Slug Personalizado *
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">prive.click/</span>
                    <Input
                      id="custom_slug"
                      value={formData.custom_slug || ''}
                      onChange={(e) => 
                        setFormData(prev => ({ 
                          ...prev, 
                          custom_slug: e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, '') 
                        }))
                      }
                      placeholder="meu-slug"
                      required={formData.is_enabled}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Apenas letras minúsculas, números e hífens
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="require_account"
                    checked={formData.require_account}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, require_account: checked }))
                    }
                  />
                  <Label htmlFor="require_account">
                    Exigir conta para agendar
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Se ativado, apenas usuários logados poderão fazer agendamentos
                </p>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateSettings.isPending}
                className="flex-1"
              >
                {updateSettings.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModelOnlineBookingSettings;