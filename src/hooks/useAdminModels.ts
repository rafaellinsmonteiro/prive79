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
