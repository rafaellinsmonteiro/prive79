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
          model_photos!inner(photo_url),
          services!inner(
            id,
            name,
            description,
            price,
            duration,
            max_people
          )
        `)
        .eq("is_active", true)
        .eq("services.is_active", true);

      if (cityFilter) {
        query = query.eq("city", cityFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching public models:", error);
        throw error;
      }

      // Transform data to match our interface
      const models: PublicModel[] = data?.map(model => ({
        id: model.id,
        name: model.name,
        description: model.description,
        neighborhood: model.neighborhood,
        city: model.city,
        photo_url: model.model_photos?.[0]?.photo_url,
        services: model.services || []
      })) || [];

      return models;
    },
  });
};