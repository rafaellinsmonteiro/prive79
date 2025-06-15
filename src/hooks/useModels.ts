
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
      // 1. Fetch models
      const { data: modelsData, error: modelsError } = await supabase
        .from('models')
        .select('*, cities(name)')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (modelsError) {
        console.error('Error fetching models:', modelsError);
        throw modelsError;
      }
      if (!modelsData) return [];

      const modelIds = modelsData.map(m => m.id);
      if (modelIds.length === 0) return [];

      // 2. Fetch all related data in parallel
      const [
        { data: mcData, error: mcError },
        { data: categoriesData, error: catError },
        { data: photosData, error: photosError }
      ] = await Promise.all([
        supabase
          .from('model_categories')
          .select('model_id, category_id')
          .in('model_id', modelIds),
        supabase
          .from('categories')
          .select('*'),
        supabase
          .from('model_photos')
          .select('*')
          .in('model_id', modelIds)
          .order('display_order', { ascending: true })
      ]);

      if (mcError) {
        console.error('Error fetching model_categories:', mcError);
        throw mcError;
      }
      if (catError) {
        console.error('Error fetching categories:', catError);
        throw catError;
      }
      if (photosError) {
        console.error('Error fetching photos:', photosError);
        throw photosError;
      }

      // Create a map for quick category lookup
      const categoriesMap = new Map<string, Category>();
      (categoriesData ?? []).forEach(cat => categoriesMap.set(cat.id, cat as Category));

      // 3. Join data in JavaScript
      return modelsData.map(model => {
        const modelWithCity = model as any;
        const locationParts = [];
        if (modelWithCity.cities?.name) locationParts.push(modelWithCity.cities.name);
        if (modelWithCity.neighborhood) locationParts.push(modelWithCity.neighborhood);

        const catsForModel = (mcData ?? [])
          .filter(mc => mc.model_id === model.id)
          .map(mc => categoriesMap.get(mc.category_id))
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
      
      // 1. Fetch model
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

      // 2. Fetch related data in parallel
      const [
        { data: mcData, error: mcError },
        { data: photosData, error: photosError }
      ] = await Promise.all([
        supabase
          .from('model_categories')
          .select('category_id')
          .eq('model_id', id),
        supabase
          .from('model_photos')
          .select('*')
          .eq('model_id', id)
          .order('display_order', { ascending: true })
      ]);

      if (mcError) {
        console.error('Error fetching model_categories for single model:', mcError);
        throw mcError;
      }
      if (photosError) {
        console.error('Error fetching model photos:', photosError);
        throw photosError;
      }

      const categoryIds = (mcData ?? []).map(mc => mc.category_id);
      let categories: Category[] = [];
      if (categoryIds.length > 0) {
        const { data: categoriesData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .in('id', categoryIds);
        
        if (catError) {
          console.error('Error fetching categories for single model:', catError);
          throw catError;
        }
        categories = categoriesData ?? [];
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
