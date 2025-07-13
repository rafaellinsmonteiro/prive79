import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentModel } from '@/hooks/useCurrentModel';

const ModelOnlineToggle = () => {
  const { data: modelProfile } = useCurrentModel();
  const model = modelProfile?.models;
  const [isOnline, setIsOnline] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (model?.id) {
      loadOnlineStatus();
    }
  }, [model?.id]);

  const loadOnlineStatus = async () => {
    if (!model?.id) return;

    try {
      const { data: modelData, error } = await supabase
        .from('models')
        .select('is_online, manual_status_override')
        .eq('id', model.id)
        .single();

      if (error) throw error;

      setIsOnline(modelData.is_online || false);
      setManualOverride(modelData.manual_status_override || false);
    } catch (error) {
      console.error('Error loading online status:', error);
    }
  };

  const toggleOnlineStatus = async () => {
    if (!model?.id) return;

    setLoading(true);
    try {
      const newOnlineStatus = !isOnline;
      const newManualOverride = true; // Always set manual override when user toggles

      const { error } = await supabase
        .from('models')
        .update({
          is_online: newOnlineStatus,
          manual_status_override: newManualOverride,
          last_status_update: new Date().toISOString()
        })
        .eq('id', model.id);

      if (error) throw error;

      setIsOnline(newOnlineStatus);
      setManualOverride(newManualOverride);

      toast({
        title: newOnlineStatus ? "Agora você está online" : "Agora você está offline",
        description: newOnlineStatus 
          ? "Você aparecerá como disponível para clientes"
          : "Você não aparecerá como disponível para clientes"
      });
    } catch (error) {
      console.error('Error updating online status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status online",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetToAutoMode = async () => {
    if (!model?.id) return;

    setLoading(true);
    try {
      // Reset manual override and update status based on working hours
      const { error } = await supabase
        .from('models')
        .update({
          manual_status_override: false,
          last_status_update: new Date().toISOString()
        })
        .eq('id', model.id);

      if (error) throw error;

      // Update model online status based on working hours
      await supabase.rpc('update_model_online_status');

      // Reload the status
      await loadOnlineStatus();

      toast({
        title: "Modo automático ativado",
        description: "Seu status será atualizado automaticamente baseado nos horários configurados"
      });
    } catch (error) {
      console.error('Error resetting to auto mode:', error);
      toast({
        title: "Erro",
        description: "Erro ao ativar modo automático",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!model) return null;

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-gray-500" />
        )}
        <Switch
          checked={isOnline}
          onCheckedChange={toggleOnlineStatus}
          disabled={loading}
        />
        <Label className="font-medium">
          {isOnline ? 'Disponível' : 'Indisponível'}
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={isOnline ? "default" : "secondary"}>
          {isOnline ? 'On' : 'Off'}
        </Badge>
        
        {manualOverride && (
          <Badge variant="outline" className="text-xs">
            M
          </Badge>
        )}
      </div>

      {manualOverride && (
        <Button
          size="sm"
          variant="ghost"
          onClick={resetToAutoMode}
          disabled={loading}
          className="text-xs"
        >
          A
        </Button>
      )}
    </div>
  );
};

export default ModelOnlineToggle;