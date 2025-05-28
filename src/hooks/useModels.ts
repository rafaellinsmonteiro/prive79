
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ModelPhoto {
  id: string;
  model_id: string;
  photo_url: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface Model {
  id: string;
  name: string;
  age: number;
  location?: string;
  appearance?: string;
  height?: string;
  weight?: string;
  silicone?: boolean;
  shoe_size?: string;
  bust?: string;
  waist?: string;
  hip?: string;
  body_type?: string;
  eyes?: string;
  languages?: string;
  description?: string;
  whatsapp_number?: string;
  is_active?: boolean;
  display_order?: number;
  created_at: string;
  updated_at: string;
  photos: ModelPhoto[];
}

export const useModels = () => {
  return useQuery({
    queryKey: ['models'],
    queryFn: async (): Promise<Model[]> => {
      const { data: modelsData, error: modelsError } = await supabase
        .from('models')
        .select('*')
        .eq('is_active', true)
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

export const useModel = (id: string) => {
  return useQuery({
    queryKey: ['model', id],
    queryFn: async (): Promise<Model | null> => {
      if (!id) return null;

      const { data: modelData, error: modelError } = await supabase
        .from('models')
        .select('*')
        .eq('id', id)
        .single();

      if (modelError) {
        console.error('Error fetching model:', modelError);
        throw modelError;
      }

      const { data: photosData, error: photosError } = await supabase
        .from('model_photos')
        .select('*')
        .eq('model_id', id)
        .order('display_order', { ascending: true });

      if (photosError) {
        console.error('Error fetching model photos:', photosError);
        throw photosError;
      }

      return {
        ...modelData,
        photos: photosData || []
      };
    },
    enabled: !!id,
  });
};
