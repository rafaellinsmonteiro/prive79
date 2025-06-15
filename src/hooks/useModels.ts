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

// Helper to fetch all relevant categories for a batch of models
const getCategoriesMap = async (): Promise<Map<string, Category>> => {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) throw error;
  const map = new Map<string, Category>();
  (data ?? []).forEach((cat: any) => {
    map.set(cat.id, cat as Category);
  });
  return map;
};

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
      const modelIds = modelsData?.map(m => m.id) ?? [];
      if (modelIds.length === 0) return [];

      // Fetch join table data: model_categories (model_id, category_id)
      const { data: mcData, error: mcError } = await supabase
        .from('model_categories')
        .select('model_id, category_id')
        .in('model_id', modelIds);

      if (mcError) {
        console.error('Error fetching model_categories:', mcError);
        throw mcError;
      }

      // Fetch all referenced categories once, build map
      const categoriesMap = await getCategoriesMap();

      // Fetch all photos for these models
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
        if (modelWithCity.cities?.name) locationParts.push(modelWithCity.cities.name);
        if (modelWithCity.neighborhood) locationParts.push(modelWithCity.neighborhood);

        // Match category_ids for this model, then look up category objects
        const catsForModel = (mcData ?? [])
          .filter((mc: any) => mc.model_id === model.id)
          .map((mc: any) => categoriesMap.get(mc.category_id))
          .filter(Boolean) as Category[];

        return {
          ...model,
          photos: (photosData ?? []).filter(photo => photo.model_id === model.id),
          location: locationParts.join(', '),
          categories: catsForModel,
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

      // get model_categories for this model's id, plain select
      const { data: mcData, error: mcError } = await supabase
        .from('model_categories')
        .select('model_id, category_id')
        .eq('model_id', id);

      if (mcError) {
        console.error('Error fetching model_categories for single model:', mcError);
        throw mcError;
      }

      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*');
      if (catError) throw catError;

      // Get all relevant categories for this model
      const categories = (mcData ?? [])
        .map((mc: any) => (categoriesData ?? []).find((cat: any) => cat.id === mc.category_id))
        .filter(Boolean) as Category[];

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
