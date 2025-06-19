
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

      // More comprehensive filtering for invalid cities
      const validCities = (data || []).filter(city => {
        const hasValidId = city.id && typeof city.id === 'string' && city.id.trim() !== '';
        const hasValidName = city.name && typeof city.name === 'string' && city.name.trim() !== '';
        
        if (!hasValidId || !hasValidName) {
          console.warn('Filtering out invalid city:', city);
          return false;
        }
        return true;
      });

      console.log('useCities returning valid cities:', validCities.length, 'out of', (data || []).length);
      return validCities;
    },
  });
};
