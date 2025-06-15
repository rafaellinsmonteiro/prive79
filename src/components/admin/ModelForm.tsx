
import { useState, useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCreateModel, useUpdateModel } from '@/hooks/useAdminModels';
import { useModel, Model } from '@/hooks/useModels';
import { useToast } from '@/hooks/use-toast';
import MediaManager from '@/components/admin/MediaManager';
import { useCities } from '@/hooks/useCities';
import { Form } from "@/components/ui/form";
import { useAdminCategories } from '@/hooks/useAdminCategories';
import { supabase } from '@/integrations/supabase/client';
import BasicInfoSection from './model-form/BasicInfoSection';
import CategoriesSection from './model-form/CategoriesSection';
import PhysicalCharacteristicsSection from './model-form/PhysicalCharacteristicsSection';
import OtherInfoSection from './model-form/OtherInfoSection';
import SettingsSection from './model-form/SettingsSection';

interface ModelFormProps {
  modelId?: string;
  onSuccess: (newModel?: any) => void;
  onCancel: () => void;
}

export type ModelFormData = Omit<Model, 'id' | 'created_at' | 'updated_at' | 'photos' | 'categories'> & {
  category_ids: string[];
};

const ModelForm = ({ modelId, onSuccess, onCancel }: ModelFormProps) => {
  const [loading, setLoading] = useState(false);
  const createModel = useCreateModel();
  const updateModel = useUpdateModel();
  const { data: existingModel } = useModel(modelId || '');
  const { data: cities = [] } = useCities();
  const { data: categories = [] } = useAdminCategories();
  const { toast } = useToast();

  const form: UseFormReturn<ModelFormData> = useForm<ModelFormData>({
    defaultValues: {
      name: '',
      age: 18,
      city_id: undefined,
      neighborhood: '',
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
      display_order: 0,
      category_ids: [],
    }
  });

  const {
    handleSubmit,
    setValue,
  } = form;

  useEffect(() => {
    if (existingModel) {
      const modelKeys = Object.keys(form.getValues());
      modelKeys.forEach((key) => {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'photos' && key !== 'categories' && key !== 'category_ids') {
          const value = existingModel[key as keyof Model];
          if (value !== undefined && value !== null) {
            setValue(key as keyof ModelFormData, value as any);
          }
        }
      });
      if (existingModel.categories) {
        setValue('category_ids', existingModel.categories.map(c => c.id));
      }
    }
  }, [existingModel, setValue, form]);

  const onSubmit = async (data: ModelFormData) => {
    setLoading(true);
    try {
      const { category_ids, ...modelData } = data;
      // 'categories' is expected by the Model type but is handled by a join table.
      // We add it as an empty array to satisfy typing for the mutation hooks.
      const apiPayload = { ...modelData, categories: [] };
      let modelResult;
      
      if (modelId) {
        await updateModel.mutateAsync({ id: modelId, ...apiPayload } as any);
        modelResult = { id: modelId };
        toast({ title: "Sucesso", description: "Modelo atualizada com sucesso!" });
      } else {
        modelResult = await createModel.mutateAsync(apiPayload as any);
        toast({ title: "Modelo criada com sucesso!", description: "Agora você pode adicionar fotos e vídeos." });
      }
      
      const newModelId = modelResult.id;

      if (newModelId) {
        // Clear existing categories for the model
        const { error: deleteError } = await supabase.from('model_categories' as any).delete().eq('model_id', newModelId);
        if (deleteError) throw deleteError;
        
        // Insert new categories if any are selected
        if (category_ids && category_ids.length > 0) {
          const newJoins = category_ids.map(catId => ({
            model_id: newModelId,
            category_id: catId
          }));
          const { error: insertError } = await supabase.from('model_categories' as any).insert(newJoins);
          if (insertError) throw insertError;
        }
      }

      onSuccess(modelResult);
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
            <BasicInfoSection form={form} cities={cities} />
            <CategoriesSection form={form} categories={categories || []} />
            <PhysicalCharacteristicsSection form={form} />
            <OtherInfoSection form={form} />
            <SettingsSection form={form} />

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
