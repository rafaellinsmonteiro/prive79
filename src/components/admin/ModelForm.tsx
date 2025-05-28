import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useCreateModel, useUpdateModel } from '@/hooks/useAdminModels';
import { useModel } from '@/hooks/useModels';
import { Model } from '@/hooks/useModels';

interface ModelFormProps {
  modelId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

type ModelFormData = Omit<Model, 'id' | 'created_at' | 'updated_at' | 'photos'>;

const ModelForm = ({ modelId, onSuccess, onCancel }: ModelFormProps) => {
  const [loading, setLoading] = useState(false);
  const createModel = useCreateModel();
  const updateModel = useUpdateModel();
  const { data: existingModel } = useModel(modelId || '');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ModelFormData>({
    defaultValues: {
      name: '',
      age: 18,
      location: '',
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

  const silicone = watch('silicone');

  useEffect(() => {
    if (existingModel) {
      Object.keys(existingModel).forEach((key) => {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'photos') {
          setValue(key as keyof ModelFormData, existingModel[key as keyof Model] as any);
        }
      });
    }
  }, [existingModel, setValue]);

  const onSubmit = async (data: ModelFormData) => {
    setLoading(true);
    try {
      if (modelId) {
        await updateModel.mutateAsync({ id: modelId, ...data });
      } else {
        await createModel.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving model:', error);
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Nome *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Nome é obrigatório' })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              {errors.name && (
                <p className="text-red-400 text-sm">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="text-white">Idade *</Label>
              <Input
                id="age"
                type="number"
                {...register('age', { 
                  required: 'Idade é obrigatória',
                  min: { value: 18, message: 'Idade mínima é 18 anos' }
                })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              {errors.age && (
                <p className="text-red-400 text-sm">{errors.age.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-white">Localização</Label>
              <Input
                id="location"
                {...register('location')}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_number" className="text-white">WhatsApp</Label>
              <Input
                id="whatsapp_number"
                {...register('whatsapp_number')}
                placeholder="5511999999999"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order" className="text-white">Ordem de Exibição</Label>
              <Input
                id="display_order"
                type="number"
                {...register('display_order', { 
                  valueAsNumber: true,
                  min: { value: 0, message: 'Ordem deve ser maior ou igual a 0' }
                })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appearance" className="text-white">Aparência</Label>
              <Input
                id="appearance"
                {...register('appearance')}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height" className="text-white">Altura</Label>
              <Input
                id="height"
                {...register('height')}
                placeholder="1.70m"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight" className="text-white">Peso</Label>
              <Input
                id="weight"
                {...register('weight')}
                placeholder="60kg"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shoe_size" className="text-white">Calçado</Label>
              <Input
                id="shoe_size"
                {...register('shoe_size')}
                placeholder="37"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bust" className="text-white">Busto</Label>
              <Input
                id="bust"
                {...register('bust')}
                placeholder="90cm"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="waist" className="text-white">Cintura</Label>
              <Input
                id="waist"
                {...register('waist')}
                placeholder="60cm"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hip" className="text-white">Quadril</Label>
              <Input
                id="hip"
                {...register('hip')}
                placeholder="90cm"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body_type" className="text-white">Manequim</Label>
              <Input
                id="body_type"
                {...register('body_type')}
                placeholder="P, M, G"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eyes" className="text-white">Olhos</Label>
              <Input
                id="eyes"
                {...register('eyes')}
                placeholder="Castanhos"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="languages" className="text-white">Idiomas</Label>
              <Input
                id="languages"
                {...register('languages')}
                placeholder="Português, Inglês"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="silicone"
                checked={silicone}
                onCheckedChange={(checked) => setValue('silicone', checked)}
              />
              <Label htmlFor="silicone" className="text-white">Silicone</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                {...register('is_active')}
                defaultChecked={true}
              />
              <Label htmlFor="is_active" className="text-white">Ativa</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Descrição</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={4}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : (modelId ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ModelForm;
