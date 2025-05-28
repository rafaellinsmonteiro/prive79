
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MediaType = 'photo' | 'video';

export interface ModelMedia {
  id: string;
  model_id: string;
  media_url: string;
  media_type: MediaType;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export const useModelMedia = (modelId?: string) => {
  return useQuery({
    queryKey: ['model-media', modelId],
    queryFn: async () => {
      if (!modelId) return [];
      
      const { data, error } = await supabase
        .from('model_media')
        .select('*')
        .eq('model_id', modelId)
        .order('display_order');

      if (error) {
        console.error('Erro ao buscar mídias da modelo:', error);
        throw error;
      }

      return data as ModelMedia[];
    },
    enabled: !!modelId,
  });
};
