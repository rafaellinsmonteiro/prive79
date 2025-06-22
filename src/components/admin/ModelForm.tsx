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
    watch,
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
      console.log('ModelForm - Existing model visibility settings:', {
        visibility_type: existingModel.visibility_type,
        allowed_plan_ids: existingModel.allowed_plan_ids
      });
      
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
      
      // Set visibility settings with proper defaults and extra logging
      const visibilityType = existingModel.visibility_type || 'public';
      const allowedPlanIds = existingModel.allowed_plan_ids || [];
      
      console.log('ModelForm - Setting visibility form values:', {
        visibility_type: visibilityType,
        allowed_plan_ids: allowedPlanIds
      });
      
      setValue('visibility_type', visibilityType);
      setValue('allowed_plan_ids', allowedPlanIds);
      
      // Verificar se realmente foi definido no formulário
      setTimeout(() => {
        const currentValues = form.getValues();
        console.log('ModelForm - Form values after setting:', {
          visibility_type: currentValues.visibility_type,
          allowed_plan_ids: currentValues.allowed_plan_ids
        });
      }, 100);
    }
  }, [existingModel, setValue, form]);

  const onSubmit = async (data: ModelFormData) => {
    // Log básico que sempre deve aparecer
    alert('Form submission started!'); // Alert para garantir visibilidade
    console.log('🚀 FORM SUBMISSION STARTED');
    console.log('📊 Raw form data:', data);
    console.log('👀 Visibility type:', data.visibility_type);
    console.log('📋 Allowed plan IDs:', data.allowed_plan_ids);
    
    if (!user || !session) {
      alert('Auth error!');
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado como admin para realizar esta operação.",
        variant: "destructive",
      });
      return;
    }

    if (!isAdmin) {
      alert('Admin error!');
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
      
      console.log('🔧 Processing model data...');
      console.log('🔧 Model data after removing category_ids:', modelData);
      console.log('🔧 Visibility in model data:', {
        visibility_type: modelData.visibility_type,
        allowed_plan_ids: modelData.allowed_plan_ids
      });
      
      let modelResult;
      
      if (modelId) {
        console.log('📝 UPDATING MODEL:', modelId);
        const updateData = { id: modelId, ...modelData };
        
        console.log('📤 Sending update data to mutation:', updateData);
        console.log('📤 Visibility being sent:', {
          visibility_type: updateData.visibility_type,
          allowed_plan_ids: updateData.allowed_plan_ids
        });
        
        alert(`Updating with visibility: ${updateData.visibility_type}, plans: ${JSON.stringify(updateData.allowed_plan_ids)}`);
        
        await updateModel.mutateAsync(updateData as any);
        modelResult = { id: modelId };
        
        console.log('✅ UPDATE COMPLETED');
        alert('Update completed!');
        
        toast({ title: "Sucesso", description: "Modelo atualizada com sucesso!" });
        
        // Verificar se a atualização realmente funcionou
        console.log('🔍 Checking if update persisted...');
        const { data: updatedModel, error: checkError } = await supabase
          .from('models')
          .select('visibility_type, allowed_plan_ids')
          .eq('id', modelId)
          .single();
        
        if (checkError) {
          console.error('❌ Error checking updated model:', checkError);
          alert(`Error checking update: ${checkError.message}`);
        } else {
          console.log('🔍 Model data in database after update:', updatedModel);
          alert(`DB after update - Type: ${updatedModel.visibility_type}, Plans: ${JSON.stringify(updatedModel.allowed_plan_ids)}`);
        }
        
      } else {
        console.log('➕ CREATING NEW MODEL');
        modelResult = await createModel.mutateAsync(modelData as any);
        toast({ title: "Modelo criada com sucesso!", description: "Agora você pode adicionar fotos e vídeos." });
      }
      
      const newModelId = modelResult.id;
      console.log('🏷️ Managing categories for model:', { newModelId, category_ids });

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

      console.log('🎉 FORM SUBMISSION SUCCESS');
      alert('Success!');
      onSuccess(modelResult);
    } catch (error: any) {
      console.error('💥 FORM SUBMISSION ERROR');
      console.error('💥 Error details:', error);
      alert(`Error: ${error.message}`);
      
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

            {/* Debug info mais visível */}
            <div className="text-xs text-yellow-400 p-4 bg-zinc-800 rounded border-2 border-yellow-400">
              <p className="font-bold text-yellow-300">🐛 DEBUG FORM VALUES:</p>
              <p className="text-white">visibility_type: <span className="text-green-400">{watch('visibility_type')}</span></p>
              <p className="text-white">allowed_plan_ids: <span className="text-green-400">{JSON.stringify(watch('allowed_plan_ids'))}</span></p>
              <p className="text-xs text-gray-400 mt-2">Se estes valores estão corretos, clique em salvar e observe os alerts que vão aparecer</p>
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
