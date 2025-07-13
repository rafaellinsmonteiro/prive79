import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Image, Video, Plus, Upload, Trash2, Star, Eye, Film, Settings, 
  Folder, FolderPlus, Tag, Filter, Move
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCurrentModel } from '@/hooks/useCurrentModel';

interface OrganizedMediaManagerProps {
  modelId?: string;
}

const MEDIA_STAGES = [
  'Organizar',
  'Editar', 
  'Revisar',
  'Disponíveis',
  'Publicadas'
];

const OrganizedMediaManager = ({ modelId: propModelId }: OrganizedMediaManagerProps) => {
  // Todos os hooks devem vir primeiro, antes de qualquer return early
  const { data: currentModel, isLoading: modelLoading, error: modelError } = useCurrentModel();
  const [activeTab, setActiveTab] = useState('photos');
  const [uploading, setUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Usar o modelId da prop ou do hook
  const modelId = propModelId || currentModel?.model_id;

  // Buscar pastas - SEMPRE executar o hook
  const { data: folders = [] } = useQuery({
    queryKey: ['model-folders', modelId],
    queryFn: async () => {
      if (!modelId) return [];
      
      const { data, error } = await supabase
        .from('model_media_folders')
        .select('*')
        .eq('model_id', modelId)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!modelId, // Só executa se tiver modelId
  });

  // Buscar fotos - SEMPRE executar o hook
  const { data: photos = [], isLoading: photosLoading, refetch: refetchPhotos } = useQuery({
    queryKey: ['model-photos', modelId, selectedFolder, selectedStage, selectedTags],
    queryFn: async () => {
      if (!modelId) return [];
      
      let query = supabase
        .from('model_photos')
        .select('*')
        .eq('model_id', modelId);

      if (selectedFolder !== 'all') {
        if (selectedFolder === 'no-folder') {
          query = query.is('folder_id', null);
        } else {
          query = query.eq('folder_id', selectedFolder);
        }
      }

      if (selectedStage !== 'all') {
        query = query.eq('stage', selectedStage);
      }

      if (selectedTags.length > 0) {
        query = query.overlaps('tags', selectedTags);
      }

      const { data, error } = await query.order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!modelId, // Só executa se tiver modelId
  });

  // Buscar vídeos - SEMPRE executar o hook
  const { data: videos = [], isLoading: videosLoading, refetch: refetchVideos } = useQuery({
    queryKey: ['model-videos', modelId, selectedFolder, selectedStage, selectedTags],
    queryFn: async () => {
      if (!modelId) return [];
      
      let query = supabase
        .from('model_videos')
        .select('*')
        .eq('model_id', modelId);

      if (selectedFolder !== 'all') {
        if (selectedFolder === 'no-folder') {
          query = query.is('folder_id', null);
        } else {
          query = query.eq('folder_id', selectedFolder);
        }
      }

      if (selectedStage !== 'all') {
        query = query.eq('stage', selectedStage);
      }

      if (selectedTags.length > 0) {
        query = query.overlaps('tags', selectedTags);
      }

      const { data, error } = await query.order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!modelId, // Só executa se tiver modelId
  });

  // Criar pasta
  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data: user } = await supabase.auth.getUser();
      console.log('📁 Criando pasta:', { name, modelId, userId: user.user?.id });
      
      const insertData = {
        model_id: modelId,
        name,
        created_by_user_id: user.user?.id
      };
      
      console.log('📁 Dados para inserir:', insertData);
      
      const { error } = await supabase
        .from('model_media_folders')
        .insert(insertData);
      
      if (error) {
        console.error('❌ Erro ao criar pasta:', error);
        throw error;
      }
      
      console.log('✅ Pasta criada com sucesso');
    },
    onSuccess: () => {
      toast.success('Pasta criada com sucesso!');
      setNewFolderName('');
      setIsCreateFolderOpen(false);
      queryClient.invalidateQueries({ queryKey: ['model-folders', modelId] });
    },
    onError: () => {
      toast.error('Erro ao criar pasta');
    }
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

      const baseData = {
        model_id: modelId,
        display_order: (type === 'photo' ? photos : videos).length,
        stage: 'Organizar',
        tags: [],
        folder_id: selectedFolder !== 'all' && selectedFolder !== 'no-folder' ? selectedFolder : null,
        created_by_user_id: (await supabase.auth.getUser()).data.user?.id
      };

      if (type === 'photo') {
        const { error: dbError } = await supabase
          .from('model_photos')
          .insert({
            ...baseData,
            photo_url: publicUrl,
            is_primary: photos.length === 0
          });
        if (dbError) throw dbError;
        refetchPhotos();
      } else {
        const { error: dbError } = await supabase
          .from('model_videos')
          .insert({
            ...baseData,
            video_url: publicUrl,
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

  // Atualizar mídia
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
      toast.success('Atualizado com sucesso!');
      if (variables.type === 'photo') {
        refetchPhotos();
      } else {
        refetchVideos();
      }
    },
    onError: () => {
      toast.error('Erro ao atualizar');
    }
  });

  // Deletar mídia
  const deleteMutation = useMutation({
    mutationFn: async ({ id, type, url }: { id: string; type: 'photo' | 'video'; url: string }) => {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${modelId}/${fileName}`;
      
      const bucketName = type === 'photo' ? 'model-photos' : 'model-videos';
      await supabase.storage
        .from(bucketName)
        .remove([filePath]);

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
    onError: () => {
      toast.error('Erro ao deletar arquivo');
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
    photos.forEach(photo => {
      if (photo.is_primary && photo.id !== id) {
        updateMediaMutation.mutate({
          id: photo.id,
          type: 'photo',
          data: { is_primary: false }
        });
      }
    });

    updateMediaMutation.mutate({
      id,
      type: 'photo',
      data: { is_primary: true }
    });
  };

  const updateStage = (id: string, type: 'photo' | 'video', stage: string) => {
    updateMediaMutation.mutate({
      id,
      type,
      data: { stage }
    });
  };

  const updateFolder = (id: string, type: 'photo' | 'video', folderId: string | null) => {
    updateMediaMutation.mutate({
      id,
      type,
      data: { folder_id: folderId }
    });
  };

  const addTagToMedia = (id: string, type: 'photo' | 'video', currentTags: string[], newTag: string) => {
    if (!newTag.trim() || currentTags.includes(newTag)) return;
    
    updateMediaMutation.mutate({
      id,
      type,
      data: { tags: [...currentTags, newTag.trim()] }
    });
  };

  const removeTagFromMedia = (id: string, type: 'photo' | 'video', currentTags: string[], tagToRemove: string) => {
    updateMediaMutation.mutate({
      id,
      type,
      data: { tags: currentTags.filter(tag => tag !== tagToRemove) }
    });
  };

  // Obter todas as tags únicas
  const allTags = [...new Set([
    ...photos.flatMap(p => p.tags || []),
    ...videos.flatMap(v => v.tags || [])
  ])].sort();

  // Verificações condicionais para rendering
  if (modelLoading || !modelId) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Carregando dados do modelo...</div>
      </div>
    );
  }

  if (modelError) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-500">Erro ao carregar dados do modelo</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros e Controles */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Organização de Mídias
            </CardTitle>
            <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Nova Pasta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Pasta</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Nome da pasta"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                  />
                  <Button 
                    onClick={() => createFolderMutation.mutate(newFolderName)}
                    disabled={!newFolderName.trim()}
                    className="w-full"
                  >
                    Criar Pasta
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por Pasta */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Pasta</Label>
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as pastas</SelectItem>
                  <SelectItem value="no-folder">Sem pasta</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Etapa */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Etapa</Label>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as etapas</SelectItem>
                  {MEDIA_STAGES.map(stage => (
                    <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Tags */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Tags</Label>
              <div className="flex flex-wrap gap-1">
                {allTags.map(tag => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag) 
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Enviando...' : 'Adicionar Mídia'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Conteúdo das Mídias */}
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
            <div className="text-muted-foreground">Carregando fotos...</div>
          ) : photos.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma foto encontrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <Card key={photo.id} className="border-border bg-card overflow-hidden">
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
                    <Badge 
                      className="absolute top-2 right-2" 
                      variant={photo.stage === 'Publicadas' ? 'default' : 'secondary'}
                    >
                      {photo.stage}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-3 space-y-3">
                    {/* Etapa */}
                    <div>
                      <Label className="text-xs font-medium mb-1 block">Etapa</Label>
                      <Select 
                        value={photo.stage || 'Organizar'} 
                        onValueChange={(stage) => updateStage(photo.id, 'photo', stage)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MEDIA_STAGES.map(stage => (
                            <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Pasta */}
                    <div>
                      <Label className="text-xs font-medium mb-1 block">Pasta</Label>
                      <Select 
                        value={photo.folder_id || 'no-folder'} 
                        onValueChange={(folderId) => updateFolder(photo.id, 'photo', folderId === 'no-folder' ? null : folderId)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-folder">Sem pasta</SelectItem>
                          {folders.map(folder => (
                            <SelectItem key={folder.id} value={folder.id}>
                              {folder.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tags */}
                    <div>
                      <Label className="text-xs font-medium mb-1 block">Tags</Label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {(photo.tags || []).map(tag => (
                          <Badge 
                            key={tag} 
                            variant="outline" 
                            className="text-xs cursor-pointer"
                            onClick={() => removeTagFromMedia(photo.id, 'photo', photo.tags || [], tag)}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <Input
                          placeholder="Nova tag"
                          className="h-6 text-xs"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.currentTarget;
                              addTagToMedia(photo.id, 'photo', photo.tags || [], input.value);
                              input.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Configurações de visibilidade */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Label className="text-xs">Perfil</Label>
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
                      <Label className="text-xs">Galeria</Label>
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
            <div className="text-muted-foreground">Carregando vídeos...</div>
          ) : videos.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum vídeo encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <Card key={video.id} className="border-border bg-card overflow-hidden">
                  <div className="relative group">
                    <div className="w-full h-32 bg-muted flex items-center justify-center">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Video className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
                    <Badge 
                      className="absolute top-2 right-2" 
                      variant={video.stage === 'Publicadas' ? 'default' : 'secondary'}
                    >
                      {video.stage}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-3 space-y-3">
                    {/* Título */}
                    <Input
                      value={video.title || ''}
                      onChange={(e) => updateMediaMutation.mutate({
                        id: video.id,
                        type: 'video',
                        data: { title: e.target.value }
                      })}
                      placeholder="Título do vídeo"
                      className="text-xs h-8"
                    />

                    {/* Etapa */}
                    <div>
                      <Label className="text-xs font-medium mb-1 block">Etapa</Label>
                      <Select 
                        value={video.stage || 'Organizar'} 
                        onValueChange={(stage) => updateStage(video.id, 'video', stage)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MEDIA_STAGES.map(stage => (
                            <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Pasta */}
                    <div>
                      <Label className="text-xs font-medium mb-1 block">Pasta</Label>
                      <Select 
                        value={video.folder_id || 'no-folder'} 
                        onValueChange={(folderId) => updateFolder(video.id, 'video', folderId === 'no-folder' ? null : folderId)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-folder">Sem pasta</SelectItem>
                          {folders.map(folder => (
                            <SelectItem key={folder.id} value={folder.id}>
                              {folder.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tags */}
                    <div>
                      <Label className="text-xs font-medium mb-1 block">Tags</Label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {(video.tags || []).map(tag => (
                          <Badge 
                            key={tag} 
                            variant="outline" 
                            className="text-xs cursor-pointer"
                            onClick={() => removeTagFromMedia(video.id, 'video', video.tags || [], tag)}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <Input
                          placeholder="Nova tag"
                          className="h-6 text-xs"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.currentTarget;
                              addTagToMedia(video.id, 'video', video.tags || [], input.value);
                              input.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Configurações de visibilidade */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Label className="text-xs">Perfil</Label>
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
                      <Label className="text-xs">Galeria</Label>
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
                      <Label className="text-xs">Reels</Label>
                      <Switch
                        checked={video.is_featured_in_reels}
                        onCheckedChange={(checked) => updateMediaMutation.mutate({
                          id: video.id,
                          type: 'video',
                          data: { is_featured_in_reels: checked }
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizedMediaManager;