
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
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
  const { isAdmin, user } = useAuth();
  const { data: currentUser } = useCurrentUser();
  
  return useQuery({
    queryKey: ['models', cityId, isAdmin, currentUser?.plan_id],
    queryFn: async (): Promise<Model[]> => {
      console.log('useModels - Starting fetch with params:', { 
        cityId, 
        isAdmin, 
        userId: user?.id,
        userPlanId: currentUser?.plan_id 
      });
      
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

      if (modelsError) {
        console.error('Error fetching models:', modelsError);
        throw modelsError;
      }
      if (!modelsData) return [];

      // Filter models based on visibility and user plan
      const filteredModels = modelsData.filter(model => {
        console.log(`useModels - Checking visibility for model ${model.name}:`, {
          isAdmin,
          visibility_type: model.visibility_type,
          allowed_plan_ids: model.allowed_plan_ids,
          userPlanId: currentUser?.plan_id
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
        
        // If visibility_type is 'plans', check user's plan
        if (model.visibility_type === 'plans') {
          // If no plan restrictions, show to everyone
          if (!model.allowed_plan_ids || model.allowed_plan_ids.length === 0) {
            console.log(`useModels - Plan-restricted model ${model.name} has no plan restrictions - showing`);
            return true;
          }
          
          // Check if user has a valid plan
          if (!currentUser?.plan_id) {
            console.log(`useModels - User has no plan, denying access to ${model.name}`);
            return false;
          }
          
          // Check if user's plan is in the allowed plans
          const hasAccess = model.allowed_plan_ids.includes(currentUser.plan_id);
          console.log(`useModels - Plan access check for ${model.name}:`, {
            userPlan: currentUser.plan_id,
            allowedPlans: model.allowed_plan_ids,
            hasAccess
          });
          return hasAccess;
        }
        
        console.log(`useModels - Access denied for ${model.name} (unknown visibility type)`);
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

        // Filter photos based on visibility and user plan
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
          
          // If visibility_type is 'plans', check user's plan
          if (photo.visibility_type === 'plans') {
            // If no plan restrictions, show to everyone
            if (!photo.allowed_plan_ids || photo.allowed_plan_ids.length === 0) {
              return true;
            }
            
            // Check if user has a valid plan
            if (!currentUser?.plan_id) {
              return false;
            }
            
            // Check if user's plan is in the allowed plans
            return photo.allowed_plan_ids.includes(currentUser.plan_id);
          }
          
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
      return finalModels;
    },
  });
};

export const useModel = (id: string) => {
  const { isAdmin, user } = useAuth();
  const { data: currentUser } = useCurrentUser();
  
  return useQuery({
    queryKey: ['model', id, isAdmin, currentUser?.plan_id],
    queryFn: async (): Promise<Model | null> => {
      console.log('useModel - Starting fetch for ID:', id);
      console.log('useModel - Current user status:', { 
        isAdmin, 
        userId: user?.id,
        userPlanId: currentUser?.plan_id 
      });
      
      if (!id) {
        console.log('useModel - No ID provided, returning null');
        return null;
      }
      
      // 1. Fetch model
      const { data: modelData, error: modelError } = await supabase
        .from('models')
        .select('*, cities(name)')
        .eq('id', id)
        .maybeSingle();

      console.log('useModel - Raw model data:', modelData);

      if (modelError) {
        console.error('useModel - Error fetching model:', modelError);
        throw modelError;
      }

      if (!modelData) {
        console.log('useModel - No model found with ID:', id);
        return null;
      }

      // Check model visibility and user plan
      console.log('useModel - Checking model visibility:', {
        isAdmin,
        visibility_type: modelData.visibility_type,
        allowed_plan_ids: modelData.allowed_plan_ids,
        userPlanId: currentUser?.plan_id
      });

      if (!isAdmin && modelData.visibility_type === 'plans') {
        // If no plan restrictions, allow access
        if (!modelData.allowed_plan_ids || modelData.allowed_plan_ids.length === 0) {
          console.log('useModel - Plan-restricted model has no plan restrictions - allowing access');
        } else {
          // Check if user has a valid plan
          if (!currentUser?.plan_id) {
            console.log('useModel - User has no plan, denying access');
            return null;
          }
          
          // Check if user's plan is in the allowed plans
          const hasAccess = modelData.allowed_plan_ids.includes(currentUser.plan_id);
          console.log('useModel - Plan access check:', {
            userPlan: currentUser.plan_id,
            allowedPlans: modelData.allowed_plan_ids,
            hasAccess
          });
          
          if (!hasAccess) {
            console.log('useModel - Access denied - user plan not in allowed plans');
            return null;
          }
        }
      }

      console.log('useModel - Access granted, proceeding with fetch...');

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

      // Filter photos based on visibility and user plan
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
        
        // If visibility_type is 'plans', check user's plan
        if (photo.visibility_type === 'plans') {
          // If no plan restrictions, show to everyone
          if (!photo.allowed_plan_ids || photo.allowed_plan_ids.length === 0) {
            return true;
          }
          
          // Check if user has a valid plan
          if (!currentUser?.plan_id) {
            return false;
          }
          
          // Check if user's plan is in the allowed plans
          return photo.allowed_plan_ids.includes(currentUser.plan_id);
        }
        
        return false;
      });

      console.log('useModel - Visible photos count:', visiblePhotos.length);

      const finalModel = {
        ...modelData,
        photos: visiblePhotos,
        location: locationParts.join(', '),
        categories,
      } as Model;

      console.log('useModel - Final model:', {
        id: finalModel.id,
        name: finalModel.name,
        photosCount: finalModel.photos.length,
        categoriesCount: finalModel.categories.length,
        location: finalModel.location
      });

      return finalModel;
    },
    enabled: !!id,
  });
};
