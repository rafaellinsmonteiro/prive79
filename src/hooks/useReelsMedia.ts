
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ReelsVideo {
  id: string;
  model_id: string;
  video_url: string;
  thumbnail_url: string | null;
  title: string | null;
  duration: number | null;
  is_featured_in_reels: boolean;
  display_order: number | null;
  created_at: string;
  model?: {
    name: string;
    city_id: string;
  };
}

export const useReelsVideos = (cityId?: string) => {
  return useQuery({
    queryKey: ['reels-videos', cityId],
    queryFn: async (): Promise<ReelsVideo[]> => {
      console.log('Fetching reels videos for cityId:', cityId);
      
      let query = supabase
        .from('model_videos')
        .select(`
          *,
          models!inner(name, city_id)
        `)
        .eq('is_active', true);

      if (cityId) {
        query = query.eq('models.city_id', cityId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar vídeos para reels:', error);
        throw error;
      }

      console.log('Reels videos fetched:', data?.length || 0);

      return (data || []).map(video => ({
        ...video,
        model: video.models
      }));
    },
  });
};

export const useToggleVideoInReels = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      console.log('Toggling video in reels:', { id, is_featured });
      
      const { data, error } = await supabase
        .from('model_videos')
        .update({ is_featured_in_reels: is_featured })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar vídeo nos reels:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reels-videos'] });
      toast({
        title: "Sucesso",
        description: `Vídeo ${variables.is_featured ? 'adicionado aos' : 'removido dos'} reels!`,
      });
    },
    onError: (error: any) => {
      console.error('Error in useToggleVideoInReels:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar vídeo: " + error.message,
        variant: "destructive",
      });
    },
  });
};
