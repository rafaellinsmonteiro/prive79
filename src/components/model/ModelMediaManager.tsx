
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Video, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ModelMediaManagerProps {
  modelId: string;
}

const ModelMediaManager = ({ modelId }: ModelMediaManagerProps) => {
  const [activeTab, setActiveTab] = useState('photos');

  const { data: photos = [], isLoading: photosLoading } = useQuery({
    queryKey: ['model-photos', modelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('model_photos')
        .select('*')
        .eq('model_id', modelId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: videos = [], isLoading: videosLoading } = useQuery({
    queryKey: ['model-videos', modelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('model_videos')
        .select('*')
        .eq('model_id', modelId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Image className="h-5 w-5" />
            Gerenciar Mídias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="photos">Fotos</TabsTrigger>
              <TabsTrigger value="videos">Vídeos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="photos" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">
                  Minhas Fotos ({photos.length})
                </h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Foto
                </Button>
              </div>
              
              {photosLoading ? (
                <div className="text-zinc-400">Carregando fotos...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.photo_url}
                        alt="Foto do modelo"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button size="sm" variant="secondary">
                          Editar
                        </Button>
                      </div>
                      {photo.is_primary && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Principal
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="videos" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">
                  Meus Vídeos ({videos.length})
                </h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Vídeo
                </Button>
              </div>
              
              {videosLoading ? (
                <div className="text-zinc-400">Carregando vídeos...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {videos.map((video) => (
                    <div key={video.id} className="relative group">
                      <div className="w-full h-32 bg-zinc-800 rounded-lg flex items-center justify-center">
                        {video.thumbnail_url ? (
                          <img
                            src={video.thumbnail_url}
                            alt="Thumbnail do vídeo"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Video className="h-8 w-8 text-zinc-500" />
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button size="sm" variant="secondary">
                          Editar
                        </Button>
                      </div>
                      {video.title && (
                        <div className="mt-2 text-sm text-zinc-300 truncate">
                          {video.title}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelMediaManager;
