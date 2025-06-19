
import { useState } from 'react';
import { useReelsSettings, useUpdateReelsSettings } from '@/hooks/useReelsSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const ReelsSettings = () => {
  const { data: settings, isLoading } = useReelsSettings();
  const updateSettings = useUpdateReelsSettings();
  const [formData, setFormData] = useState({
    is_enabled: true,
    auto_play: true,
    show_controls: false,
    max_duration: 60,
    items_per_page: 10,
  });

  // Atualizar formData quando settings carregarem
  useState(() => {
    if (settings) {
      setFormData({
        is_enabled: settings.is_enabled,
        auto_play: settings.auto_play,
        show_controls: settings.show_controls,
        max_duration: settings.max_duration || 60,
        items_per_page: settings.items_per_page || 10,
      });
    }
  });

  const handleSave = () => {
    if (settings) {
      updateSettings.mutate({
        id: settings.id,
        ...formData,
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="text-center text-zinc-400">
            Carregando configurações...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Configurações Gerais dos Reels</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ativar/Desativar Módulo */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-white font-medium">Módulo de Reels</Label>
            <p className="text-sm text-zinc-400">
              Ativar ou desativar completamente o módulo de reels
            </p>
          </div>
          <Switch
            checked={formData.is_enabled}
            onCheckedChange={(checked) =>
              setFormData(prev => ({ ...prev, is_enabled: checked }))
            }
          />
        </div>

        <Separator className="bg-zinc-700" />

        {/* Configurações de Reprodução */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Configurações de Reprodução</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white">Auto-play</Label>
              <p className="text-sm text-zinc-400">
                Reproduzir vídeos automaticamente
              </p>
            </div>
            <Switch
              checked={formData.auto_play}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, auto_play: checked }))
              }
              disabled={!formData.is_enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white">Mostrar Controles</Label>
              <p className="text-sm text-zinc-400">
                Exibir controles de vídeo (play, pause, etc.)
              </p>
            </div>
            <Switch
              checked={formData.show_controls}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, show_controls: checked }))
              }
              disabled={!formData.is_enabled}
            />
          </div>
        </div>

        <Separator className="bg-zinc-700" />

        {/* Configurações de Conteúdo */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Configurações de Conteúdo</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Duração Máxima (segundos)</Label>
              <Input
                type="number"
                value={formData.max_duration}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, max_duration: parseInt(e.target.value) || 60 }))
                }
                disabled={!formData.is_enabled}
                className="bg-zinc-800 border-zinc-700 text-white"
                min="10"
                max="300"
              />
              <p className="text-xs text-zinc-400">
                Duração máxima permitida para vídeos nos reels
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Itens por Página</Label>
              <Input
                type="number"
                value={formData.items_per_page}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, items_per_page: parseInt(e.target.value) || 10 }))
                }
                disabled={!formData.is_enabled}
                className="bg-zinc-800 border-zinc-700 text-white"
                min="5"
                max="50"
              />
              <p className="text-xs text-zinc-400">
                Número de vídeos carregados por vez
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave}
            disabled={updateSettings.isPending}
          >
            {updateSettings.isPending ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReelsSettings;
