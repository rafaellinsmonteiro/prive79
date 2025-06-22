import { useParams, Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, MapPin } from "lucide-react";
import { GalleryMedia } from "@/hooks/useGalleryMedia";
const MediaPage = () => {
  const {
    id,
    type
  } = useParams<{
    id: string;
    type: string;
  }>();
  if (!id || !type || type !== 'photo' && type !== 'video') {
    return <Navigate to="/galeria" replace />;
  }
  const {
    data: media,
    isLoading,
    error
  } = useQuery({
    queryKey: ['media', id, type],
    queryFn: async (): Promise<GalleryMedia | null> => {
      if (type === 'photo') {
        const {
          data,
          error
        } = await supabase.from('model_photos').select(`
            id,
            model_id,
            photo_url,
            created_at,
            models!inner (
              name,
              is_active,
              cities (name)
            )
          `).eq('id', id).eq('models.is_active', true).maybeSingle();
        if (error) throw error;
        if (!data) return null;
        return {
          id: data.id,
          model_id: data.model_id,
          media_url: data.photo_url,
          media_type: 'photo' as const,
          model_name: data.models.name,
          city_name: data.models.cities?.name,
          created_at: data.created_at
        };
      } else {
        const {
          data,
          error
        } = await supabase.from('model_videos').select(`
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
          `).eq('id', id).eq('models.is_active', true).eq('is_active', true).maybeSingle();
        if (error) throw error;
        if (!data) return null;
        return {
          id: data.id,
          model_id: data.model_id,
          media_url: data.video_url,
          media_type: 'video' as const,
          thumbnail_url: data.thumbnail_url || undefined,
          title: data.title || undefined,
          model_name: data.models.name,
          city_name: data.models.cities?.name,
          created_at: data.created_at
        };
      }
    }
  });
  if (isLoading) {
    return <div className="min-h-screen bg-zinc-950">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-zinc-100">Carregando mídia...</div>
          </div>
        </div>
      </div>;
  }
  if (error || !media) {
    return <div className="min-h-screen bg-zinc-950">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-400">Mídia não encontrada</div>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Botão voltar */}
        <div className="mb-6">
          <Link to="/galeria">
            <Button variant="outline" className="flex items-center gap-2 text-slate-950">
              <ArrowLeft className="h-4 w-4" />
              Voltar à Galeria
            </Button>
          </Link>
        </div>

        {/* Conteúdo da mídia */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-zinc-900 rounded-lg overflow-hidden">
            {/* Mídia */}
            <div className="flex justify-center items-center bg-black">
              {media.media_type === 'video' ? <video controls className="max-w-full max-h-[70vh] w-auto h-auto" poster={media.thumbnail_url}>
                  <source src={media.media_url} type="video/mp4" />
                  Seu navegador não suporta vídeos.
                </video> : <img src={media.media_url} alt={media.title || `Mídia de ${media.model_name}`} className="max-w-full max-h-[70vh] w-auto h-auto object-contain" />}
            </div>

            {/* Informações */}
            <div className="p-6">
              <div className="flex flex-col gap-4">
                {media.title && <h1 className="text-2xl font-bold text-white">{media.title}</h1>}
                
                <div className="flex flex-wrap items-center gap-6 text-zinc-400">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <Link to={`/modelo/${media.model_id}`} className="text-white font-medium hover:text-primary transition-colors">
                      {media.model_name}
                    </Link>
                  </div>
                  
                  {media.city_name && <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      <span>{media.city_name}</span>
                    </div>}
                  
                  <div className="text-sm">
                    {new Date(media.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default MediaPage;