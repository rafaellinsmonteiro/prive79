
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ModelPhoto {
  id: string;
  photo_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface Model {
  id: string;
  name: string;
  age: number;
  location: string | null;
  appearance: string | null;
  height: string | null;
  weight: string | null;
  silicone: boolean;
  shoe_size: string | null;
  bust: string | null;
  waist: string | null;
  hip: string | null;
  body_type: string | null;
  eyes: string | null;
  languages: string | null;
  description: string | null;
  whatsapp_number: string | null;
  is_active: boolean;
  photos: ModelPhoto[];
}

export const useModels = () => {
  return useQuery({
    queryKey: ['models'],
    queryFn: async (): Promise<Model[]> => {
      console.log('Fetching models from Supabase...');
      
      const { data: modelsData, error: modelsError } = await supabase
        .from('models')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (modelsError) {
        console.error('Error fetching models:', modelsError);
        throw modelsError;
      }

      console.log('Models fetched:', modelsData);

      // Fetch photos for all models
      const { data: photosData, error: photosError } = await supabase
        .from('model_photos')
        .select('*')
        .order('display_order', { ascending: true });

      if (photosError) {
        console.error('Error fetching photos:', photosError);
        throw photosError;
      }

      console.log('Photos fetched:', photosData);

      // Combine models with their photos
      const modelsWithPhotos: Model[] = modelsData.map(model => ({
        ...model,
        photos: photosData.filter(photo => photo.model_id === model.id)
      }));

      return modelsWithPhotos;
    },
  });
};

export const useModel = (modelId: string) => {
  return useQuery({
    queryKey: ['model', modelId],
    queryFn: async (): Promise<Model | null> => {
      console.log('Fetching model:', modelId);
      
      const { data: modelData, error: modelError } = await supabase
        .from('models')
        .select('*')
        .eq('id', modelId)
        .eq('is_active', true)
        .single();

      if (modelError) {
        console.error('Error fetching model:', modelError);
        throw modelError;
      }

      const { data: photosData, error: photosError } = await supabase
        .from('model_photos')
        .select('*')
        .eq('model_id', modelId)
        .order('display_order', { ascending: true });

      if (photosError) {
        console.error('Error fetching model photos:', photosError);
        throw photosError;
      }

      return {
        ...modelData,
        photos: photosData
      };
    },
    enabled: !!modelId,
  });
};
