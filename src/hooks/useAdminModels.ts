
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Model } from "./useModels";

export const useAdminModels = () => {
  return useQuery({
    queryKey: ['admin-models'],
    queryFn: async (): Promise<Model[]> => {
      const { data: modelsData, error: modelsError } = await supabase
        .from('models')
        .select('*')
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

      return modelsData.map(model => ({
        ...model,
        photos: photosData.filter(photo => photo.model_id === model.id)
      }));
    },
  });
};

export const useCreateModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (modelData: Omit<Model, 'id' | 'created_at' | 'updated_at' | 'photos'>) => {
      console.log('Creating model with data:', modelData);
      
      const { data, error } = await supabase
        .from('models')
        .insert(modelData)
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
      console.log('Updating model with id:', id, 'and data:', updates);
      
      const { data, error } = await supabase
        .from('models')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating model:', error);
        throw error;
      }
      
      console.log('Model updated successfully:', data);
      return data;
    },
    onSuccess: () => {
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
