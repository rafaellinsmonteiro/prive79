
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
import { useAuth } from '@/hooks/useAuth';
import BasicInfoSection from './model-form/BasicInfoSection';
import CategoriesSection from './model-form/CategoriesSection';
import PhysicalCharacteristicsSection from './model-form/PhysicalCharacteristicsSection';
import OtherInfoSection from './model-form/OtherInfoSection';
import SettingsSection from './model-form/SettingsSection';
import VisibilitySection from './model-form/VisibilitySection';

interface ModelFormProps {
  modelId?: string;
  onSuccess: (newModel?: any) => void;
  onCancel: () => void;
}

export type ModelFormData = Omit<Model, 'id' | 'created_at' | 'updated_at' | 'photos' | 'categories'> & {
  category_ids: string[];
  visibility_type?: string;
  allowed_plan_ids?: string[];
};

const ModelForm = ({ modelId, onSuccess, onCancel }: ModelFormProps) => {
  const [loading, setLoading] = useState(false);
  const createModel = useCreateModel();
  const updateModel = useUpdateModel();
  const { data: existingModel } = useModel(modelId || '');
  const { data: cities = [] } = useCities();
  const { data: categories = [] } = useAdminCategories();
  const { toast } = useToast();
  const { user, isAdmin, session } = useAuth();

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
      visibility_type: 'public',
      allowed_plan_ids: [],
    }
  });

  const {
    handleSubmit,
    setValue,
  } = form;

  // Debug do estado de autenticação
  useEffect(() => {
    console.log('ModelForm - Auth state:', {
      user: !!user,
      userId: user?.id,
      isAdmin,
      session: !!session,
      sessionValid: session && new Date(session.expires_at || 0) > new Date()
    });
  }, [user, isAdmin, session]);

  useEffect(() => {
    if (existingModel) {
      console.log('ModelForm - Loading existing model data:', existingModel);
      
      const modelKeys = Object.keys(form.getValues());
      modelKeys.forEach((key) => {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'photos' && key !== 'categories' && key !== 'category_ids') {
          const value = existingModel[key as keyof Model];
          if (value !== undefined && value !== null) {
            setValue(key as keyof ModelFormData, value as any);
          }
        }
      });
      
      // Set categories
      if (existingModel.categories) {
        setValue('category_ids', existingModel.categories.map(c => c.id));
      }
      
      // Set visibility settings with proper defaults
      setValue('visibility_type', existingModel.visibility_type || 'public');
      setValue('allowed_plan_ids', existingModel.allowed_plan_ids || []);
      
      console.log('ModelForm - Set visibility values:', {
        visibility_type: existingModel.visibility_type || 'public',
        allowed_plan_ids: existingModel.allowed_plan_ids || []
      });
    }
  }, [existingModel, setValue, form]);

  const onSubmit = async (data: ModelFormData) => {
    console.log('Form submission started:', {
      user: !!user,
      userId: user?.id,
      isAdmin,
      session: !!session
    });

    // Verificar autenticação antes de prosseguir
    if (!user || !session) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado como admin para realizar esta operação.",
        variant: "destructive",
      });
      return;
    }

    if (!isAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Apenas administradores podem gerenciar modelos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { category_ids, ...modelData } = data;
      console.log('Submitting model data:', { modelData, category_ids });
      
      let modelResult;
      
      if (modelId) {
        console.log('Updating model:', modelId);
        await updateModel.mutateAsync({ id: modelId, ...modelData } as any);
        modelResult = { id: modelId };
        toast({ title: "Sucesso", description: "Modelo atualizada com sucesso!" });
      } else {
        console.log('Creating new model');
        modelResult = await createModel.mutateAsync(modelData as any);
        toast({ title: "Modelo criada com sucesso!", description: "Agora você pode adicionar fotos e vídeos." });
      }
      
      const newModelId = modelResult.id;
      console.log('Model operation successful, managing categories:', { newModelId, category_ids });

      if (newModelId) {
        // Verificar sessão novamente antes das operações de categorias
        const { data: currentSession } = await supabase.auth.getSession();
        if (!currentSession.session) {
          throw new Error('Sessão expirada. Faça login novamente.');
        }

        // Clear existing categories for the model
        console.log('Clearing existing categories for model:', newModelId);
        const { error: deleteError } = await supabase
          .from('model_categories' as any)
          .delete()
          .eq('model_id', newModelId);
        
        if (deleteError) {
          console.error('Error deleting existing categories:', deleteError);
          throw deleteError;
        }
        
        // Insert new categories if any are selected
        if (category_ids && category_ids.length > 0) {
          console.log('Inserting new categories:', category_ids);
          const newJoins = category_ids.map(catId => ({
            model_id: newModelId,
            category_id: catId
          }));
          
          const { error: insertError } = await supabase
            .from('model_categories' as any)
            .insert(newJoins);
          
          if (insertError) {
            console.error('Error inserting categories:', insertError);
            throw insertError;
          }
        }
      }

      onSuccess(modelResult);
    } catch (error: any) {
      console.error('Error saving model:', error);
      
      let errorMessage = "Erro ao salvar modelo. Tente novamente.";
      
      // Mensagens de erro mais específicas
      if (error.message?.includes('auth')) {
        errorMessage = "Erro de autenticação. Faça login novamente.";
      } else if (error.message?.includes('permission') || error.message?.includes('policy')) {
        errorMessage = "Você não tem permissão para realizar esta operação.";
      } else if (error.message?.includes('Sessão expirada')) {
        errorMessage = error.message;
      } else if (error.message?.includes('categories')) {
        errorMessage = "Erro ao configurar categorias. Modelo salvo com sucesso.";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Verificar se o usuário está autenticado antes de renderizar o formulário
  if (!user || !isAdmin) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="text-center text-zinc-400">
            <p>Você precisa estar logado como administrador para acessar esta funcionalidade.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            <VisibilitySection form={form} />
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
