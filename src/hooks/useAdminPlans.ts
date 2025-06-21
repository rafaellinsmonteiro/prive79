
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Plan = Tables<'plans'> & {
  categories?: Tables<'categories'>[];
};

export const useAdminPlans = () => {
  return useQuery({
    queryKey: ['admin-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select(`
          *,
          plan_categories!inner (
            categories (
              id,
              name
            )
          )
        `)
        .order('display_order');

      if (error) throw error;
      
      // Transform the data to include categories array
      const transformedData = data.map(plan => ({
        ...plan,
        categories: plan.plan_categories?.map(pc => pc.categories).filter(Boolean) || []
      }));

      return transformedData as Plan[];
    },
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categories, ...planData }: TablesInsert<'plans'> & { categories?: string[] }) => {
      // First create the plan
      const { data: plan, error: planError } = await supabase
        .from('plans')
        .insert(planData)
        .select()
        .single();

      if (planError) throw planError;

      // Then add categories if provided
      if (categories && categories.length > 0) {
        const planCategories = categories.map(categoryId => ({
          plan_id: plan.id,
          category_id: categoryId
        }));

        const { error: categoriesError } = await supabase
          .from('plan_categories')
          .insert(planCategories);

        if (categoriesError) throw categoriesError;
      }

      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, categories, ...planData }: TablesUpdate<'plans'> & { id: string; categories?: string[] }) => {
      // Update the plan
      const { data: plan, error: planError } = await supabase
        .from('plans')
        .update(planData)
        .eq('id', id)
        .select()
        .single();

      if (planError) throw planError;

      // Update categories if provided
      if (categories !== undefined) {
        // First delete existing categories
        await supabase
          .from('plan_categories')
          .delete()
          .eq('plan_id', id);

        // Then add new categories
        if (categories.length > 0) {
          const planCategories = categories.map(categoryId => ({
            plan_id: id,
            category_id: categoryId
          }));

          const { error: categoriesError } = await supabase
            .from('plan_categories')
            .insert(planCategories);

          if (categoriesError) throw categoriesError;
        }
      }

      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
    },
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
    },
  });
};
