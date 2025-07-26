import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Model } from "./useModels";

export const useAdminModels = () => {
  return useQuery({
    queryKey: ['admin-models'],
    queryFn: async (): Promise<Model[]> => {
      const { data: modelsData, error: modelsError } = await supabase
        .from('models')
        .select('*, model_categories(categories(*))')
        .order('display_order', { ascending: true });

      if (modelsError) {
        console.error('Error fetching models:', modelsError);
        throw modelsError;
      }

      const { data: photosData, error: photosError } = await supabase
        .from('model_photos')
        .select('*')
        .order('display_order', { ascending: true });

      if (photosError) {
        console.error('Error fetching photos:', photosError);
        throw photosError;
      }

      return modelsData.map(model => {
        const modelWithCategories = model as any;
        const categories = modelWithCategories.model_categories?.map((mc: any) => mc.categories).filter(Boolean) || [];
        
        return {
          ...model,
          photos: photosData.filter(photo => photo.model_id === model.id),
          categories,
        } as Model;
      });
    },
  });
};

export const useCreateModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (modelData: Omit<Model, 'id' | 'created_at' | 'updated_at' | 'photos' | 'categories'>) => {
      console.log('Creating model with data:', modelData);
      
      // Remove any fields that don't exist in the models table
      const cleanModelData = { ...modelData };
      delete (cleanModelData as any).categories;
      delete (cleanModelData as any).location;
      delete (cleanModelData as any).cities;
      
      const { data, error } = await supabase
        .from('models')
        .insert(cleanModelData)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error creating model:', error);
        throw error;
      }
      
      console.log('Model created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};

export const useUpdateModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Model> & { id: string }) => {
      // Logs básicos sempre visíveis
      alert(`Hook received update for ID: ${id}`);
      console.log('🔥 HOOK: Update mutation started');
      console.log('🔥 HOOK: Model ID:', id);
      console.log('🔥 HOOK: Raw updates received:', updates);
      console.log('🔥 HOOK: Visibility data specifically:', {
        visibility_type: updates.visibility_type,
        allowed_plan_ids: updates.allowed_plan_ids
      });
      
      // Remove any fields that don't exist in the models table
      const cleanUpdates = { ...updates };
      delete (cleanUpdates as any).categories;
      delete (cleanUpdates as any).location;
      delete (cleanUpdates as any).cities;
      delete (cleanUpdates as any).photos;
      delete (cleanUpdates as any).created_at;
      delete (cleanUpdates as any).updated_at;
      
      console.log('🧹 HOOK: Clean updates after filtering:', cleanUpdates);
      console.log('🧹 HOOK: Visibility in clean updates:', {
        visibility_type: cleanUpdates.visibility_type,
        allowed_plan_ids: cleanUpdates.allowed_plan_ids
      });
      
      alert(`Sending to DB - Type: ${cleanUpdates.visibility_type}, Plans: ${JSON.stringify(cleanUpdates.allowed_plan_ids)}`);
      
      const { data, error } = await supabase
        .from('models')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('💥 HOOK: Database error:', error);
        alert(`Database error: ${error.message}`);
        throw error;
      }
      
      console.log('✅ HOOK: Database response:', data);
      console.log('✅ HOOK: Visibility in response:', {
        visibility_type: data?.visibility_type,
        allowed_plan_ids: data?.allowed_plan_ids
      });
      
      alert(`DB Response - Type: ${data?.visibility_type}, Plans: ${JSON.stringify(data?.allowed_plan_ids)}`);
      
      return data;
    },
    onSuccess: () => {
      console.log('🔄 HOOK: Invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};

export const useDeleteModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting model with id:', id);
      
      const { error } = await supabase
        .from('models')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting model:', error);
        throw error;
      }
      
      console.log('Model deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};

export const useDuplicateModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (originalModelId: string) => {
      console.log('Duplicating model with id:', originalModelId);
      
      // Buscar o modelo original com todas as informações
      const { data: originalModel, error: fetchError } = await supabase
        .from('models')
        .select('*, model_categories(category_id)')
        .eq('id', originalModelId)
        .single();

      if (fetchError) {
        console.error('Error fetching original model:', fetchError);
        throw fetchError;
      }

      // Preparar dados para o novo modelo
      const newModelData = { ...originalModel };
      delete newModelData.id;
      delete newModelData.created_at;
      delete newModelData.updated_at;
      delete newModelData.model_categories;
      
      // Adicionar "(Cópia)" ao nome
      newModelData.name = `${originalModel.name} (Cópia)`;
      
      // Colocar como inativo por padrão
      newModelData.is_active = false;
      
      // Criar o novo modelo
      const { data: newModel, error: createError } = await supabase
        .from('models')
        .insert(newModelData)
        .select()
        .single();

      if (createError) {
        console.error('Error creating duplicated model:', createError);
        throw createError;
      }

      // Copiar categorias se existirem
      if (originalModel.model_categories && originalModel.model_categories.length > 0) {
        const categoryInserts = originalModel.model_categories.map((mc: any) => ({
          model_id: newModel.id,
          category_id: mc.category_id
        }));

        const { error: categoriesError } = await supabase
          .from('model_categories')
          .insert(categoryInserts);

        if (categoriesError) {
          console.error('Error copying categories:', categoriesError);
          // Não falhar a operação por causa das categorias
        }
      }

      // Copiar fotos se existirem
      const { data: originalPhotos, error: photosError } = await supabase
        .from('model_photos')
        .select('*')
        .eq('model_id', originalModelId);

      if (!photosError && originalPhotos && originalPhotos.length > 0) {
        const photoInserts = originalPhotos.map(photo => ({
          model_id: newModel.id,
          photo_url: photo.photo_url,
          is_primary: false, // Não copiar como primária
          display_order: photo.display_order,
          show_in_profile: photo.show_in_profile,
          show_in_gallery: photo.show_in_gallery,
          allowed_plan_ids: photo.allowed_plan_ids,
          visibility_type: photo.visibility_type,
          stage: photo.stage,
          tags: photo.tags
        }));

        const { error: insertPhotosError } = await supabase
          .from('model_photos')
          .insert(photoInserts);

        if (insertPhotosError) {
          console.error('Error copying photos:', insertPhotosError);
          // Não falhar a operação por causa das fotos
        }
      }

      console.log('Model duplicated successfully:', newModel);
      return newModel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};

export const useBulkUpdateModels = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ modelIds, updates }: { modelIds: string[], updates: any }) => {
      console.log('Bulk updating models:', { modelIds, updates });
      
      const { error } = await supabase
        .from('models')
        .update(updates)
        .in('id', modelIds);

      if (error) {
        console.error('Error bulk updating models:', error);
        throw error;
      }
      
      console.log('Models bulk updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};

export const useBulkDeleteModels = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (modelIds: string[]) => {
      console.log('Bulk deleting models:', modelIds);
      
      const { error } = await supabase
        .from('models')
        .delete()
        .in('id', modelIds);

      if (error) {
        console.error('Error bulk deleting models:', error);
        throw error;
      }
      
      console.log('Models bulk deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};

export const useUpdateModelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (models: { id: string; display_order: number }[]) => {
      console.log('Updating model order:', models);
      
      const updates = models.map(model => 
        supabase
          .from('models')
          .update({ display_order: model.display_order })
          .eq('id', model.id)
      );

      const results = await Promise.all(updates);
      
      // Check for errors in any of the updates
      for (const result of results) {
        if (result.error) {
          console.error('Error updating model order:', result.error);
          throw result.error;
        }
      }
      
      console.log('Model order updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};
