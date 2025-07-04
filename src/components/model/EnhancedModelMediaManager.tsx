import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Image, Video, Plus, Upload, Trash2, Star, Eye, Film, Settings } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
interface EnhancedModelMediaManagerProps {
  modelId: string;
}

const EnhancedModelMediaManager = ({ modelId }: EnhancedModelMediaManagerProps) => {
  const [activeTab, setActiveTab] = useState('photos');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Buscar fotos
  const { data: photos = [], isLoading: photosLoading, refetch: refetchPhotos } = useQuery({
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

  // Buscar vídeos
  const { data: videos = [], isLoading: videosLoading, refetch: refetchVideos } = useQuery({
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

  // Upload de arquivos
  const uploadMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: 'photo' | 'video' }) => {
      setUploading(true);
      
      const bucketName = type === 'photo' ? 'model-photos' : 'model-videos';
      const fileName = `${modelId}/${Date.now()}-${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      if (type === 'photo') {
        const { error: dbError } = await supabase
          .from('model_photos')
          .insert({
            model_id: modelId,
            photo_url: publicUrl,
            display_order: photos.length,
            is_primary: photos.length === 0
          });
        if (dbError) throw dbError;
        refetchPhotos();
      } else {
        const { error: dbError } = await supabase
          .from('model_videos')
          .insert({
            model_id: modelId,
            video_url: publicUrl,
            display_order: videos.length,
            title: file.name.split('.')[0]
          });
        if (dbError) throw dbError;
        refetchVideos();
      }
    },
    onSuccess: () => {
      toast.success('Arquivo enviado com sucesso!');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar arquivo');
    },
    onSettled: () => {
      setUploading(false);
    }
  });

  // Deletar mídia
  const deleteMutation = useMutation({
    mutationFn: async ({ id, type, url }: { id: string; type: 'photo' | 'video'; url: string }) => {
      // Extrair caminho do arquivo da URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${modelId}/${fileName}`;
      
      // Deletar do storage
      const bucketName = type === 'photo' ? 'model-photos' : 'model-videos';
      await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      // Deletar do banco
      const tableName = type === 'photo' ? 'model_photos' : 'model_videos';
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(`${variables.type === 'photo' ? 'Foto' : 'Vídeo'} deletado com sucesso!`);
      if (variables.type === 'photo') {
        refetchPhotos();
      } else {
        refetchVideos();
      }
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('Erro ao deletar arquivo');
    }
  });

  // Atualizar configurações da mídia
  const updateMediaMutation = useMutation({
    mutationFn: async ({ id, type, data }: { id: string; type: 'photo' | 'video'; data: any }) => {
      const tableName = type === 'photo' ? 'model_photos' : 'model_videos';
      const { error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success('Configurações atualizadas!');
      if (variables.type === 'photo') {
        refetchPhotos();
      } else {
        refetchVideos();
      }
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error('Erro ao atualizar configurações');
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error('Apenas imagens e vídeos são aceitos');
      return;
    }

    uploadMutation.mutate({
      file,
      type: isImage ? 'photo' : 'video'
    });
  };

  const togglePrimary = (id: string) => {
    // Primeiro remover primary de todas as fotos
    photos.forEach(photo => {
      if (photo.is_primary && photo.id !== id) {
        updateMediaMutation.mutate({
          id: photo.id,
          type: 'photo',
          data: { is_primary: false }
        });
      }
    });

    // Então definir a foto selecionada como primary
    updateMediaMutation.mutate({
      id,
      type: 'photo',
      data: { is_primary: true }
    });
  };

  const toggleReelsFeatured = (id: string, current: boolean) => {
    updateMediaMutation.mutate({
      id,
      type: 'video',
      data: { is_featured_in_reels: !current }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Image className="h-5 w-5" />
            Minhas Mídias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Enviando...' : 'Adicionar Foto ou Vídeo'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="photos">
                Fotos ({photos.length})
              </TabsTrigger>
              <TabsTrigger value="videos">
                Vídeos ({videos.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="photos" className="mt-6">
              {photosLoading ? (
                <div className="text-zinc-400">Carregando fotos...</div>
              ) : photos.length === 0 ? (
                <div className="text-center text-zinc-400 py-8">
                  <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma foto adicionada ainda</p>
                  <p className="text-sm">Clique em "Adicionar Foto ou Vídeo" para começar</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <Card key={photo.id} className="bg-zinc-800 border-zinc-700 overflow-hidden">
                      <div className="relative group">
                        <img
                          src={photo.photo_url}
                          alt="Foto"
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => togglePrimary(photo.id)}
                          >
                            <Star className={`h-4 w-4 ${photo.is_primary ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteMutation.mutate({
                              id: photo.id,
                              type: 'photo',
                              url: photo.photo_url
                            })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {photo.is_primary && (
                          <Badge className="absolute top-2 left-2 bg-yellow-600 text-white">
                            Principal
                          </Badge>
                        )}
                      </div>
                      
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-zinc-400">Perfil</Label>
                          <Switch
                            checked={photo.show_in_profile}
                            onCheckedChange={(checked) => updateMediaMutation.mutate({
                              id: photo.id,
                              type: 'photo',
                              data: { show_in_profile: checked }
                            })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-zinc-400">Galeria</Label>
                          <Switch
                            checked={photo.show_in_gallery}
                            onCheckedChange={(checked) => updateMediaMutation.mutate({
                              id: photo.id,
                              type: 'photo',
                              data: { show_in_gallery: checked }
                            })}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="videos" className="mt-6">
              {videosLoading ? (
                <div className="text-zinc-400">Carregando vídeos...</div>
              ) : videos.length === 0 ? (
                <div className="text-center text-zinc-400 py-8">
                  <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum vídeo adicionado ainda</p>
                  <p className="text-sm">Clique em "Adicionar Foto ou Vídeo" para começar</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map((video) => (
                    <Card key={video.id} className="bg-zinc-800 border-zinc-700 overflow-hidden">
                      <div className="relative group">
                        <div className="w-full h-32 bg-zinc-900 flex items-center justify-center">
                          {video.thumbnail_url ? (
                            <img
                              src={video.thumbnail_url}
                              alt="Thumbnail"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Video className="h-8 w-8 text-zinc-500" />
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => toggleReelsFeatured(video.id, video.is_featured_in_reels)}
                          >
                            <Film className={`h-4 w-4 ${video.is_featured_in_reels ? 'fill-blue-400 text-blue-400' : ''}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteMutation.mutate({
                              id: video.id,
                              type: 'video',
                              url: video.video_url
                            })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {video.is_featured_in_reels && (
                          <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                            Reels
                          </Badge>
                        )}
                      </div>
                      
                      <CardContent className="p-3 space-y-2">
                        <Input
                          value={video.title || ''}
                          onChange={(e) => updateMediaMutation.mutate({
                            id: video.id,
                            type: 'video',
                            data: { title: e.target.value }
                          })}
                          placeholder="Título do vídeo"
                          className="bg-zinc-900 border-zinc-600 text-white text-xs"
                        />
                        
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-zinc-400">Perfil</Label>
                          <Switch
                            checked={video.show_in_profile}
                            onCheckedChange={(checked) => updateMediaMutation.mutate({
                              id: video.id,
                              type: 'video',
                              data: { show_in_profile: checked }
                            })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-zinc-400">Galeria</Label>
                          <Switch
                            checked={video.show_in_gallery}
                            onCheckedChange={(checked) => updateMediaMutation.mutate({
                              id: video.id,
                              type: 'video',
                              data: { show_in_gallery: checked }
                            })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-zinc-400">Reels</Label>
                          <Switch
                            checked={video.is_featured_in_reels}
                            onCheckedChange={(checked) => toggleReelsFeatured(video.id, !checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>
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

export default EnhancedModelMediaManager;