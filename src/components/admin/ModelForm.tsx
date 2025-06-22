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
import { useCustomFields } from '@/hooks/useCustomFields';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import BasicInfoSection from './model-form/BasicInfoSection';
import CategoriesSection from './model-form/CategoriesSection';
import PhysicalCharacteristicsSection from './model-form/PhysicalCharacteristicsSection';
import OtherInfoSection from './model-form/OtherInfoSection';
import SettingsSection from './model-form/SettingsSection';
import VisibilitySection from './model-form/VisibilitySection';
import CustomFieldsSection from './model-form/CustomFieldsSection';

interface ModelFormProps {
  modelId?: string;
  onSuccess: (newModel?: any) => void;
  onCancel: () => void;
}

export type ModelFormData = Omit<Model, 'id' | 'created_at' | 'updated_at' | 'photos' | 'categories'> & {
  category_ids: string[];
  visibility_type?: string;
  allowed_plan_ids?: string[];
  // Campos personalizados dinâmicos
  [key: string]: any;
};

const ModelForm = ({ modelId, onSuccess, onCancel }: ModelFormProps) => {
  const [loading, setLoading] = useState(false);
  const createModel = useCreateModel();
  const updateModel = useUpdateModel();
  const { data: existingModel } = useModel(modelId || '');
  const { data: cities = [] } = useCities();
  const { data: categories = [] } = useAdminCategories();
  const { data: customFields = [] } = useCustomFields();
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
      // Campos personalizados integrados
      olhos: '',
      tatuagem: false,
      cabelo: '',
      etnia: '',
    }
  });

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
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
    if (existingModel && customFields.length > 0) {
      console.log('🔄 FORM: Loading existing model data:', existingModel);
      console.log('🔄 FORM: Available custom fields:', customFields.map(f => f.field_name));
      
      // Primeiro, criar um objeto com todos os dados do modelo
      const formData: ModelFormData = {
        name: existingModel.name || '',
        age: existingModel.age || 18,
        city_id: existingModel.city_id || undefined,
        neighborhood: existingModel.neighborhood || '',
        height: existingModel.height || '',
        weight: existingModel.weight || '',
        silicone: !!existingModel.silicone,
        shoe_size: existingModel.shoe_size || '',
        bust: existingModel.bust || '',
        waist: existingModel.waist || '',
        hip: existingModel.hip || '',
        body_type: existingModel.body_type || '',
        eyes: existingModel.eyes || '',
        languages: existingModel.languages || '',
        description: existingModel.description || '',
        whatsapp_number: existingModel.whatsapp_number || '',
        is_active: existingModel.is_active !== false,
        display_order: existingModel.display_order || 0,
        category_ids: existingModel.categories ? existingModel.categories.map(c => c.id) : [],
        visibility_type: existingModel.visibility_type || 'public',
        allowed_plan_ids: Array.isArray(existingModel.allowed_plan_ids) 
          ? existingModel.allowed_plan_ids 
          : [],
      };
      
      // Adicionar campos personalizados integrados
      const integratedFields = ['olhos', 'tatuagem', 'cabelo', 'etnia'];
      integratedFields.forEach(fieldName => {
        const modelValue = (existingModel as any)[fieldName];
        if (modelValue !== undefined && modelValue !== null) {
          console.log(`🔧 Loading integrated field ${fieldName}:`, modelValue);
          (formData as any)[fieldName] = modelValue;
        }
      });
      
      // Adicionar outros campos personalizados
      customFields.forEach(field => {
        if (!integratedFields.includes(field.field_name)) {
          const customFieldKey = `custom_${field.field_name}`;
          const modelValue = (existingModel as any)[field.field_name] || (existingModel as any)[customFieldKey];
          
          if (modelValue !== undefined && modelValue !== null) {
            console.log(`🔧 Loading custom field ${field.field_name}:`, modelValue);
            (formData as any)[customFieldKey] = modelValue;
          }
        }
      });
      
      console.log('🔄 FORM: Final form data with custom fields:', formData);
      
      // Resetar o formulário com todos os dados de uma vez
      reset(formData);
      
      // Forçar trigger para garantir que os valores sejam aplicados
      setTimeout(() => {
        const currentValues = form.getValues();
        console.log('🔄 FORM: Values after reset:', {
          visibility_type: currentValues.visibility_type,
          allowed_plan_ids: currentValues.allowed_plan_ids,
          olhos: currentValues.olhos,
          tatuagem: currentValues.tatuagem
        });
        
        // Se ainda não estiver correto, forçar os valores individualmente
        if (currentValues.visibility_type !== formData.visibility_type || 
            JSON.stringify(currentValues.allowed_plan_ids) !== JSON.stringify(formData.allowed_plan_ids)) {
          console.log('🔧 FORM: Force setting visibility values...');
          setValue('visibility_type', formData.visibility_type, { shouldDirty: true, shouldTouch: true });
          setValue('allowed_plan_ids', formData.allowed_plan_ids, { shouldDirty: true, shouldTouch: true });
        }
      }, 100);
    }
  }, [existingModel, customFields, reset, setValue, form]);

  const onSubmit = async (data: ModelFormData) => {
    console.log('🚀 FORM SUBMISSION STARTED');
    console.log('📊 Raw form data:', data);
    
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
      const { category_ids, ...formData } = data;
      
      // Separar campos personalizados dos campos do modelo
      const modelData: any = {};
      const integratedFields = ['olhos', 'tatuagem', 'cabelo', 'etnia'];
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key.startsWith('custom_')) {
          // Campo personalizado - remover o prefixo custom_ e adicionar ao modelo
          const fieldName = key.replace('custom_', '');
          modelData[fieldName] = value;
          console.log(`🔧 Custom field ${fieldName} = ${value}`);
        } else {
          // Campo padrão do modelo (incluindo campos integrados)
          modelData[key] = value;
          if (integratedFields.includes(key)) {
            console.log(`🔧 Integrated field ${key} = ${value}`);
          }
        }
      });
      
      console.log('🔧 Model data (with all fields):', modelData);
      
      let modelResult;
      
      if (modelId) {
        console.log('📝 UPDATING MODEL:', modelId);
        const updateData = { id: modelId, ...modelData };
        
        console.log('📤 Sending update data to mutation:', updateData);
        
        await updateModel.mutateAsync(updateData as any);
        modelResult = { id: modelId };
        
        console.log('✅ UPDATE COMPLETED');
        
        toast({ title: "Sucesso", description: "Modelo atualizada com sucesso!" });
        
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
      onSuccess(modelResult);
    } catch (error: any) {
      console.error('💥 FORM SUBMISSION ERROR');
      console.error('💥 Error details:', error);
      
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
      } else if (error.message?.includes('column') && error.message?.includes('does not exist')) {
        errorMessage = "Erro: campo personalizado não reconhecido. Tente novamente.";
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
            <CustomFieldsSection form={form} />
            <VisibilitySection form={form} />
            <SettingsSection form={form} />

            {/* Debug info mais visível */}
            <div className="text-xs text-yellow-400 p-4 bg-zinc-800 rounded border-2 border-yellow-400">
              <p className="font-bold text-yellow-300">🐛 DEBUG FORM VALUES:</p>
              <p className="text-white">visibility_type: <span className="text-green-400">{watch('visibility_type')}</span></p>
              <p className="text-white">allowed_plan_ids: <span className="text-green-400">{JSON.stringify(watch('allowed_plan_ids'))}</span></p>
              <p className="text-white">olhos: <span className="text-green-400">{watch('olhos' as any)}</span></p>
              <p className="text-white">tatuagem: <span className="text-green-400">{String(watch('tatuagem' as any))}</span></p>
              <p className="text-xs text-gray-400 mt-2">Verificação dos valores dos campos personalizados</p>
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
