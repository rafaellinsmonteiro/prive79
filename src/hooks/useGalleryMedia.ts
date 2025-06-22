import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type MediaType = 'photo' | 'video';

export interface GalleryMedia {
  id: string;
  model_id: string;
  media_url: string;
  media_type: MediaType;
  model_name: string;
  city_name?: string;
  created_at: string;
  thumbnail_url?: string;
  title?: string;
  visibility_type?: string;
  allowed_plan_ids?: string[];
}

interface UseGalleryMediaParams {
  mediaType?: 'all' | MediaType;
  city?: string;
  minAge?: number;
  maxAge?: number;
}

export const useGalleryMedia = (params: UseGalleryMediaParams = {}) => {
  const { mediaType = 'all', city, minAge, maxAge } = params;
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['gallery-media', mediaType, city, minAge, maxAge, isAdmin],
    queryFn: async (): Promise<GalleryMedia[]> => {
      console.log('useGalleryMedia - Starting fetch with params:', { mediaType, city, minAge, maxAge, isAdmin });
      
      const allMedia: GalleryMedia[] = [];

      // Buscar fotos se mediaType for 'all' ou 'photo'
      if (mediaType === 'all' || mediaType === 'photo') {
        let photosQuery = supabase
          .from('model_photos')
          .select(`
            id,
            model_id,
            photo_url,
            created_at,
            visibility_type,
            allowed_plan_ids,
            models!inner (
              name,
              age,
              is_active,
              cities (name)
            )
          `)
          .eq('models.is_active', true)
          .eq('show_in_gallery', true);

        // Aplicar filtros de cidade se especificado
        if (city) {
          photosQuery = photosQuery.eq('models.cities.name', city);
        }

        // Aplicar filtros de idade se especificados
        if (minAge !== undefined) {
          photosQuery = photosQuery.gte('models.age', minAge);
        }
        if (maxAge !== undefined) {
          photosQuery = photosQuery.lte('models.age', maxAge);
        }

        const { data: photosData, error: photosError } = await photosQuery
          .order('created_at', { ascending: false });

        console.log('useGalleryMedia - Raw photos data:', photosData);

        if (photosError) {
          console.error('Erro ao buscar fotos da galeria:', photosError);
          throw photosError;
        }

        if (photosData) {
          // Debug specific model photos
          const maduPhotos = photosData.filter(photo => photo.models.name.includes('Madu Silva') || photo.models.name.includes('Madu'));
          if (maduPhotos.length > 0) {
            console.log('useGalleryMedia - Found Madu Silva photos:', maduPhotos.map(p => ({
              id: p.id,
              model_name: p.models.name,
              visibility_type: p.visibility_type,
              allowed_plan_ids: p.allowed_plan_ids
            })));
          } else {
            console.log('useGalleryMedia - No Madu Silva photos found in raw data');
          }

          // Filtrar fotos com base na visibilidade - admins podem ver todas
          const visiblePhotos = photosData.filter(photo => {
            console.log(`useGalleryMedia - Checking photo visibility for ${photo.models.name}:`, {
              isAdmin,
              visibility_type: photo.visibility_type,
              allowed_plan_ids: photo.allowed_plan_ids
            });

            // Se o usuário é admin, mostrar todas as fotos
            if (isAdmin) {
              console.log(`useGalleryMedia - Admin access granted for ${photo.models.name} photo`);
              return true;
            }
            
            // Se visibility_type é null ou 'public', mostrar a foto
            if (!photo.visibility_type || photo.visibility_type === 'public') {
              console.log(`useGalleryMedia - Public access granted for ${photo.models.name} photo`);
              return true;
            }
            
            // Por enquanto, esconder fotos que requerem planos específicos
            console.log(`useGalleryMedia - Access denied for ${photo.models.name} photo (requires plan)`);
            return false;
          });

          console.log('useGalleryMedia - Visible photos count:', visiblePhotos.length);

          const photoItems: GalleryMedia[] = visiblePhotos.map(photo => ({
            id: photo.id,
            model_id: photo.model_id,
            media_url: photo.photo_url,
            media_type: 'photo' as MediaType,
            model_name: photo.models.name,
            city_name: photo.models.cities?.name,
            created_at: photo.created_at,
            visibility_type: photo.visibility_type || 'public',
            allowed_plan_ids: photo.allowed_plan_ids || []
          }));

          allMedia.push(...photoItems);
        }
      }

      // Buscar vídeos se mediaType for 'all' ou 'video'
      if (mediaType === 'all' || mediaType === 'video') {
        let videosQuery = supabase
          .from('model_videos')
          .select(`
            id,
            model_id,
            video_url,
            thumbnail_url,
            title,
            created_at,
            visibility_type,
            allowed_plan_ids,
            models!inner (
              name,
              age,
              is_active,
              cities (name)
            )
          `)
          .eq('models.is_active', true)
          .eq('is_active', true)
          .eq('show_in_gallery', true);

        // Aplicar filtros de cidade se especificado
        if (city) {
          videosQuery = videosQuery.eq('models.cities.name', city);
        }

        // Aplicar filtros de idade se especificados
        if (minAge !== undefined) {
          videosQuery = videosQuery.gte('models.age', minAge);
        }
        if (maxAge !== undefined) {
          videosQuery = videosQuery.lte('models.age', maxAge);
        }

        const { data: videosData, error: videosError } = await videosQuery
          .order('created_at', { ascending: false });

        console.log('useGalleryMedia - Raw videos data:', videosData);

        if (videosError) {
          console.error('Erro ao buscar vídeos da galeria:', videosError);
          throw videosError;
        }

        if (videosData) {
          // Filtrar vídeos com base na visibilidade - admins podem ver todos
          const visibleVideos = videosData.filter(video => {
            console.log(`useGalleryMedia - Checking video visibility for ${video.models.name}:`, {
              isAdmin,
              visibility_type: video.visibility_type,
              allowed_plan_ids: video.allowed_plan_ids
            });

            // Se o usuário é admin, mostrar todos os vídeos
            if (isAdmin) {
              console.log(`useGalleryMedia - Admin access granted for ${video.models.name} video`);
              return true;
            }
            
            // Se visibility_type é null ou 'public', mostrar o vídeo
            if (!video.visibility_type || video.visibility_type === 'public') {
              console.log(`useGalleryMedia - Public access granted for ${video.models.name} video`);
              return true;
            }
            
            // Por enquanto, esconder vídeos que requerem planos específicos
            console.log(`useGalleryMedia - Access denied for ${video.models.name} video (requires plan)`);
            return false;
          });

          console.log('useGalleryMedia - Visible videos count:', visibleVideos.length);

          const videoItems: GalleryMedia[] = visibleVideos.map(video => ({
            id: video.id,
            model_id: video.model_id,
            media_url: video.video_url,
            media_type: 'video' as MediaType,
            thumbnail_url: video.thumbnail_url || undefined,
            title: video.title || undefined,
            model_name: video.models.name,
            city_name: video.models.cities?.name,
            created_at: video.created_at,
            visibility_type: video.visibility_type || 'public',
            allowed_plan_ids: video.allowed_plan_ids || []
          }));

          allMedia.push(...videoItems);
        }
      }

      console.log('useGalleryMedia - Final media count:', allMedia.length);
      console.log('useGalleryMedia - Final media model names:', [...new Set(allMedia.map(m => m.model_name))]);

      // Ordenar por data de criação (mais recentes primeiro)
      return allMedia.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
  });
};
