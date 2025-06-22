
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
  model_age?: number;
  created_at: string;
}

interface GalleryFilters {
  mediaType?: 'photo' | 'video' | 'all';
  city?: string;
  minAge?: number;
  maxAge?: number;
}

export const useGalleryMedia = (filters: GalleryFilters = {}) => {
  const { mediaType = 'all', city, minAge, maxAge } = filters;
  
  return useQuery({
    queryKey: ['gallery-media', mediaType, city, minAge, maxAge],
    queryFn: async (): Promise<GalleryMedia[]> => {
      const allMedia: GalleryMedia[] = [];
      
      // Buscar fotos se não for especificamente vídeos
      if (mediaType !== 'video') {
        let photosQuery = supabase
          .from('model_photos')
          .select(`
            id,
            model_id,
            photo_url,
            created_at,
            models!inner (
              name,
              age,
              is_active,
              city_id,
              cities (name)
            )
          `)
          .eq('models.is_active', true);

        // Aplicar filtro de cidade
        if (city) {
          photosQuery = photosQuery.eq('models.city_id', city);
        }

        // Aplicar filtro de idade
        if (minAge !== undefined) {
          photosQuery = photosQuery.gte('models.age', minAge);
        }
        if (maxAge !== undefined) {
          photosQuery = photosQuery.lte('models.age', maxAge);
        }

        const { data: photosData, error: photosError } = await photosQuery
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
          model_age: photo.models.age,
          city_name: photo.models.cities?.name,
          created_at: photo.created_at
        }));

        allMedia.push(...photoItems);
      }

      // Buscar vídeos se não for especificamente fotos
      if (mediaType !== 'photo') {
        let videosQuery = supabase
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
              age,
              is_active,
              city_id,
              cities (name)
            )
          `)
          .eq('models.is_active', true)
          .eq('is_active', true);

        // Aplicar filtro de cidade
        if (city) {
          videosQuery = videosQuery.eq('models.city_id', city);
        }

        // Aplicar filtro de idade
        if (minAge !== undefined) {
          videosQuery = videosQuery.gte('models.age', minAge);
        }
        if (maxAge !== undefined) {
          videosQuery = videosQuery.lte('models.age', maxAge);
        }

        const { data: videosData, error: videosError } = await videosQuery
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
          model_age: video.models.age,
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
