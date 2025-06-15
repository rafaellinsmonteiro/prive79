
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "./useCategories";

type CategoryData = Omit<Category, 'id' | 'created_at'>;

// Hook to fetch all categories for admin
export const useAdminCategories = () => {
  return useQuery({
    queryKey: ['admin_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    }
  });
};

// Hook to create a category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: CategoryData) => {
      const { data, error } = await supabase.from('categories').insert(category).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// Hook to update a category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: Partial<CategoryData> & { id: string }) => {
      const { data, error } = await supabase.from('categories').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// Hook to delete a category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
