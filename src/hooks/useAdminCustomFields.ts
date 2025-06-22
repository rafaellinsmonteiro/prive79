
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomField, CustomSection } from "./useCustomFields";

export const useAdminCustomFields = () => {
  return useQuery({
    queryKey: ['admin-custom-fields'],
    queryFn: async (): Promise<CustomField[]> => {
      console.log('🔍 useAdminCustomFields - Fetching custom fields...');
      const { data, error } = await supabase
        .from('custom_fields')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('❌ Error fetching custom fields:', error);
        throw error;
      }

      console.log('✅ useAdminCustomFields - Fetched fields:', data?.length || 0);
      return (data || []).map(field => ({
        ...field,
        field_type: field.field_type as 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'date' | 'email' | 'url'
      }));
    },
  });
};

export const useAdminCustomSections = () => {
  return useQuery({
    queryKey: ['admin-custom-sections'],
    queryFn: async (): Promise<CustomSection[]> => {
      console.log('🔍 useAdminCustomSections - Fetching custom sections...');
      const { data, error } = await supabase
        .from('custom_sections')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('❌ Error fetching custom sections:', error);
        throw error;
      }

      console.log('✅ useAdminCustomSections - Fetched sections:', data?.length || 0);
      return data || [];
    },
  });
};

export const useDeleteCustomField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ Deleting custom field:', id);
      const { error } = await supabase
        .from('custom_fields')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting custom field:', error);
        throw error;
      }

      console.log('✅ Custom field deleted');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-custom-fields'] });
      queryClient.invalidateQueries({ queryKey: ['custom-fields'] });
    },
  });
};

export const useDeleteCustomSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ Deleting custom section:', id);
      const { error } = await supabase
        .from('custom_sections')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting custom section:', error);
        throw error;
      }

      console.log('✅ Custom section deleted');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-custom-sections'] });
      queryClient.invalidateQueries({ queryKey: ['custom-sections'] });
      queryClient.invalidateQueries({ queryKey: ['custom-fields'] });
    },
  });
};
