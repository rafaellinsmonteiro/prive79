
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
  thumbnail_url?: string;
}

export const useModelMedia = (modelId?: string) => {
  return useQuery({
    queryKey: ['model-media', modelId],
    queryFn: async (): Promise<ModelMedia[]> => {
      if (!modelId) return [];
      
      // Buscar fotos
      const { data: photosData, error: photosError } = await supabase
        .from('model_photos')
        .select('*')
        .eq('model_id', modelId)
        .order('display_order');

      if (photosError) {
        console.error('Erro ao buscar fotos da modelo:', photosError);
        throw photosError;
      }

      // Buscar vídeos
      const { data: videosData, error: videosError } = await supabase
        .from('model_videos')
        .select('*')
        .eq('model_id', modelId)
        .eq('is_active', true)
        .order('display_order');

      if (videosError) {
        console.error('Erro ao buscar vídeos da modelo:', videosError);
        throw videosError;
      }

      // Converter fotos para o formato ModelMedia
      const photoItems: ModelMedia[] = photosData.map(photo => ({
        id: photo.id,
        model_id: photo.model_id,
        media_url: photo.photo_url,
        media_type: 'photo' as MediaType,
        is_primary: photo.is_primary || false,
        display_order: photo.display_order || 0,
        created_at: photo.created_at
      }));

      // Converter vídeos para o formato ModelMedia
      const videoItems: ModelMedia[] = videosData.map(video => ({
        id: video.id,
        model_id: video.model_id,
        media_url: video.video_url,
        media_type: 'video' as MediaType,
        is_primary: false,
        display_order: video.display_order || 0,
        created_at: video.created_at,
        thumbnail_url: video.thumbnail_url || undefined
      }));

      // Combinar e ordenar por display_order
      const allMedia = [...photoItems, ...videoItems].sort(
        (a, b) => a.display_order - b.display_order
      );

      return allMedia;
    },
    enabled: !!modelId,
  });
};
