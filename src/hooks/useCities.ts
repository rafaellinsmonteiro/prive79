
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface City {
  id: string;
  name: string;
  state: string | null;
  is_active: boolean;
  created_at: string;
}

export const useCities = () => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async (): Promise<City[]> => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching cities:', error);
        throw error;
      }

      // Filter out any cities with empty or invalid IDs
      const validCities = (data || []).filter(city => {
        const isValid = city.id && city.id.trim() !== '';
        if (!isValid) {
          console.warn('Filtering out city with invalid ID:', city);
        }
        return isValid;
      });

      console.log('useCities returning valid cities:', validCities);
      return validCities;
    },
  });
};
