
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useCurrentUser";

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
  const { isAdmin, user } = useAuth();
  const { data: currentUser } = useCurrentUser();

  return useQuery({
    queryKey: ['gallery-media', mediaType, city, minAge, maxAge, isAdmin, currentUser?.plan_id],
    queryFn: async (): Promise<GalleryMedia[]> => {
      console.log('useGalleryMedia - Starting fetch with params:', { 
        mediaType, 
        city, 
        minAge, 
        maxAge, 
        isAdmin,
        userId: user?.id,
        userPlanId: currentUser?.plan_id 
      });
      
      const allMedia: GalleryMedia[] = [];

      // Helper function to check media visibility
      const hasMediaAccess = (mediaItem: any): boolean => {
        // If user is admin, show all media
        if (isAdmin) {
          return true;
        }
        
        // If visibility_type is null or 'public', show the media
        if (!mediaItem.visibility_type || mediaItem.visibility_type === 'public') {
          return true;
        }
        
        // If visibility_type is 'plans', check user's plan
        if (mediaItem.visibility_type === 'plans') {
          // If no plan restrictions, show to everyone
          if (!mediaItem.allowed_plan_ids || mediaItem.allowed_plan_ids.length === 0) {
            return true;
          }
          
          // Check if user has a valid plan
          if (!currentUser?.plan_id) {
            return false;
          }
          
          // Check if user's plan is in the allowed plans
          return mediaItem.allowed_plan_ids.includes(currentUser.plan_id);
        }
        
        return false;
      };

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
          // Filtrar fotos com base na visibilidade e planos do usuário
          const visiblePhotos = photosData.filter(photo => {
            const hasAccess = hasMediaAccess(photo);
            console.log(`useGalleryMedia - Photo access check for ${photo.models.name}:`, {
              photoId: photo.id,
              visibility_type: photo.visibility_type,
              allowed_plan_ids: photo.allowed_plan_ids,
              userPlanId: currentUser?.plan_id,
              hasAccess
            });
            return hasAccess;
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

        console.log('useGalleryMedia - Raw videos data with thumbnails:', videosData);

        if (videosError) {
          console.error('Erro ao buscar vídeos da galeria:', videosError);
          throw videosError;
        }

        if (videosData) {
          // Filtrar vídeos com base na visibilidade e planos do usuário
          const visibleVideos = videosData.filter(video => {
            const hasAccess = hasMediaAccess(video);
            console.log(`useGalleryMedia - Video access check for ${video.models.name}:`, {
              videoId: video.id,
              visibility_type: video.visibility_type,
              allowed_plan_ids: video.allowed_plan_ids,
              userPlanId: currentUser?.plan_id,
              thumbnail_url: video.thumbnail_url,
              hasAccess
            });
            return hasAccess;
          });

          console.log('useGalleryMedia - Visible videos count:', visibleVideos.length);

          const videoItems: GalleryMedia[] = visibleVideos.map(video => ({
            id: video.id,
            model_id: video.model_id,
            media_url: video.video_url,
            media_type: 'video' as MediaType,
            thumbnail_url: video.thumbnail_url,
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

      // Ordenar por data de criação (mais recentes primeiro)
      return allMedia.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
  });
};
