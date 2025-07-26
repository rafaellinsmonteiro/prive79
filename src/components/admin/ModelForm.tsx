import { useState, useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateModel, useUpdateModel } from '@/hooks/useAdminModels';
import { useModel, Model } from '@/hooks/useModels';
import { useToast } from '@/hooks/use-toast';
import MediaManager from '@/components/admin/MediaManager';
import { useCities } from '@/hooks/useCities';
import { Form } from "@/components/ui/form";
import { useAdminCategories } from '@/hooks/useAdminCategories';
import { useCustomFields } from '@/hooks/useCustomFields';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import BasicInfoSection from './model-form/BasicInfoSection';
import CategoriesSection from './model-form/CategoriesSection';
import PhysicalCharacteristicsSection from './model-form/PhysicalCharacteristicsSection';
import SettingsSection from './model-form/SettingsSection';
import VisibilitySection from './model-form/VisibilitySection';
import CustomFieldsSection from './model-form/CustomFieldsSection';
import { Copy } from 'lucide-react';

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
    }
  });

  const { handleSubmit, setValue, watch, reset } = form;

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
      console.log('🔄 FORM: Available custom fields:', customFields.map(f => ({ name: f.field_name, type: f.field_type })));
      
      // Criar objeto com todos os dados do modelo
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
      
      // Carregar TODOS os campos personalizados do banco de dados
      customFields.forEach(field => {
        const modelValue = (existingModel as any)[field.field_name];
        
        console.log(`🔧 Loading field ${field.field_name} (${field.field_type}): value=${modelValue}, section=${field.section}`);
        
        if (modelValue !== undefined && modelValue !== null) {
          // Para campos integrados (olhos, tatuagem, etc) usar nome direto
          const integratedFields = ['olhos', 'tatuagem', 'cabelo', 'etnia', 'nossa_recomendacao'];
          if (integratedFields.includes(field.field_name)) {
            (formData as any)[field.field_name] = modelValue;
          } else {
            // Para outros campos personalizados usar custom_ prefix
            (formData as any)[`custom_${field.field_name}`] = modelValue;
          }
        } else {
          // Sempre inicializar campos para que sejam renderizados no formulário
          const integratedFields = ['olhos', 'tatuagem', 'cabelo', 'etnia', 'nossa_recomendacao'];
          if (integratedFields.includes(field.field_name)) {
            (formData as any)[field.field_name] = '';
          } else {
            (formData as any)[`custom_${field.field_name}`] = '';
          }
        }
      });
      
      console.log('🔄 FORM: Final form data with ALL custom fields:', formData);
      
      // Resetar o formulário
      reset(formData);
    }
  }, [existingModel, customFields, reset]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "ID copiado!", description: "ID do chat copiado para a área de transferência." });
  };

  const onSubmit = async (data: ModelFormData) => {
    console.log('🚀 FORM SUBMISSION STARTED');
    console.log('📊 Raw form data:', data);
    
    if (!user || !session) {
      console.log('❌ Authentication failed - no user or session');
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado como admin para realizar esta operação.",
        variant: "destructive",
      });
      return;
    }

    if (!isAdmin) {
      console.log('❌ Authorization failed - not admin');
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
      
      // Processar TODOS os campos - incluindo campos personalizados
      const modelData: any = {};
      
      // Campos numéricos que devem ser tratados especialmente
      const numericFields = ['1hora', '2horas', '3horas', 'pernoite', 'diaria'];
      
      // Primeiro adicionar todos os campos padrão do modelo
      Object.entries(formData).forEach(([key, value]) => {
        let processedValue = value;
        
        // Tratar campos numéricos - converter string vazia para null
        if (numericFields.includes(key) && (value === '' || value === undefined)) {
          processedValue = null;
        }
        
        if (key.startsWith('custom_')) {
          // Campo personalizado - remover o prefixo custom_
          const fieldName = key.replace('custom_', '');
          
          // Aplicar mesmo tratamento para campos personalizados numéricos
          if (numericFields.includes(fieldName) && (value === '' || value === undefined)) {
            processedValue = null;
          }
          
          modelData[fieldName] = processedValue;
          console.log(`🔧 Custom field ${fieldName} = ${processedValue}`);
        } else {
          // Campo padrão do modelo (incluindo campos integrados)
          modelData[key] = processedValue;
          console.log(`🔧 Standard field ${key} = ${processedValue}`);
        }
      });
      
      console.log('🔧 Final model data (all fields):', modelData);
      
      let modelResult;
      
      if (modelId) {
        console.log('📝 UPDATING MODEL:', modelId);
        console.log('📝 Update data being sent:', modelData);
        
        // Para atualização, vamos fazer a operação diretamente no Supabase
        // para ter mais controle sobre os dados que estão sendo enviados
        
        // Log da autenticação atual
        const { data: currentSession, error: sessionError } = await supabase.auth.getSession();
        console.log('🔐 Current session check:', { 
          hasSession: !!currentSession.session,
          isExpired: currentSession.session ? new Date(currentSession.session.expires_at || 0) < new Date() : true,
          userId: currentSession.session?.user?.id
        });
        
        if (sessionError || !currentSession.session) {
          throw new Error('Sessão inválida. Faça login novamente.');
        }
        
        console.log('📝 About to update model with data:', JSON.stringify(modelData, null, 2));
        console.log('📝 Model ID to update:', modelId);
        
        const { data: updatedModel, error: updateError } = await supabase
          .from('models')
          .update(modelData)
          .eq('id', modelId)
          .select()
          .single();
        
        if (updateError) {
          console.error('💥 Direct update error:', updateError);
          console.error('💥 Error code:', updateError.code);
          console.error('💥 Error message:', updateError.message);
          console.error('💥 Error details:', updateError.details);
          console.error('💥 Error hint:', updateError.hint);
          console.error('💥 Full error object:', JSON.stringify(updateError, null, 2));
          throw updateError;
        }
        
        console.log('✅ Direct update success:', updatedModel);
        console.log('✅ Rows affected:', updatedModel ? 'Model updated' : 'No model returned');
        modelResult = updatedModel;
        
        toast({ title: "Sucesso", description: "Modelo atualizada com sucesso!" });
        
      } else {
        console.log('➕ CREATING NEW MODEL');
        console.log('➕ Create data being sent:', modelData);
        modelResult = await createModel.mutateAsync(modelData as any);
        toast({ 
          title: "Modelo criada com sucesso!", 
          description: `ID do Chat: ${modelResult.id}. Agora você pode adicionar fotos e vídeos.` 
        });
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
      console.error('💥 Error name:', error.name);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error stack:', error.stack);
      
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
        errorMessage = `Erro: campo "${error.message.match(/column "(\w+)"/)?.[1] || 'desconhecido'}" não encontrado na tabela. Contate o administrador do sistema.`;
      } else if (error.code === 'PGRST204') {
        errorMessage = `Erro de schema: ${error.message}. O campo pode estar mal configurado.`;
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
            
            {/* ID do Chat - Nova Seção */}
            {modelId && (
              <div className="space-y-4 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                <h3 className="text-lg font-medium text-blue-300 flex items-center gap-2">
                  💬 Informações do Chat
                </h3>
                <div className="space-y-2">
                  <Label className="text-blue-200">ID do Chat da Modelo</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={modelId}
                      readOnly
                      className="bg-blue-900/30 border-blue-600 text-blue-100 font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(modelId)}
                      className="border-blue-600 text-blue-300 hover:bg-blue-800"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-blue-300">
                    Este é o ID único usado para identificar esta modelo no sistema de chat. 
                    Quando um usuário for atribuído a este perfil, ele herdará este ID.
                  </p>
                </div>
              </div>
            )}

            <BasicInfoSection form={form} cities={cities} />
            <CategoriesSection form={form} categories={categories || []} />
            <PhysicalCharacteristicsSection form={form} />
            <CustomFieldsSection form={form} />
            <VisibilitySection form={form} />
            <SettingsSection form={form} />

            {/* Debug info */}
            <div className="text-xs text-yellow-400 p-4 bg-zinc-800 rounded border-2 border-yellow-400">
              <p className="font-bold text-yellow-300">🐛 DEBUG FORM VALUES:</p>
              <p className="text-white">Model ID (Chat ID): <span className="text-green-400">{modelId || 'Será gerado após criação'}</span></p>
              <p className="text-white">visibility_type: <span className="text-green-400">{watch('visibility_type')}</span></p>
              <p className="text-white">allowed_plan_ids: <span className="text-green-400">{JSON.stringify(watch('allowed_plan_ids'))}</span></p>
              <p className="text-xs text-gray-400 mt-2">O ID da modelo é usado como ID do chat</p>
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
