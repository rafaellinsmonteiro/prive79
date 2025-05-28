
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
    queryFn: async (): Promise<ModelMedia[]> => {
      if (!modelId) return [];
      
      // Por enquanto, vamos usar a tabela model_photos existente e simular vídeos
      const { data: photosData, error: photosError } = await supabase
        .from('model_photos')
        .select('*')
        .eq('model_id', modelId)
        .order('display_order');

      if (photosError) {
        console.error('Erro ao buscar mídias da modelo:', photosError);
        throw photosError;
      }

      // Converter fotos para o formato ModelMedia e adicionar alguns vídeos simulados
      const mediaItems: ModelMedia[] = photosData.map(photo => ({
        id: photo.id,
        model_id: photo.model_id,
        media_url: photo.photo_url,
        media_type: 'photo' as MediaType,
        is_primary: photo.is_primary || false,
        display_order: photo.display_order || 0,
        created_at: photo.created_at
      }));

      // Adicionar alguns vídeos simulados para demonstração
      if (mediaItems.length > 0) {
        mediaItems.push({
          id: `video-${modelId}-1`,
          model_id: modelId,
          media_url: '#',
          media_type: 'video' as MediaType,
          is_primary: false,
          display_order: mediaItems.length,
          created_at: new Date().toISOString()
        });
      }

      return mediaItems;
    },
    enabled: !!modelId,
  });
};
