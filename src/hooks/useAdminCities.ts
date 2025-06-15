
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { City } from "./useCities";

type CityData = Omit<City, 'id' | 'created_at'>;

// Hook to fetch all cities for admin
export const useAdminCities = () => {
  return useQuery({
    queryKey: ['admin_cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    }
  });
};

// Hook to create a city
export const useCreateCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (city: CityData) => {
      const { data, error } = await supabase.from('cities').insert(city).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_cities'] });
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
  });
};

// Hook to update a city
export const useUpdateCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: Partial<CityData> & { id: string }) => {
      const { data, error } = await supabase.from('cities').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_cities'] });
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
  });
};

// Hook to delete a city
export const useDeleteCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cities').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_cities'] });
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
  });
};
