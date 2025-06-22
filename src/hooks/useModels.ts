
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Category } from "./useCategories";

export interface ModelPhoto {
  id: string;
  model_id: string;
  photo_url: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
  visibility_type?: string;
  allowed_plan_ids?: string[];
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
  visibility_type?: string;
  allowed_plan_ids?: string[];
  created_at: string;
  updated_at: string;
  photos: ModelPhoto[];
  categories: Category[];
  location?: string;
  cities?: { name: string } | null;
}

export const useModels = (cityId?: string) => {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ['models', cityId, isAdmin],
    queryFn: async (): Promise<Model[]> => {
      console.log('useModels - Starting fetch with params:', { cityId, isAdmin });
      
      // 1. Fetch models with city filter and visibility
      let modelsQuery = supabase
        .from('models')
        .select('*, cities(name)')
        .eq('is_active', true);

      // Apply city filter if provided
      if (cityId) {
        modelsQuery = modelsQuery.eq('city_id', cityId);
      }

      const { data: modelsData, error: modelsError } = await modelsQuery
        .order('display_order', { ascending: true });

      console.log('useModels - Raw models data:', modelsData);
      console.log('useModels - Models error:', modelsError);

      if (modelsError) {
        console.error('Error fetching models:', modelsError);
        throw modelsError;
      }
      if (!modelsData) return [];

      // Debug specific model
      const maduSilva = modelsData.find(m => m.name.includes('Madu Silva') || m.name.includes('Madu'));
      if (maduSilva) {
        console.log('useModels - Found Madu Silva:', {
          id: maduSilva.id,
          name: maduSilva.name,
          is_active: maduSilva.is_active,
          visibility_type: maduSilva.visibility_type,
          allowed_plan_ids: maduSilva.allowed_plan_ids
        });
      } else {
        console.log('useModels - Madu Silva not found in raw data');
      }

      // Filter models based on visibility - admins can see all models
      const filteredModels = modelsData.filter(model => {
        console.log(`useModels - Checking visibility for model ${model.name}:`, {
          isAdmin,
          visibility_type: model.visibility_type,
          allowed_plan_ids: model.allowed_plan_ids
        });

        // If user is admin, show all models
        if (isAdmin) {
          console.log(`useModels - Admin access granted for ${model.name}`);
          return true;
        }
        
        // If visibility_type is null or 'public', show the model
        if (!model.visibility_type || model.visibility_type === 'public') {
          console.log(`useModels - Public access granted for ${model.name}`);
          return true;
        }
        
        // For now, hide models that require specific plans since we don't have user plan info
        // TODO: Implement user plan checking when authentication is added
        console.log(`useModels - Access denied for ${model.name} (requires plan)`);
        return false;
      });

      console.log('useModels - Filtered models count:', filteredModels.length);
      console.log('useModels - Filtered model names:', filteredModels.map(m => m.name));

      const modelIds = filteredModels.map(m => m.id);
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

      // 3. Join data in JavaScript and filter photos based on visibility
      const finalModels = filteredModels.map(model => {
        const modelWithCity = model as any;
        const locationParts = [];
        if (modelWithCity.cities?.name) locationParts.push(modelWithCity.cities.name);
        if (modelWithCity.neighborhood) locationParts.push(modelWithCity.neighborhood);

        const catsForModel = (mcData ?? [])
          .filter(mc => mc.model_id === model.id)
          .map(mc => categoriesMap.get(mc.category_id))
          .filter(Boolean) as Category[];

        // Filter photos based on visibility - admins can see all photos
        const allPhotos = (photosData ?? []).filter(photo => photo.model_id === model.id);
        const visiblePhotos = allPhotos.filter(photo => {
          // If user is admin, show all photos
          if (isAdmin) {
            return true;
          }
          
          // If visibility_type is null or 'public', show the photo
          if (!photo.visibility_type || photo.visibility_type === 'public') {
            return true;
          }
          
          // For now, hide photos that require specific plans
          // TODO: Implement user plan checking when authentication is added
          return false;
        });

        return {
          ...model,
          photos: visiblePhotos,
          location: locationParts.join(', '),
          categories: catsForModel,
        } as Model;
      });

      console.log('useModels - Final models count:', finalModels.length);
      console.log('useModels - Final model names:', finalModels.map(m => m.name));

      return finalModels;
    },
  });
};

export const useModel = (id: string) => {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ['model', id, isAdmin],
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

      // Check model visibility - admins can see all models
      if (modelData.visibility_type === 'plans' && !isAdmin) {
        // TODO: Implement user plan checking when authentication is added
        // For now, return null to hide plan-restricted models for non-admin users
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

      // Filter photos based on visibility - admins can see all photos
      const allPhotos = photosData || [];
      const visiblePhotos = allPhotos.filter(photo => {
        // If user is admin, show all photos
        if (isAdmin) {
          return true;
        }
        
        // If visibility_type is null or 'public', show the photo
        if (!photo.visibility_type || photo.visibility_type === 'public') {
          return true;
        }
        
        // For now, hide photos that require specific plans
        // TODO: Implement user plan checking when authentication is added
        return false;
      });

      return {
        ...modelData,
        photos: visiblePhotos,
        location: locationParts.join(', '),
        categories,
      } as Model;
    },
    enabled: !!id,
  });
};
