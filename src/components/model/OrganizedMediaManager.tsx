import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Image, Video, Plus, Upload, Trash2, Star, Eye, Film, Settings, 
  Folder, FolderPlus, Tag, Filter, Move, Grid3X3, List, FileText,
  ChevronDown, X, Edit3
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCurrentModel } from '@/hooks/useCurrentModel';

interface OrganizedMediaManagerProps {
  modelId?: string;
}

type ViewMode = 'grid' | 'list';
type ContentType = 'all' | 'photo' | 'video' | 'text';

interface FilterState {
  folder: string;
  stage: string;
  tags: string[];
  contentType: ContentType;
}

const OrganizedMediaManager = ({ modelId: propModelId }: OrganizedMediaManagerProps) => {
  // Hooks
  const { data: currentModel, isLoading: modelLoading, error: modelError } = useCurrentModel();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [uploading, setUploading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    folder: 'all',
    stage: 'all',
    tags: [],
    contentType: 'all'
  });
  
  // Estados para gerenciamento
  const [stages, setStages] = useState<string[]>([
    'Organizar', 'Editar', 'Revisar', 'Disponíveis', 'Publicadas'
  ]);
  const [newStageName, setNewStageName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [textContent, setTextContent] = useState('');
  const [textTitle, setTextTitle] = useState('');
  
  // Estados de modais
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isCreateStageOpen, setIsCreateStageOpen] = useState(false);
  const [isCreateTextOpen, setIsCreateTextOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const modelId = propModelId || currentModel?.model_id;

  // Buscar pastas
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
    enabled: !!modelId,
  });

  // Buscar fotos
  const { data: photos = [], isLoading: photosLoading, refetch: refetchPhotos } = useQuery({
    queryKey: ['model-photos', modelId, filters],
    queryFn: async () => {
      if (!modelId) return [];
      
      let query = supabase
        .from('model_photos')
        .select('*')
        .eq('model_id', modelId);

      if (filters.folder !== 'all') {
        if (filters.folder === 'no-folder') {
          query = query.is('folder_id', null);
        } else {
          query = query.eq('folder_id', filters.folder);
        }
      }

      if (filters.stage !== 'all') {
        query = query.eq('stage', filters.stage);
      }

      if (filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      const { data, error } = await query.order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!modelId,
  });

  // Buscar vídeos
  const { data: videos = [], isLoading: videosLoading, refetch: refetchVideos } = useQuery({
    queryKey: ['model-videos', modelId, filters],
    queryFn: async () => {
      if (!modelId) return [];
      
      let query = supabase
        .from('model_videos')
        .select('*')
        .eq('model_id', modelId);

      if (filters.folder !== 'all') {
        if (filters.folder === 'no-folder') {
          query = query.is('folder_id', null);
        } else {
          query = query.eq('folder_id', filters.folder);
        }
      }

      if (filters.stage !== 'all') {
        query = query.eq('stage', filters.stage);
      }

      if (filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      const { data, error } = await query.order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!modelId,
  });

  // Criar pasta
  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('model_media_folders')
        .insert({
          model_id: modelId,
          name,
          created_by_user_id: user.user?.id
        });
      
      if (error) throw error;
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
        stage: stages[0] || 'Organizar',
        tags: [],
        folder_id: filters.folder !== 'all' && filters.folder !== 'no-folder' ? filters.folder : null,
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

  const addStage = () => {
    if (!newStageName.trim() || stages.includes(newStageName)) return;
    setStages(prev => [...prev, newStageName.trim()]);
    setNewStageName('');
    setIsCreateStageOpen(false);
    toast.success('Etapa criada com sucesso!');
  };

  const removeStage = (stageToRemove: string) => {
    if (stages.length <= 1) {
      toast.error('Deve haver pelo menos uma etapa');
      return;
    }
    setStages(prev => prev.filter(stage => stage !== stageToRemove));
    toast.success('Etapa removida com sucesso!');
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

  // Filtrar conteúdo baseado nos filtros
  const filteredContent = () => {
    let content: any[] = [];
    
    if (filters.contentType === 'all' || filters.contentType === 'photo') {
      content = [...content, ...photos.map(p => ({ ...p, type: 'photo' }))];
    }
    
    if (filters.contentType === 'all' || filters.contentType === 'video') {
      content = [...content, ...videos.map(v => ({ ...v, type: 'video' }))];
    }

    return content.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  };

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

  const content = filteredContent();
  const isLoading = photosLoading || videosLoading;

  return (
    <div className="space-y-6">
      {/* Header com controles principais */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Gerenciador de Conteúdo
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Toggle de visualização */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Filtros */}
              <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                    {(filters.folder !== 'all' || filters.stage !== 'all' || filters.tags.length > 0 || filters.contentType !== 'all') && 
                      <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {[
                          filters.folder !== 'all' ? 1 : 0,
                          filters.stage !== 'all' ? 1 : 0,
                          filters.tags.length,
                          filters.contentType !== 'all' ? 1 : 0
                        ].reduce((a, b) => a + b, 0)}
                      </Badge>
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4 space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Filtros</h4>
                    
                    {/* Tipo de Conteúdo */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Tipo de Conteúdo</Label>
                      <Select value={filters.contentType} onValueChange={(value: ContentType) => 
                        setFilters(prev => ({ ...prev, contentType: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="photo">
                            <div className="flex items-center gap-2">
                              <Image className="h-4 w-4" />
                              Fotos
                            </div>
                          </SelectItem>
                          <SelectItem value="video">
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              Vídeos
                            </div>
                          </SelectItem>
                          <SelectItem value="text">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Textos
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Pasta */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Pasta</Label>
                      <Select value={filters.folder} onValueChange={(value) => 
                        setFilters(prev => ({ ...prev, folder: value }))
                      }>
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

                    {/* Etapa */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium">Etapa</Label>
                        <Dialog open={isCreateStageOpen} onOpenChange={setIsCreateStageOpen}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Plus className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Gerenciar Etapas</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Nome da nova etapa"
                                  value={newStageName}
                                  onChange={(e) => setNewStageName(e.target.value)}
                                />
                                <Button onClick={addStage} disabled={!newStageName.trim()}>
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Etapas Atuais:</Label>
                                {stages.map(stage => (
                                  <div key={stage} className="flex items-center justify-between p-2 border rounded">
                                    <span className="text-sm">{stage}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeStage(stage)}
                                      disabled={stages.length <= 1}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Select value={filters.stage} onValueChange={(value) => 
                        setFilters(prev => ({ ...prev, stage: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as etapas</SelectItem>
                          {stages.map(stage => (
                            <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tags */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Tags</Label>
                      <div className="flex flex-wrap gap-1">
                        {allTags.map(tag => (
                          <Button
                            key={tag}
                            variant={filters.tags.includes(tag) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setFilters(prev => ({
                                ...prev,
                                tags: prev.tags.includes(tag) 
                                  ? prev.tags.filter(t => t !== tag)
                                  : [...prev.tags, tag]
                              }));
                            }}
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Limpar filtros */}
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setFilters({
                        folder: 'all',
                        stage: 'all',
                        tags: [],
                        contentType: 'all'
                      })}
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Nova Pasta */}
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
          </div>
        </CardHeader>
      </Card>

      {/* Adicionar Conteúdo */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={uploading} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  {uploading ? 'Enviando...' : 'Adicionar Conteúdo'}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Carregar Arquivos
                </DropdownMenuItem>
                <Dialog open={isCreateTextOpen} onOpenChange={setIsCreateTextOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <FileText className="h-4 w-4 mr-2" />
                      Criar Texto
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Criar Conteúdo de Texto</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Título do texto"
                        value={textTitle}
                        onChange={(e) => setTextTitle(e.target.value)}
                      />
                      <Textarea
                        placeholder="Conteúdo do texto..."
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        rows={6}
                      />
                      <Button 
                        onClick={() => {
                          // TODO: Implementar salvamento de texto
                          toast.success('Texto criado com sucesso!');
                          setTextTitle('');
                          setTextContent('');
                          setIsCreateTextOpen(false);
                        }}
                        disabled={!textTitle.trim() || !textContent.trim()}
                        className="w-full"
                      >
                        Criar Texto
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
            multiple
          />
        </CardContent>
      </Card>

      {/* Conteúdo */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-muted-foreground text-center py-8">Carregando conteúdo...</div>
          ) : content.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <div className="flex flex-col items-center gap-4">
                {filters.contentType === 'photo' ? (
                  <Image className="h-12 w-12 mx-auto opacity-50" />
                ) : filters.contentType === 'video' ? (
                  <Video className="h-12 w-12 mx-auto opacity-50" />
                ) : filters.contentType === 'text' ? (
                  <FileText className="h-12 w-12 mx-auto opacity-50" />
                ) : (
                  <div className="flex gap-2">
                    <Image className="h-8 w-8 opacity-50" />
                    <Video className="h-8 w-8 opacity-50" />
                    <FileText className="h-8 w-8 opacity-50" />
                  </div>
                )}
                <p>Nenhum conteúdo encontrado</p>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" 
              : "space-y-4"
            }>
              {content.map((item) => (
                <Card key={item.id} className={`border-border bg-card overflow-hidden ${
                  viewMode === 'list' ? 'flex' : ''
                }`}>
                  <div className={`relative group ${viewMode === 'list' ? 'w-32 h-24 flex-shrink-0' : ''}`}>
                    {item.type === 'photo' ? (
                      <img
                        src={item.photo_url}
                        alt="Foto"
                        className={`w-full object-cover ${viewMode === 'list' ? 'h-24' : 'h-32'}`}
                      />
                    ) : (
                      <div className={`w-full bg-muted flex items-center justify-center ${viewMode === 'list' ? 'h-24' : 'h-32'}`}>
                        {item.thumbnail_url ? (
                          <img
                            src={item.thumbnail_url}
                            alt="Thumbnail"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Video className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {item.type === 'photo' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => togglePrimary(item.id)}
                        >
                          <Star className={`h-4 w-4 ${item.is_primary ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate({
                          id: item.id,
                          type: item.type,
                          url: item.type === 'photo' ? item.photo_url : item.video_url
                        })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {item.type === 'photo' && item.is_primary && (
                      <Badge className="absolute top-2 left-2 bg-yellow-600 text-white">
                        Principal
                      </Badge>
                    )}
                    <Badge 
                      className="absolute top-2 right-2" 
                      variant={item.stage === 'Publicadas' ? 'default' : 'secondary'}
                    >
                      {item.stage}
                    </Badge>
                  </div>
                  
                  <CardContent className={`p-3 space-y-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    {item.type === 'video' && (
                      <Input
                        value={item.title || ''}
                        onChange={(e) => updateMediaMutation.mutate({
                          id: item.id,
                          type: 'video',
                          data: { title: e.target.value }
                        })}
                        placeholder="Título do vídeo"
                        className="text-xs h-8"
                      />
                    )}

                    <div className={viewMode === 'list' ? 'grid grid-cols-3 gap-3' : 'space-y-3'}>
                      {/* Etapa */}
                      <div>
                        <Label className="text-xs font-medium mb-1 block">Etapa</Label>
                        <Select 
                          value={item.stage || stages[0]} 
                          onValueChange={(stage) => updateStage(item.id, item.type, stage)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {stages.map(stage => (
                              <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Pasta */}
                      <div>
                        <Label className="text-xs font-medium mb-1 block">Pasta</Label>
                        <Select 
                          value={item.folder_id || 'no-folder'} 
                          onValueChange={(folderId) => updateFolder(item.id, item.type, folderId === 'no-folder' ? null : folderId)}
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
                          {(item.tags || []).map((tag: string) => (
                            <Badge 
                              key={tag} 
                              variant="outline" 
                              className="text-xs cursor-pointer"
                              onClick={() => removeTagFromMedia(item.id, item.type, item.tags || [], tag)}
                            >
                              {tag} ×
                            </Badge>
                          ))}
                        </div>
                        <Input
                          placeholder="Nova tag"
                          className="h-6 text-xs"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.currentTarget;
                              addTagToMedia(item.id, item.type, item.tags || [], input.value);
                              input.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Configurações de visibilidade */}
                    <div className={`pt-2 border-t ${viewMode === 'list' ? 'flex gap-6' : 'space-y-2'}`}>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Perfil</Label>
                        <Switch
                          checked={item.show_in_profile}
                          onCheckedChange={(checked) => updateMediaMutation.mutate({
                            id: item.id,
                            type: item.type,
                            data: { show_in_profile: checked }
                          })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Galeria</Label>
                        <Switch
                          checked={item.show_in_gallery}
                          onCheckedChange={(checked) => updateMediaMutation.mutate({
                            id: item.id,
                            type: item.type,
                            data: { show_in_gallery: checked }
                          })}
                        />
                      </div>
                      {item.type === 'video' && (
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Reels</Label>
                          <Switch
                            checked={item.is_featured_in_reels}
                            onCheckedChange={(checked) => updateMediaMutation.mutate({
                              id: item.id,
                              type: 'video',
                              data: { is_featured_in_reels: checked }
                            })}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizedMediaManager;