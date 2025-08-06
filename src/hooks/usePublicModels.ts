import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicModel {
  id: string;
  name: string;
  description?: string;
  neighborhood?: string;
  city?: string;
  photo_url?: string;
  services: PublicService[];
}

export interface PublicService {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  max_people: number;
  location_types?: string[];
  service_address?: string;
}

export const usePublicModels = (cityFilter?: string) => {
  return useQuery({
    queryKey: ["public-models", cityFilter],
    queryFn: async () => {
      let query = supabase
        .from("models")
        .select(`
          id,
          name,
          description,
          neighborhood,
          city,
          model_photos(photo_url),
          services(
            id,
            name,
            description,
            price,
            duration,
            max_people,
            location_types,
            service_address,
            is_active
          )
        `)
        .eq("is_active", true);

      if (cityFilter) {
        query = query.eq("city", cityFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching public models:", error);
        throw error;
      }

      // Transform data to match our interface and filter models with active services
      const models: PublicModel[] = data?.map(model => {
        // Filter only active services
        const activeServices = model.services?.filter(service => service.is_active) || [];
        
        return {
          id: model.id,
          name: model.name,
          description: model.description,
          neighborhood: model.neighborhood,
          city: model.city,
          photo_url: model.model_photos?.[0]?.photo_url,
          services: activeServices
        };
      }).filter(model => model.services.length > 0) || []; // Only return models that have active services

      return models;
    },
  });
};