
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
      const { data, error } = await supabase
        .from('models')
        .insert(modelData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
    },
  });
};

export const useUpdateModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Model> & { id: string }) => {
      const { data, error } = await supabase
        .from('models')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
    },
  });
};

export const useDeleteModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('models')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
    },
  });
};

export const useUpdateModelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (models: { id: string; display_order: number }[]) => {
      const updates = models.map(model => 
        supabase
          .from('models')
          .update({ display_order: model.display_order })
          .eq('id', model.id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
    },
  });
};
