
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GalleryMedia {
  id: string;
  model_id: string;
  media_url: string;
  media_type: 'photo' | 'video';
  thumbnail_url?: string;
  title?: string;
  model_name: string;
  city_name?: string;
  created_at: string;
}

export const useGalleryMedia = (mediaType?: 'photo' | 'video' | 'all') => {
  return useQuery({
    queryKey: ['gallery-media', mediaType],
    queryFn: async (): Promise<GalleryMedia[]> => {
      const allMedia: GalleryMedia[] = [];
      
      // Buscar fotos se não for especificamente vídeos
      if (mediaType !== 'video') {
        const { data: photosData, error: photosError } = await supabase
          .from('model_photos')
          .select(`
            id,
            model_id,
            photo_url,
            created_at,
            models!inner (
              name,
              is_active,
              cities (name)
            )
          `)
          .eq('models.is_active', true)
          .order('created_at', { ascending: false });

        if (photosError) {
          console.error('Erro ao buscar fotos:', photosError);
          throw photosError;
        }

        const photoItems: GalleryMedia[] = (photosData || []).map(photo => ({
          id: photo.id,
          model_id: photo.model_id,
          media_url: photo.photo_url,
          media_type: 'photo' as const,
          model_name: photo.models.name,
          city_name: photo.models.cities?.name,
          created_at: photo.created_at
        }));

        allMedia.push(...photoItems);
      }

      // Buscar vídeos se não for especificamente fotos
      if (mediaType !== 'photo') {
        const { data: videosData, error: videosError } = await supabase
          .from('model_videos')
          .select(`
            id,
            model_id,
            video_url,
            thumbnail_url,
            title,
            created_at,
            models!inner (
              name,
              is_active,
              cities (name)
            )
          `)
          .eq('models.is_active', true)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (videosError) {
          console.error('Erro ao buscar vídeos:', videosError);
          throw videosError;
        }

        const videoItems: GalleryMedia[] = (videosData || []).map(video => ({
          id: video.id,
          model_id: video.model_id,
          media_url: video.video_url,
          media_type: 'video' as const,
          thumbnail_url: video.thumbnail_url || undefined,
          title: video.title || undefined,
          model_name: video.models.name,
          city_name: video.models.cities?.name,
          created_at: video.created_at
        }));

        allMedia.push(...videoItems);
      }

      // Ordenar por data de criação (mais recente primeiro)
      return allMedia.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
  });
};
