
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ModelProfileManagerProps {
  profile: any;
}

const ModelProfileManager = ({ profile }: ModelProfileManagerProps) => {
  const [formData, setFormData] = useState({
    name: profile.models?.name || '',
    age: profile.models?.age || '',
    city: profile.models?.city || '',
    neighborhood: profile.models?.neighborhood || '',
    description: profile.models?.description || '',
    whatsapp_number: profile.models?.whatsapp_number || '',
    height: profile.models?.height || '',
    weight: profile.models?.weight || '',
    is_active: profile.models?.is_active || false,
  });

  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('models')
        .update({
          name: data.name,
          age: parseInt(data.age),
          city: data.city,
          neighborhood: data.neighborhood,
          description: data.description,
          whatsapp_number: data.whatsapp_number,
          height: data.height,
          weight: data.weight,
          is_active: data.is_active,
        })
        .eq('id', profile.model_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model-profile'] });
      toast.success('Perfil atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Gerenciar Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-zinc-300">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="age" className="text-zinc-300">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="city" className="text-zinc-300">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="neighborhood" className="text-zinc-300">Bairro</Label>
                <Input
                  id="neighborhood"
                  value={formData.neighborhood}
                  onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="height" className="text-zinc-300">Altura</Label>
                <Input
                  id="height"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="weight" className="text-zinc-300">Peso</Label>
                <Input
                  id="weight"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="whatsapp" className="text-zinc-300">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp_number}
                  onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description" className="text-zinc-300">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                rows={4}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="is_active" className="text-zinc-300">
                Perfil Ativo
              </Label>
            </div>
            
            <Button 
              type="submit" 
              disabled={updateProfile.isPending}
              className="w-full"
            >
              {updateProfile.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelProfileManager;
