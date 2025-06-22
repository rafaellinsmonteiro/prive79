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
  section?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomSection {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export const useCustomFields = () => {
  return useQuery({
    queryKey: ['custom-fields'],
    queryFn: async (): Promise<CustomField[]> => {
      console.log('🔍 useCustomFields - Fetching custom fields...');
      const { data, error } = await supabase
        .from('custom_fields')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('❌ Error fetching custom fields:', error);
        throw error;
      }

      console.log('✅ useCustomFields - Fetched fields:', data?.length || 0);
      console.log('🔍 useCustomFields - Field details:', data?.map(f => ({ name: f.field_name, section: f.section, active: f.is_active })));

      return (data || []).map(field => ({
        ...field,
        field_type: field.field_type as 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'date' | 'email' | 'url'
      }));
    },
  });
};

export const useCustomSections = () => {
  return useQuery({
    queryKey: ['custom-sections'],
    queryFn: async (): Promise<CustomSection[]> => {
      console.log('🔍 useCustomSections - Fetching custom sections...');
      const { data, error } = await supabase
        .from('custom_sections')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('❌ Error fetching custom sections:', error);
        throw error;
      }

      console.log('✅ useCustomSections - Fetched sections:', data?.length || 0);
      console.log('🔍 useCustomSections - Section details:', data?.map(s => ({ name: s.name, active: s.is_active })));

      return data || [];
    },
  });
};

export const useCreateCustomField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldData: Omit<CustomField, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('➕ Creating custom field:', fieldData);
      const { data, error } = await supabase
        .from('custom_fields')
        .insert(fieldData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating custom field:', error);
        throw error;
      }

      console.log('✅ Custom field created:', data);
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
        .from('custom_fields')
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
        .from('custom_fields')
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

export const useCreateCustomSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sectionData: Omit<CustomSection, 'id' | 'created_at'>) => {
      console.log('➕ Creating custom section:', sectionData);
      const { data, error } = await supabase
        .from('custom_sections')
        .insert(sectionData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating custom section:', error);
        throw error;
      }

      console.log('✅ Custom section created:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-sections'] });
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
      queryClient.invalidateQueries({ queryKey: ['custom-sections'] });
      queryClient.invalidateQueries({ queryKey: ['custom-fields'] });
    },
  });
};

export const useUpdateCustomSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CustomSection> & { id: string }) => {
      console.log('📝 Updating custom section:', { id, updates });
      const { data, error } = await supabase
        .from('custom_sections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating custom section:', error);
        throw error;
      }

      console.log('✅ Custom section updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-sections'] });
    },
  });
};

export const useUpdateSectionOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string; display_order: number }[]) => {
      const promises = updates.map(update => 
        supabase
          .from('custom_sections')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
      );

      const results = await Promise.all(promises);
      
      for (const result of results) {
        if (result.error) {
          console.error('Error updating section order:', result.error);
          throw result.error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-sections'] });
    },
  });
};

export const useUpdateFieldOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string; display_order: number; section?: string }[]) => {
      const promises = updates.map(update => 
        supabase
          .from('custom_fields')
          .update({ 
            display_order: update.display_order,
            section: update.section 
          })
          .eq('id', update.id)
      );

      const results = await Promise.all(promises);
      
      for (const result of results) {
        if (result.error) {
          console.error('Error updating field order:', result.error);
          throw result.error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields'] });
    },
  });
};
