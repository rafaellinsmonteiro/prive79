import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCities } from '@/hooks/useCities';
import { useCustomFields, useCustomSections } from '@/hooks/useCustomFields';
import { User, Heart, Settings, Eye } from 'lucide-react';

interface EnhancedModelProfileManagerProps {
  profile: any;
}

const EnhancedModelProfileManager = ({ profile }: EnhancedModelProfileManagerProps) => {
  // Add loading state check
  if (!profile || !profile.models) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Carregando perfil...
          </div>
        </CardContent>
      </Card>
    );
  }

  const [formData, setFormData] = useState({
    // Informações básicas
    name: profile.models?.name || '',
    age: profile.models?.age || '',
    city_id: profile.models?.city_id || '',
    neighborhood: profile.models?.neighborhood || '',
    description: profile.models?.description || '',
    whatsapp_number: profile.models?.whatsapp_number || '',
    
    // Características físicas
    height: profile.models?.height || '',
    weight: profile.models?.weight || '',
    bust: profile.models?.bust || '',
    waist: profile.models?.waist || '',
    hip: profile.models?.hip || '',
    body_type: profile.models?.body_type || '',
    eyes: profile.models?.eyes || '',
    shoe_size: profile.models?.shoe_size || '',
    silicone: profile.models?.silicone || false,
    
    // Campos integrados
    olhos: profile.models?.olhos || '',
    cabelo: profile.models?.cabelo || '',
    etnia: profile.models?.etnia || '',
    tatuagem: profile.models?.tatuagem || false,
    
    // Configurações
    is_active: profile.models?.is_active !== false,
    languages: profile.models?.languages || '',
  });

  const [customFieldsData, setCustomFieldsData] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();
  const { data: cities = [] } = useCities();
  const { data: customFields = [] } = useCustomFields();
  const { data: customSections = [] } = useCustomSections();

  // Carregar dados dos campos personalizados
  useEffect(() => {
    if (profile.models && customFields.length > 0) {
      const customData: Record<string, any> = {};
      customFields.forEach(field => {
        const value = (profile.models as any)[field.field_name];
        if (value !== undefined && value !== null) {
          customData[field.field_name] = value;
        }
      });
      setCustomFieldsData(customData);
    }
  }, [profile.models, customFields]);

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('models')
        .update(data)
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
    
    const updateData = {
      ...formData,
      age: parseInt(formData.age) || null,
      ...customFieldsData
    };
    
    updateProfile.mutate(updateData);
  };

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setCustomFieldsData(prev => ({ ...prev, [fieldName]: value }));
  };

  const renderCustomField = (field: any) => {
    const value = customFieldsData[field.field_name] || '';

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Input
            value={value}
            onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
            placeholder={field.placeholder || ''}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
            placeholder={field.placeholder || ''}
            className="bg-zinc-800 border-zinc-700 text-white"
            rows={3}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.field_name, parseFloat(e.target.value) || '')}
            placeholder={field.placeholder || ''}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        );
      
      case 'boolean':
        return (
          <Switch
            checked={!!value}
            onCheckedChange={(checked) => handleCustomFieldChange(field.field_name, checked)}
          />
        );
      
      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleCustomFieldChange(field.field_name, val)}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        );
      
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
            placeholder={field.placeholder || ''}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        );
    }
  };

  const getSectionFields = (sectionName: string) => {
    return customFields.filter(field => 
      field.is_active && field.section === sectionName
    ).sort((a, b) => a.display_order - b.display_order);
  };

  const activeSections = customSections
    .filter(section => section.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            Meu Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="physical">Físico</TabsTrigger>
                <TabsTrigger value="custom">Extras</TabsTrigger>
                <TabsTrigger value="settings">Config</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-zinc-300">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="age" className="text-zinc-300">Idade *</Label>
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
                    <Select value={formData.city_id} onValueChange={(value) => handleInputChange('city_id', value)}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue placeholder="Selecione a cidade..." />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Label htmlFor="whatsapp" className="text-zinc-300">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp_number}
                      onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <Label htmlFor="languages" className="text-zinc-300">Idiomas</Label>
                    <Input
                      id="languages"
                      value={formData.languages}
                      onChange={(e) => handleInputChange('languages', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder="Português, Inglês, Espanhol..."
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
                    placeholder="Conte um pouco sobre você..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="physical" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="height" className="text-zinc-300">Altura</Label>
                    <Input
                      id="height"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder="1,65m"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="weight" className="text-zinc-300">Peso</Label>
                    <Input
                      id="weight"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder="60kg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="shoe_size" className="text-zinc-300">Calçado</Label>
                    <Input
                      id="shoe_size"
                      value={formData.shoe_size}
                      onChange={(e) => handleInputChange('shoe_size', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder="37"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bust" className="text-zinc-300">Busto</Label>
                    <Input
                      id="bust"
                      value={formData.bust}
                      onChange={(e) => handleInputChange('bust', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder="90cm"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="waist" className="text-zinc-300">Cintura</Label>
                    <Input
                      id="waist"
                      value={formData.waist}
                      onChange={(e) => handleInputChange('waist', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder="65cm"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="hip" className="text-zinc-300">Quadril</Label>
                    <Input
                      id="hip"
                      value={formData.hip}
                      onChange={(e) => handleInputChange('hip', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder="95cm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="body_type" className="text-zinc-300">Manequim</Label>
                    <Input
                      id="body_type"
                      value={formData.body_type}
                      onChange={(e) => handleInputChange('body_type', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder="M, 40, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="olhos" className="text-zinc-300">Olhos</Label>
                    <Input
                      id="olhos"
                      value={formData.olhos}
                      onChange={(e) => handleInputChange('olhos', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder="Castanhos, Azuis..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="cabelo" className="text-zinc-300">Cabelo</Label>
                    <Input
                      id="cabelo"
                      value={formData.cabelo}
                      onChange={(e) => handleInputChange('cabelo', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder="Loiro, Moreno..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="etnia" className="text-zinc-300">Etnia</Label>
                    <Input
                      id="etnia"
                      value={formData.etnia}
                      onChange={(e) => handleInputChange('etnia', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder="Branca, Morena..."
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="silicone"
                      checked={formData.silicone}
                      onCheckedChange={(checked) => handleInputChange('silicone', checked)}
                    />
                    <Label htmlFor="silicone" className="text-zinc-300">Silicone</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="tatuagem"
                      checked={formData.tatuagem}
                      onCheckedChange={(checked) => handleInputChange('tatuagem', checked)}
                    />
                    <Label htmlFor="tatuagem" className="text-zinc-300">Tatuagem</Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-6 mt-6">
                {activeSections.map(section => {
                  const sectionFields = getSectionFields(section.name);
                  if (sectionFields.length === 0) return null;

                  return (
                    <Card key={section.id} className="bg-zinc-800 border-zinc-700">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">{section.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {sectionFields.map(field => (
                            <div key={field.id}>
                              <Label className="text-zinc-300">
                                {field.label}
                                {field.is_required && <span className="text-red-400 ml-1">*</span>}
                              </Label>
                              {renderCustomField(field)}
                              {field.help_text && (
                                <p className="text-xs text-zinc-500 mt-1">{field.help_text}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {activeSections.length === 0 && (
                  <div className="text-center text-zinc-400 py-8">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum campo personalizado disponível</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 mt-6">
                <Card className="bg-zinc-800 border-zinc-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Visibilidade do Perfil
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                    <p className="text-xs text-zinc-500">
                      Quando desativado, seu perfil não aparecerá nas buscas dos clientes
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
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

export default EnhancedModelProfileManager;