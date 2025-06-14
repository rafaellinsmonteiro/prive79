import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useCreateModel, useUpdateModel } from '@/hooks/useAdminModels';
import { useModel, Model } from '@/hooks/useModels';
import { useToast } from '@/hooks/use-toast';
import MediaManager from '@/components/admin/MediaManager';
import { useCities } from '@/hooks/useCities';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface ModelFormProps {
  modelId?: string;
  onSuccess: (newModel?: any) => void;
  onCancel: () => void;
}

type ModelFormData = Omit<Model, 'id' | 'created_at' | 'updated_at' | 'photos'>;

const ModelForm = ({ modelId, onSuccess, onCancel }: ModelFormProps) => {
  const [loading, setLoading] = useState(false);
  const createModel = useCreateModel();
  const updateModel = useUpdateModel();
  const { data: existingModel } = useModel(modelId || '');
  const { data: cities = [] } = useCities();
  const { toast } = useToast();

  const form = useForm<ModelFormData>({
    defaultValues: {
      name: '',
      age: 18,
      city_id: undefined,
      neighborhood: '',
      appearance: '',
      height: '',
      weight: '',
      silicone: false,
      shoe_size: '',
      bust: '',
      waist: '',
      hip: '',
      body_type: '',
      eyes: '',
      languages: '',
      description: '',
      whatsapp_number: '',
      is_active: true,
      display_order: 0
    }
  });

  const {
    handleSubmit,
    setValue,
    watch,
  } = form;

  const silicone = watch('silicone');
  const isActive = watch('is_active');

  useEffect(() => {
    if (existingModel) {
      Object.keys(existingModel).forEach((key) => {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'photos') {
          const value = existingModel[key as keyof Model];
          setValue(key as keyof ModelFormData, value as any);
        }
      });
    }
  }, [existingModel, setValue]);

  const onSubmit = async (data: ModelFormData) => {
    setLoading(true);
    try {
      if (modelId) {
        await updateModel.mutateAsync({ id: modelId, ...data });
        onSuccess();
      } else {
        const newModel = await createModel.mutateAsync(data);
        onSuccess(newModel);
      }
    } catch (error) {
      console.error('Error saving model:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar modelo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">
          {modelId ? 'Editar Modelo' : 'Nova Modelo'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Nome *</Label>
                  <Input
                    id="name"
                    {...form.register('name', { required: 'Nome é obrigatório' })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="Nome da modelo"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-400 text-sm">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="text-white">Idade *</Label>
                  <Input
                    id="age"
                    type="number"
                    {...form.register('age', { 
                      required: 'Idade é obrigatória',
                      min: { value: 18, message: 'Idade mínima é 18 anos' },
                      max: { value: 65, message: 'Idade máxima é 65 anos' }
                    })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                  {form.formState.errors.age && (
                    <p className="text-red-400 text-sm">{form.formState.errors.age.message}</p>
                  )}
                </div>
                
                <FormField
                  control={form.control}
                  name="city_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Cidade</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined} defaultValue={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                            <SelectValue placeholder="Selecione uma cidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                          {cities.map((city) => (
                            <SelectItem key={city.id} value={city.id}>
                              {city.name} - {city.state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label htmlFor="neighborhood" className="text-white">Bairro</Label>
                  <Input
                    id="neighborhood"
                    {...form.register('neighborhood')}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="Ex: Jardins"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp_number" className="text-white">WhatsApp</Label>
                  <Input
                    id="whatsapp_number"
                    {...form.register('whatsapp_number')}
                    placeholder="5511999999999"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Características Físicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
                Características Físicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-white">Altura</Label>
                  <Input
                    id="height"
                    {...form.register('height')}
                    placeholder="1.70m"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-white">Peso</Label>
                  <Input
                    id="weight"
                    {...form.register('weight')}
                    placeholder="60kg"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appearance" className="text-white">Aparência</Label>
                  <Input
                    id="appearance"
                    {...form.register('appearance')}
                    placeholder="Morena, Loira, etc."
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eyes" className="text-white">Olhos</Label>
                  <Input
                    id="eyes"
                    {...form.register('eyes')}
                    placeholder="Castanhos, Verdes, etc."
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body_type" className="text-white">Manequim</Label>
                  <Input
                    id="body_type"
                    {...form.register('body_type')}
                    placeholder="P, M, G, GG"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shoe_size" className="text-white">Calçado</Label>
                  <Input
                    id="shoe_size"
                    {...form.register('shoe_size')}
                    placeholder="37, 38, 39"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              {/* Medidas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bust" className="text-white">Busto</Label>
                  <Input
                    id="bust"
                    {...form.register('bust')}
                    placeholder="90cm"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="waist" className="text-white">Cintura</Label>
                  <Input
                    id="waist"
                    {...form.register('waist')}
                    placeholder="60cm"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hip" className="text-white">Quadril</Label>
                  <Input
                    id="hip"
                    {...form.register('hip')}
                    placeholder="90cm"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Outras Informações */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
                Outras Informações
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="languages" className="text-white">Idiomas</Label>
                <Input
                  id="languages"
                  {...form.register('languages')}
                  placeholder="Português, Inglês, Espanhol"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Descrição</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  rows={4}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Descrição detalhada da modelo..."
                />
              </div>
            </div>

            {/* Configurações */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
                Configurações
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="silicone"
                    checked={silicone}
                    onCheckedChange={(checked) => setValue('silicone', checked)}
                  />
                  <Label htmlFor="silicone" className="text-white">Possui Silicone</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={isActive}
                    onCheckedChange={(checked) => setValue('is_active', checked)}
                  />
                  <Label htmlFor="is_active" className="text-white">Perfil Ativo</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order" className="text-white">Ordem de Exibição</Label>
                <Input
                  id="display_order"
                  type="number"
                  {...form.register('display_order', { 
                    valueAsNumber: true,
                    min: { value: 0, message: 'Ordem deve ser maior ou igual a 0' }
                  })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="0"
                />
                <p className="text-zinc-400 text-sm">
                  Quanto menor o número, mais acima aparecerá na lista
                </p>
              </div>
            </div>

            {/* Gerenciar Mídia */}
            {modelId && (
              <div className="space-y-4 pt-6 border-t border-zinc-700">
                <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
                  Gerenciar Mídia
                </h3>
                <MediaManager modelId={modelId} />
              </div>
            )}

            {!modelId && (
              <div className="p-4 border border-dashed border-zinc-700 rounded-lg text-center text-zinc-400 bg-zinc-900/50">
                <p>Salve a modelo para poder adicionar fotos e vídeos.</p>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-6 border-t border-zinc-700">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : (modelId ? 'Atualizar Modelo' : 'Criar e Continuar')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ModelForm;
