import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { useMenuConfigurations, useCreateMenuConfiguration, useDeleteMenuConfiguration } from '@/hooks/useAdminMenuItems';
import { useCities } from '@/hooks/useCities';
import { useToast } from '@/hooks/use-toast';

interface MenuConfigurationManagerProps {
  itemId: string;
}

const MenuConfigurationManager = ({ itemId }: MenuConfigurationManagerProps) => {
  const [newCityId, setNewCityId] = useState<string>('all');
  const [newUserType, setNewUserType] = useState<'guest' | 'authenticated' | 'all'>('all');
  const { data: configurations = [], isLoading } = useMenuConfigurations(itemId);
  const { data: cities = [] } = useCities();
  const createConfiguration = useCreateMenuConfiguration();
  const deleteConfiguration = useDeleteMenuConfiguration();
  const { toast } = useToast();

  const handleAddConfiguration = async () => {
    if (!newUserType) return;
    
    try {
      await createConfiguration.mutateAsync({
        menu_item_id: itemId,
        city_id: newCityId === 'all' ? undefined : newCityId,
        user_type: newUserType,
        is_active: true,
      });
      
      toast({
        title: "Sucesso",
        description: "Configuração de visibilidade adicionada!",
      });
      
      setNewCityId('all');
      setNewUserType('all');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message?.includes('duplicate') 
          ? "Esta configuração já existe."
          : "Erro ao adicionar configuração.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfiguration = async (configId: string) => {
    try {
      await deleteConfiguration.mutateAsync(configId);
      toast({
        title: "Sucesso",
        description: "Configuração removida!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover configuração.",
        variant: "destructive",
      });
    }
  };

  const getCityName = (cityId?: string) => {
    if (!cityId) return 'Todas as cidades';
    const city = cities.find(c => c.id === cityId);
    return city ? `${city.name} - ${city.state}` : 'Cidade não encontrada';
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'guest': return 'Visitantes';
      case 'authenticated': return 'Usuários logados';
      case 'all': return 'Todos';
      default: return userType;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-zinc-400">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Adicionar nova configuração */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Cidade
          </label>
          <Select value={newCityId} onValueChange={setNewCityId}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
              <SelectValue placeholder="Todas as cidades" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="all">Todas as cidades</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name} - {city.state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Tipo de Usuário
          </label>
          <Select value={newUserType} onValueChange={(value: 'guest' | 'authenticated' | 'all') => setNewUserType(value)}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="guest">Visitantes</SelectItem>
              <SelectItem value="authenticated">Usuários logados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleAddConfiguration}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {/* Lista de configurações existentes */}
      <div className="space-y-2">
        {configurations.length === 0 ? (
          <div className="text-center p-4 text-zinc-400 border border-dashed border-zinc-700 rounded-lg">
            <p>Nenhuma configuração de visibilidade definida.</p>
            <p className="text-sm mt-1">Adicione configurações para controlar onde este item aparece.</p>
          </div>
        ) : (
          configurations.map((config) => (
            <div
              key={config.id}
              className="flex items-center justify-between p-3 border border-zinc-700 rounded-lg bg-zinc-800/50"
            >
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {getCityName(config.city_id)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getUserTypeLabel(config.user_type)}
                </Badge>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteConfiguration(config.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {configurations.length > 0 && (
        <div className="text-xs text-zinc-500 p-2 bg-zinc-900 rounded border border-zinc-700">
          <strong>Dica:</strong> O item será exibido apenas nas condições configuradas acima. 
          Se não houver configurações, o item não aparecerá no menu público.
        </div>
      )}
    </div>
  );
};

export default MenuConfigurationManager;
