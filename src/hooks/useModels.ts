import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Category } from "./useCategories";

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
  city_id?: string | null;
  neighborhood?: string | null;
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
  categories: Category[];
  location?: string;
  cities?: { name: string } | null;
}

export const useModels = () => {
  return useQuery({
    queryKey: ['models'],
    queryFn: async (): Promise<Model[]> => {
      const { data: modelsData, error: modelsError } = await supabase
        .from('models')
        .select('*, cities(name)')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (modelsError) {
        console.error('Error fetching models:', modelsError);
        throw modelsError;
      }
      
      const modelIds = modelsData.map(m => m.id);
      
      if (modelIds.length === 0) {
        return [];
      }

      const { data: modelCategoriesData, error: mcError } = await supabase
        .from('model_categories')
        .select('model_id, categories(*)')
        .in('model_id', modelIds);
      
      if (mcError) {
          console.error('Error fetching model categories:', mcError);
          throw mcError;
      }

      const { data: photosData, error: photosError } = await supabase
        .from('model_photos')
        .select('*')
        .in('model_id', modelIds)
        .order('display_order', { ascending: true });

      if (photosError) {
        console.error('Error fetching photos:', photosError);
        throw photosError;
      }

      return modelsData.map(model => {
        const modelWithCity = model as any;
        const locationParts = [];
        if (modelWithCity.cities?.name) {
          locationParts.push(modelWithCity.cities.name);
        }
        if (modelWithCity.neighborhood) {
          locationParts.push(modelWithCity.neighborhood);
        }
        
        const categories = modelCategoriesData
            .filter(mc => mc.model_id === model.id)
            .map((mc: any) => mc.categories)
            .filter(Boolean);
        
        return {
          ...model,
          photos: photosData.filter(photo => photo.model_id === model.id),
          location: locationParts.join(', '),
          categories,
        } as Model;
      });
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
        .select('*, cities(name)')
        .eq('id', id)
        .maybeSingle();

      if (modelError) {
        console.error('Error fetching model:', modelError);
        throw modelError;
      }

      if (!modelData) {
        return null;
      }
      
      const { data: modelCategoriesData, error: mcError } = await supabase
        .from('model_categories')
        .select('model_id, categories(*)')
        .eq('model_id', id);

      if (mcError) {
          console.error('Error fetching model categories for single model:', mcError);
          throw mcError;
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

      const modelWithCity = modelData as any;
      const locationParts = [];
      if (modelWithCity.cities?.name) {
        locationParts.push(modelWithCity.cities.name);
      }
      if (modelWithCity.neighborhood) {
        locationParts.push(modelWithCity.neighborhood);
      }
      
      const categories = modelCategoriesData?.map((mc: any) => mc.categories).filter(Boolean) || [];

      return {
        ...modelData,
        photos: photosData || [],
        location: locationParts.join(', '),
        categories,
      } as Model;
    },
    enabled: !!id,
  });
};
