import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  ArrowLeft, 
  Image, 
  Video, 
  Upload, 
  Trash2, 
  Star, 
  Film,
  Plus,
  Folder,
  Settings,
  Filter,
  Grid3X3,
  List,
  Tag,
  FolderPlus,
  X,
  MoreHorizontal,
  Move,
  CheckSquare,
  Square
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCurrentModel } from '@/hooks/useCurrentModel';

interface ChatMediaManagerProps {
  onBack: () => void;
}

type ViewMode = 'grid' | 'list';
type ContentType = 'all' | 'photo' | 'video';

interface FilterState {
  folder: string;
  stage: string;
  tags: string[];
  contentType: ContentType;
}

const ChatMediaManager: React.FC<ChatMediaManagerProps> = ({ onBack }) => {
  const { data: currentModel } = useCurrentModel();
  const [activeTab, setActiveTab] = useState('photos');
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
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
  const [newFolderName, setNewFolderName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  
  // Estados de modais
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [selectedMediaItem, setSelectedMediaItem] = useState<any>(null);
  const [isMediaDetailsOpen, setIsMediaDetailsOpen] = useState(false);
  
  // Estados para seleção múltipla
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const modelId = currentModel?.model_id;

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
  const { data: photos = [], refetch: refetchPhotos } = useQuery({
    queryKey: ['model-photos', modelId],
    queryFn: async () => {
      if (!modelId) return [];
      
      const { data, error } = await supabase
        .from('model_photos')
        .select('*')
        .eq('model_id', modelId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!modelId,
  });

  // Buscar vídeos
  const { data: videos = [], refetch: refetchVideos } = useQuery({
    queryKey: ['model-videos', modelId],
    queryFn: async () => {
      if (!modelId) return [];
      
      const { data, error } = await supabase
        .from('model_videos')
        .select('*')
        .eq('model_id', modelId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!modelId,
  });

  // Upload de arquivo
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!modelId) throw new Error('Model ID não encontrado');

      const isVideo = file.type.startsWith('video/');
      const fileExt = file.name.split('.').pop();
      const fileName = `${modelId}_${Date.now()}.${fileExt}`;
      const bucket = isVideo ? 'model-videos' : 'model-photos';
      
      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // Salvar no banco de dados
      if (isVideo) {
        const { error: dbError } = await supabase
          .from('model_videos')
          .insert({
            model_id: modelId,
            video_url: urlData.publicUrl,
            title: file.name.split('.')[0],
            is_featured_in_reels: false,
            show_in_profile: true,
            show_in_gallery: true,
            tags: [],
            stage: stages[0]
          });
        
        if (dbError) throw dbError;
      } else {
        const { error: dbError } = await supabase
          .from('model_photos')
          .insert({
            model_id: modelId,
            photo_url: urlData.publicUrl,
            is_primary: false,
            show_in_profile: true,
            show_in_gallery: true,
            tags: [],
            stage: stages[0]
          });
        
        if (dbError) throw dbError;
      }

      return urlData.publicUrl;
    },
    onSuccess: () => {
      toast.success('Upload realizado com sucesso!');
      refetchPhotos();
      refetchVideos();
    },
    onError: (error) => {
      console.error('Erro no upload:', error);
      toast.error('Erro ao fazer upload do arquivo');
    },
    onSettled: () => {
      setUploading(false);
    },
  });

  // Deletar mídia
  const deleteMutation = useMutation({
    mutationFn: async ({ id, type, url }: { id: string; type: 'photo' | 'video'; url: string }) => {
      // Deletar do storage
      const fileName = url.split('/').pop();
      if (fileName) {
        const bucket = type === 'video' ? 'model-videos' : 'model-photos';
        await supabase.storage.from(bucket).remove([fileName]);
      }

      // Deletar do banco
      const table = type === 'video' ? 'model_videos' : 'model_photos';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Mídia deletada com sucesso!');
      refetchPhotos();
      refetchVideos();
    },
    onError: (error) => {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar mídia');
    },
  });

  // Atualizar configurações de mídia
  const updateMediaMutation = useMutation({
    mutationFn: async ({ id, type, data }: { id: string; type: 'photo' | 'video'; data: any }) => {
      const table = type === 'video' ? 'model_videos' : 'model_photos';
      const { error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      refetchPhotos();
      refetchVideos();
    },
  });

  // Criar pasta
  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!modelId) throw new Error('Model ID não encontrado');
      
      const { error } = await supabase
        .from('model_media_folders')
        .insert({
          model_id: modelId,
          name: name
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Pasta criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['model-folders', modelId] });
    },
    onError: (error) => {
      console.error('Erro ao criar pasta:', error);
      toast.error('Erro ao criar pasta');
    },
  });

  // Deletar pasta
  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: string) => {
      const { error } = await supabase
        .from('model_media_folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Pasta deletada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['model-folders', modelId] });
    },
    onError: (error) => {
      console.error('Erro ao deletar pasta:', error);
      toast.error('Erro ao deletar pasta');
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      uploadMutation.mutate(file);
    }
  };

  const togglePrimary = (photoId: string) => {
    updateMediaMutation.mutate({
      id: photoId,
      type: 'photo',
      data: { is_primary: true }
    });

    // Remover is_primary das outras fotos
    photos.forEach(photo => {
      if (photo.id !== photoId && photo.is_primary) {
        updateMediaMutation.mutate({
          id: photo.id,
          type: 'photo',
          data: { is_primary: false }
        });
      }
    });
  };

  const toggleReelsFeatured = (videoId: string, current: boolean) => {
    updateMediaMutation.mutate({
      id: videoId,
      type: 'video',
      data: { is_featured_in_reels: !current }
    });
  };

  const addTagToItem = (itemId: string, type: 'photo' | 'video', tag: string) => {
    const items = type === 'photo' ? photos : videos;
    const item = items.find(i => i.id === itemId);
    if (item) {
      const currentTags = item.tags || [];
      if (!currentTags.includes(tag)) {
        updateMediaMutation.mutate({
          id: itemId,
          type,
          data: { tags: [...currentTags, tag] }
        });
      }
    }
  };

  const removeTagFromItem = (itemId: string, type: 'photo' | 'video', tagToRemove: string) => {
    const items = type === 'photo' ? photos : videos;
    const item = items.find(i => i.id === itemId);
    if (item) {
      const updatedTags = (item.tags || []).filter(tag => tag !== tagToRemove);
      updateMediaMutation.mutate({
        id: itemId,
        type,
        data: { tags: updatedTags }
      });
    }
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Filtrar mídias
  const filteredPhotos = photos.filter(photo => {
    if (filters.contentType === 'video') return false;
    if (filters.folder !== 'all') {
      if (filters.folder === 'no-folder' && photo.folder_id) return false;
      if (filters.folder !== 'no-folder' && photo.folder_id !== filters.folder) return false;
    }
    if (filters.stage !== 'all' && photo.stage !== filters.stage) return false;
    if (filters.tags.length > 0) {
      const photoTags = photo.tags || [];
      if (!filters.tags.some(tag => photoTags.includes(tag))) return false;
    }
    return true;
  });

  const filteredVideos = videos.filter(video => {
    if (filters.contentType === 'photo') return false;
    if (filters.folder !== 'all') {
      if (filters.folder === 'no-folder' && video.folder_id) return false;
      if (filters.folder !== 'no-folder' && video.folder_id !== filters.folder) return false;
    }
    if (filters.stage !== 'all' && video.stage !== filters.stage) return false;
    if (filters.tags.length > 0) {
      const videoTags = video.tags || [];
      if (!filters.tags.some(tag => videoTags.includes(tag))) return false;
    }
    return true;
  });

  // Todas as tags disponíveis
  const allTags = Array.from(new Set([
    ...photos.flatMap(photo => photo.tags || []),
    ...videos.flatMap(video => video.tags || [])
  ]));

  return (
    <div className="bg-zinc-950 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold text-white">Gerenciar Mídias</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {/* Upload Button */}
        <div className="p-4 border-b border-zinc-800">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
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

        {/* Control Bar */}
        <div className="flex flex-col gap-4 p-4 border-b border-zinc-800">
          {/* Mobile-first layout */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Top row - View modes and filters */}
            <div className="flex gap-2 flex-1">
              {/* View Toggle */}
              <div className="flex bg-zinc-800 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('grid')}
                  className="px-2 py-1 h-8"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('list')}
                  className="px-2 py-1 h-8"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Filters */}
              <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsFiltersOpen(true)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 flex-1 sm:flex-initial"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  {(filters.folder !== 'all' || filters.stage !== 'all' || filters.tags.length > 0) && (
                    <Badge className="ml-2 h-4 px-1 bg-purple-600 text-white text-xs">
                      {[
                        filters.folder !== 'all' ? 1 : 0,
                        filters.stage !== 'all' ? 1 : 0,
                        filters.tags.length
                      ].reduce((a, b) => a + b, 0)}
                    </Badge>
                  )}
                </Button>
                <SheetContent side="bottom" className="bg-zinc-900 border-zinc-700 h-[80vh]">
                  <SheetHeader>
                    <SheetTitle className="text-white">Filtros</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    {/* Content Type Filter */}
                    <div>
                      <Label className="text-sm text-zinc-400">Tipo de Conteúdo</Label>
                      <Select value={filters.contentType} onValueChange={(value: ContentType) => setFilters(f => ({...f, contentType: value}))}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="photo">Fotos</SelectItem>
                          <SelectItem value="video">Vídeos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Folder Filter */}
                    <div>
                      <Label className="text-sm text-zinc-400">Pasta</Label>
                      <Select value={filters.folder} onValueChange={(value) => setFilters(f => ({...f, folder: value}))}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="all">Todas as Pastas</SelectItem>
                          <SelectItem value="no-folder">Sem Pasta</SelectItem>
                          {folders.map(folder => (
                            <SelectItem key={folder.id} value={folder.id}>
                              {folder.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Stage Filter */}
                    <div>
                      <Label className="text-sm text-zinc-400">Estágio</Label>
                      <Select value={filters.stage} onValueChange={(value) => setFilters(f => ({...f, stage: value}))}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="all">Todos os Estágios</SelectItem>
                          {stages.map(stage => (
                            <SelectItem key={stage} value={stage}>
                              {stage}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Tags Filter */}
                    <div>
                      <Label className="text-sm text-zinc-400">Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {allTags.map(tag => (
                          <Badge
                            key={tag}
                            variant={filters.tags.includes(tag) ? "default" : "outline"}
                            className={`cursor-pointer text-xs ${
                              filters.tags.includes(tag) 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-zinc-700 border-zinc-600 text-zinc-300 hover:bg-zinc-600'
                            }`}
                            onClick={() => {
                              setFilters(f => ({
                                ...f,
                                tags: f.tags.includes(tag) 
                                  ? f.tags.filter(t => t !== tag)
                                  : [...f.tags, tag]
                              }));
                            }}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => setFilters({
                        folder: 'all',
                        stage: 'all',
                        tags: [],
                        contentType: 'all'
                      })}
                      variant="outline"
                      size="sm"
                      className="w-full bg-zinc-700 border-zinc-600 text-zinc-300 hover:bg-zinc-600"
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Bulk Actions Toggle */}
              <Button
                size="sm"
                variant={bulkActionMode ? "default" : "outline"}
                onClick={() => {
                  setBulkActionMode(!bulkActionMode);
                  setSelectedItems(new Set());
                }}
                className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
              >
                <CheckSquare className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">
                  {bulkActionMode ? 'Cancelar' : 'Selecionar'}
                </span>
              </Button>
            </div>

            {/* Bottom row - Folder management */}
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 flex-1 sm:flex-initial"
                  >
                    <Folder className="h-4 w-4 mr-2" />
                    Pastas
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 bg-zinc-800 border-zinc-700" align="end">
                  <div className="space-y-3">
                    <h4 className="font-medium text-white">Gerenciar Pastas</h4>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {folders.map(folder => (
                        <div key={folder.id} className="flex items-center justify-between p-2 bg-zinc-900 rounded">
                          <span className="text-sm text-zinc-300">{folder.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteFolderMutation.mutate(folder.id)}
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nova pasta"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        className="bg-zinc-900 border-zinc-600 text-white text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          if (newFolderName.trim()) {
                            createFolderMutation.mutate(newFolderName.trim());
                            setNewFolderName('');
                          }
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Media Grid/List */}
        <div className="p-4 flex-1 overflow-y-auto">
          {(filteredPhotos.length === 0 && filteredVideos.length === 0) ? (
            <div className="text-center text-zinc-400 py-12">
              <Image className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg mb-2">Nenhuma mídia encontrada</p>
              <p className="text-sm">
                {filters.folder !== 'all' || filters.stage !== 'all' || filters.tags.length > 0 || filters.contentType !== 'all'
                  ? 'Tente ajustar os filtros ou'
                  : 'Clique em "Adicionar Foto ou Vídeo" para começar'
                }
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3" 
              : "space-y-3"
            }>
              {/* Render Photos */}
              {filteredPhotos.map((photo) => (
                <div key={`photo-${photo.id}`} className="relative group">
                  {bulkActionMode && (
                    <div className="absolute top-2 right-2 z-10">
                      <Checkbox
                        checked={selectedItems.has(`photo-${photo.id}`)}
                        onCheckedChange={() => toggleItemSelection(`photo-${photo.id}`)}
                        className="bg-zinc-700 border-zinc-600"
                      />
                    </div>
                  )}
                  
                  <div 
                    className="relative cursor-pointer overflow-hidden rounded-lg bg-zinc-800"
                    onClick={() => {
                      setSelectedMediaItem({ ...photo, type: 'photo' });
                      setIsMediaDetailsOpen(true);
                    }}
                  >
                    <img
                      src={photo.photo_url}
                      alt="Foto"
                      className={viewMode === 'grid' 
                        ? "w-full aspect-square object-cover hover:scale-105 transition-transform" 
                        : "w-20 h-20 object-cover"
                      }
                    />
                    
                    {!bulkActionMode && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePrimary(photo.id);
                          }}
                          className="bg-zinc-700 hover:bg-zinc-600"
                        >
                          <Star className={`h-4 w-4 ${photo.is_primary ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-300'}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate({
                              id: photo.id,
                              type: 'photo',
                              url: photo.photo_url
                            });
                          }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 space-y-1">
                      {photo.is_primary && (
                        <Badge className="bg-yellow-600 text-white text-xs">
                          Principal
                        </Badge>
                      )}
                      {photo.tags && photo.tags.length > 0 && (
                        <Badge className="bg-purple-600 text-white text-xs">
                          {photo.tags.length} tag{photo.tags.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Render Videos */}
              {filteredVideos.map((video) => (
                <div key={`video-${video.id}`} className="relative group">
                  {bulkActionMode && (
                    <div className="absolute top-2 right-2 z-10">
                      <Checkbox
                        checked={selectedItems.has(`video-${video.id}`)}
                        onCheckedChange={() => toggleItemSelection(`video-${video.id}`)}
                        className="bg-zinc-700 border-zinc-600"
                      />
                    </div>
                  )}
                  
                  <div 
                    className="relative cursor-pointer overflow-hidden rounded-lg bg-zinc-800"
                    onClick={() => {
                      setSelectedMediaItem({ ...video, type: 'video' });
                      setIsMediaDetailsOpen(true);
                    }}
                  >
                    <div className={viewMode === 'grid' 
                      ? "w-full aspect-square bg-zinc-900 flex items-center justify-center hover:scale-105 transition-transform" 
                      : "w-20 h-20 bg-zinc-900 flex items-center justify-center"
                    }>
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
                    
                    {!bulkActionMode && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReelsFeatured(video.id, video.is_featured_in_reels);
                          }}
                          className="bg-zinc-700 hover:bg-zinc-600"
                        >
                          <Film className={`h-4 w-4 ${video.is_featured_in_reels ? 'fill-blue-400 text-blue-400' : 'text-zinc-300'}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate({
                              id: video.id,
                              type: 'video',
                              url: video.video_url
                            });
                          }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 space-y-1">
                      {video.is_featured_in_reels && (
                        <Badge className="bg-blue-600 text-white text-xs">
                          Reels
                        </Badge>
                      )}
                      {video.tags && video.tags.length > 0 && (
                        <Badge className="bg-purple-600 text-white text-xs">
                          {video.tags.length} tag{video.tags.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Video Play Icon */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-black bg-opacity-50 rounded-full p-2">
                        <Video className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Media Details Modal */}
        <Dialog open={isMediaDetailsOpen} onOpenChange={setIsMediaDetailsOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-700 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {selectedMediaItem?.type === 'photo' ? 'Detalhes da Foto' : 'Detalhes do Vídeo'}
              </DialogTitle>
            </DialogHeader>
            
            {selectedMediaItem && (
              <div className="space-y-6">
                {/* Media Preview */}
                <div className="flex justify-center">
                  {selectedMediaItem.type === 'photo' ? (
                    <img
                      src={selectedMediaItem.photo_url}
                      alt="Foto"
                      className="max-w-full max-h-64 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-full max-w-md aspect-video bg-zinc-800 rounded-lg flex items-center justify-center">
                      {selectedMediaItem.thumbnail_url ? (
                        <img
                          src={selectedMediaItem.thumbnail_url}
                          alt="Thumbnail"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Video className="h-12 w-12 text-zinc-500" />
                      )}
                    </div>
                  )}
                </div>

                {/* Video Title */}
                {selectedMediaItem.type === 'video' && (
                  <div>
                    <Label className="text-sm text-zinc-400">Título</Label>
                    <Input
                      value={selectedMediaItem.title || ''}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setSelectedMediaItem(prev => ({ ...prev, title: newTitle }));
                        updateMediaMutation.mutate({
                          id: selectedMediaItem.id,
                          type: 'video',
                          data: { title: newTitle }
                        });
                      }}
                      placeholder="Título do vídeo"
                      className="bg-zinc-800 border-zinc-600 text-white mt-2"
                    />
                  </div>
                )}

                {/* Tags */}
                <div>
                  <Label className="text-sm text-zinc-400">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedMediaItem.tags && selectedMediaItem.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="bg-zinc-700 border-zinc-600 text-zinc-300 cursor-pointer hover:bg-red-600"
                        onClick={() => removeTagFromItem(selectedMediaItem.id, selectedMediaItem.type, tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Adicionar tag"
                    className="bg-zinc-800 border-zinc-600 text-white mt-2"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        if (target.value.trim()) {
                          addTagToItem(selectedMediaItem.id, selectedMediaItem.type, target.value.trim());
                          target.value = '';
                        }
                      }
                    }}
                  />
                </div>

                {/* Stage and Folder */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-zinc-400">Estágio</Label>
                    <Select 
                      value={selectedMediaItem.stage || stages[0]} 
                      onValueChange={(value) => {
                        setSelectedMediaItem(prev => ({ ...prev, stage: value }));
                        updateMediaMutation.mutate({
                          id: selectedMediaItem.id,
                          type: selectedMediaItem.type,
                          data: { stage: value }
                        });
                      }}
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        {stages.map(stage => (
                          <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm text-zinc-400">Pasta</Label>
                    <Select 
                      value={selectedMediaItem.folder_id || 'no-folder'} 
                      onValueChange={(value) => {
                        const folderId = value === 'no-folder' ? null : value;
                        setSelectedMediaItem(prev => ({ ...prev, folder_id: folderId }));
                        updateMediaMutation.mutate({
                          id: selectedMediaItem.id,
                          type: selectedMediaItem.type,
                          data: { folder_id: folderId }
                        });
                      }}
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="no-folder">Sem Pasta</SelectItem>
                        {folders.map(folder => (
                          <SelectItem key={folder.id} value={folder.id}>
                            {folder.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Visibility Controls */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Visibilidade</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                      <Label className="text-zinc-300">Mostrar no Perfil</Label>
                      <Switch
                        checked={selectedMediaItem.show_in_profile}
                        onCheckedChange={(checked) => {
                          setSelectedMediaItem(prev => ({ ...prev, show_in_profile: checked }));
                          updateMediaMutation.mutate({
                            id: selectedMediaItem.id,
                            type: selectedMediaItem.type,
                            data: { show_in_profile: checked }
                          });
                        }}
                        className="data-[state=checked]:bg-purple-600"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                      <Label className="text-zinc-300">Mostrar na Galeria</Label>
                      <Switch
                        checked={selectedMediaItem.show_in_gallery}
                        onCheckedChange={(checked) => {
                          setSelectedMediaItem(prev => ({ ...prev, show_in_gallery: checked }));
                          updateMediaMutation.mutate({
                            id: selectedMediaItem.id,
                            type: selectedMediaItem.type,
                            data: { show_in_gallery: checked }
                          });
                        }}
                        className="data-[state=checked]:bg-purple-600"
                      />
                    </div>

                    {selectedMediaItem.type === 'photo' && (
                      <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                        <Label className="text-zinc-300">Foto Principal</Label>
                        <Switch
                          checked={selectedMediaItem.is_primary}
                          onCheckedChange={() => togglePrimary(selectedMediaItem.id)}
                          className="data-[state=checked]:bg-yellow-600"
                        />
                      </div>
                    )}

                    {selectedMediaItem.type === 'video' && (
                      <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                        <Label className="text-zinc-300">Destacar nos Reels</Label>
                        <Switch
                          checked={selectedMediaItem.is_featured_in_reels}
                          onCheckedChange={(checked) => {
                            setSelectedMediaItem(prev => ({ ...prev, is_featured_in_reels: checked }));
                            toggleReelsFeatured(selectedMediaItem.id, !checked);
                          }}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-700">
                  <Button
                    variant="outline"
                    onClick={() => setIsMediaDetailsOpen(false)}
                    className="bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                  >
                    Fechar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deleteMutation.mutate({
                        id: selectedMediaItem.id,
                        type: selectedMediaItem.type,
                        url: selectedMediaItem.type === 'photo' ? selectedMediaItem.photo_url : selectedMediaItem.video_url
                      });
                      setIsMediaDetailsOpen(false);
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ChatMediaManager;