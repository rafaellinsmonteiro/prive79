
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useModelMedia } from '@/hooks/useModelMedia';
import { Plus, Trash2, Star, Image, Video, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useCreatePhoto,
  useCreateVideo,
  useDeletePhoto,
  useDeleteVideo,
  useSetPrimaryPhoto,
  useUploadFile
} from '@/hooks/useMediaMutations';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface MediaManagerProps {
  modelId: string;
}

const MediaManager = ({ modelId }: MediaManagerProps) => {
  const { data: mediaItems = [], isLoading } = useModelMedia(modelId);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoThumbnail, setNewVideoThumbnail] = useState('');
  const { toast } = useToast();

  const createPhotoMutation = useCreatePhoto();
  const createVideoMutation = useCreateVideo();
  const deletePhotoMutation = useDeletePhoto();
  const deleteVideoMutation = useDeleteVideo();
  const setPrimaryPhotoMutation = useSetPrimaryPhoto();
  const uploadFileMutation = useUploadFile();

  const photos = mediaItems.filter(item => item.media_type === 'photo');
  const videos = mediaItems.filter(item => item.media_type === 'video');

  const handleAddPhoto = async () => {
    if (!newPhotoUrl.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma URL válida para a foto",
        variant: "destructive",
      });
      return;
    }

    try {
      await createPhotoMutation.mutateAsync({
        modelId,
        photoUrl: newPhotoUrl,
        isPrimary: photos.length === 0 // Primeira foto será primária
      });
      
      setNewPhotoUrl('');
      toast({
        title: "Sucesso",
        description: "Foto adicionada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar foto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleAddVideo = async () => {
    if (!newVideoUrl.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma URL válida para o vídeo",
        variant: "destructive",
      });
      return;
    }

    try {
      await createVideoMutation.mutateAsync({
        modelId,
        videoUrl: newVideoUrl,
        title: newVideoTitle || undefined,
        thumbnailUrl: newVideoThumbnail || undefined
      });
      
      setNewVideoUrl('');
      setNewVideoTitle('');
      setNewVideoThumbnail('');
      toast({
        title: "Sucesso",
        description: "Vídeo adicionado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar vídeo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMedia = async (mediaId: string, type: 'photo' | 'video') => {
    try {
      if (type === 'photo') {
        await deletePhotoMutation.mutateAsync({ photoId: mediaId, modelId });
      } else {
        await deleteVideoMutation.mutateAsync({ videoId: mediaId, modelId });
      }
      
      toast({
        title: "Sucesso",
        description: `${type === 'photo' ? 'Foto' : 'Vídeo'} deletada com sucesso!`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao deletar ${type === 'photo' ? 'foto' : 'vídeo'}. Tente novamente.`,
        variant: "destructive",
      });
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    try {
      await setPrimaryPhotoMutation.mutateAsync({ photoId, modelId });
      
      toast({
        title: "Sucesso",
        description: "Foto principal definida com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao definir foto principal. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (file: File, type: 'photo' | 'video') => {
    try {
      const publicUrl = await uploadFileMutation.mutateAsync({ file, modelId, type });
      
      if (type === 'photo') {
        await createPhotoMutation.mutateAsync({
          modelId,
          photoUrl: publicUrl,
          isPrimary: photos.length === 0
        });
      } else {
        await createVideoMutation.mutateAsync({
          modelId,
          videoUrl: publicUrl,
          title: file.name.split('.')[0]
        });
      }
      
      toast({
        title: "Sucesso",
        description: `${type === 'photo' ? 'Foto' : 'Vídeo'} enviado e adicionado com sucesso!`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao enviar ${type === 'photo' ? 'foto' : 'vídeo'}. Tente novamente.`,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando mídias...</div>;
  }

  const isProcessing = createPhotoMutation.isPending || 
                     createVideoMutation.isPending || 
                     deletePhotoMutation.isPending || 
                     deleteVideoMutation.isPending || 
                     setPrimaryPhotoMutation.isPending ||
                     uploadFileMutation.isPending;

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Gerenciar Mídias</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="photos" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="photos">Fotos ({photos.length})</TabsTrigger>
            <TabsTrigger value="videos">Vídeos ({videos.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="photos" className="space-y-4">
            {/* Upload de arquivo */}
            <div className="space-y-4 p-4 border border-zinc-700 rounded-lg">
              <h4 className="text-white font-medium">Upload de Foto</h4>
              <div className="space-y-2">
                <Label htmlFor="photo-file" className="text-white">Selecionar Arquivo</Label>
                <Input
                  id="photo-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, 'photo');
                    }
                  }}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="text-center text-zinc-400">ou</div>
            </div>

            {/* Adicionar nova foto por URL */}
            <div className="space-y-4 p-4 border border-zinc-700 rounded-lg">
              <h4 className="text-white font-medium">Adicionar por URL</h4>
              <div className="space-y-2">
                <Label htmlFor="photo-url" className="text-white">URL da Foto</Label>
                <Input
                  id="photo-url"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="https://exemplo.com/foto.jpg"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <Button 
                onClick={handleAddPhoto} 
                className="w-full"
                disabled={isProcessing}
              >
                <Plus className="h-4 w-4 mr-2" />
                {createPhotoMutation.isPending ? 'Adicionando...' : 'Adicionar Foto'}
              </Button>
            </div>

            {/* Lista de fotos */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.media_url}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  {photo.is_primary && (
                    <Badge className="absolute top-2 left-2 bg-yellow-600">
                      <Star className="h-3 w-3 mr-1" />
                      Principal
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    {!photo.is_primary && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSetPrimary(photo.id)}
                        disabled={isProcessing}
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive" disabled={isProcessing}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir esta foto? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteMedia(photo.id, 'photo')}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>

            {photos.length === 0 && (
              <div className="text-center py-8 text-zinc-400">
                <Image className="h-12 w-12 mx-auto mb-2" />
                <p>Nenhuma foto cadastrada ainda.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            {/* Upload de arquivo */}
            <div className="space-y-4 p-4 border border-zinc-700 rounded-lg">
              <h4 className="text-white font-medium">Upload de Vídeo</h4>
              <div className="space-y-2">
                <Label htmlFor="video-file" className="text-white">Selecionar Arquivo</Label>
                <Input
                  id="video-file"
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, 'video');
                    }
                  }}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="text-center text-zinc-400">ou</div>
            </div>

            {/* Adicionar novo vídeo por URL */}
            <div className="space-y-4 p-4 border border-zinc-700 rounded-lg">
              <h4 className="text-white font-medium">Adicionar por URL</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="video-url" className="text-white">URL do Vídeo</Label>
                  <Input
                    id="video-url"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="https://exemplo.com/video.mp4"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video-title" className="text-white">Título (Opcional)</Label>
                  <Input
                    id="video-title"
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                    placeholder="Título do vídeo"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-thumbnail" className="text-white">URL da Thumbnail (Opcional)</Label>
                <Input
                  id="video-thumbnail"
                  value={newVideoThumbnail}
                  onChange={(e) => setNewVideoThumbnail(e.target.value)}
                  placeholder="https://exemplo.com/thumbnail.jpg"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <Button 
                onClick={handleAddVideo} 
                className="w-full"
                disabled={isProcessing}
              >
                <Plus className="h-4 w-4 mr-2" />
                {createVideoMutation.isPending ? 'Adicionando...' : 'Adicionar Vídeo'}
              </Button>
            </div>

            {/* Lista de vídeos */}
            <div className="space-y-4">
              {videos.map((video, index) => (
                <div key={video.id} className="flex items-center gap-4 p-4 border border-zinc-700 rounded-lg">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-20 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-16 bg-zinc-800 rounded flex items-center justify-center">
                      <Video className="h-6 w-6 text-zinc-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {video.title || `Vídeo ${index + 1}`}
                    </p>
                    <p className="text-zinc-400 text-sm truncate">{video.media_url}</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" disabled={isProcessing}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este vídeo? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteMedia(video.id, 'video')}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>

            {videos.length === 0 && (
              <div className="text-center py-8 text-zinc-400">
                <Video className="h-12 w-12 mx-auto mb-2" />
                <p>Nenhum vídeo cadastrado ainda.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MediaManager;
