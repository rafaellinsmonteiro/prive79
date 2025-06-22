
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CustomField {
  id: string;
  field_name: string;
  label: string;
  field_type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'date' | 'email' | 'url';
  is_required: boolean;
  is_active: boolean;
  display_order: number;
  placeholder?: string;
  help_text?: string;
  options?: string[];
  created_at: string;
  updated_at: string;
}

export const useCustomFields = () => {
  return useQuery({
    queryKey: ['custom-fields'],
    queryFn: async (): Promise<CustomField[]> => {
      const { data, error } = await supabase
        .from('custom_fields' as any)
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching custom fields:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useCreateCustomField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldData: Omit<CustomField, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('custom_fields' as any)
        .insert(fieldData)
        .select()
        .single();

      if (error) {
        console.error('Error creating custom field:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields'] });
    },
  });
};

export const useUpdateCustomField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CustomField> & { id: string }) => {
      const { data, error } = await supabase
        .from('custom_fields' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating custom field:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields'] });
    },
  });
};

export const useDeleteCustomField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_fields' as any)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting custom field:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields'] });
    },
  });
};
