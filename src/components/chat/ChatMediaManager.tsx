import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
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

  // Buscar todas as tags únicas
  const { data: allTags = [] } = useQuery({
    queryKey: ['model-tags', modelId],
    queryFn: async () => {
      if (!modelId) return [];
      
      const [photosRes, videosRes] = await Promise.all([
        supabase.from('model_photos').select('tags').eq('model_id', modelId),
        supabase.from('model_videos').select('tags').eq('model_id', modelId)
      ]);
      
      const allTagsSet = new Set<string>();
      
      [...(photosRes.data || []), ...(videosRes.data || [])]
        .forEach(item => {
          if (item.tags && Array.isArray(item.tags)) {
            item.tags.forEach((tag: string) => allTagsSet.add(tag));
          }
        });
      
      return Array.from(allTagsSet).sort();
    },
    enabled: !!modelId,
  });

  // Buscar fotos com filtros
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
    enabled: !!modelId && (filters.contentType === 'all' || filters.contentType === 'photo'),
  });

  // Buscar vídeos com filtros
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
    enabled: !!modelId && (filters.contentType === 'all' || filters.contentType === 'video'),
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

  // Mutation para ações em massa
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ items, updates }: { items: Array<{id: string, type: 'photo' | 'video'}>, updates: any }) => {
      const photoUpdates = items.filter(item => item.type === 'photo');
      const videoUpdates = items.filter(item => item.type === 'video');

      if (photoUpdates.length > 0) {
        const { error: photoError } = await supabase
          .from('model_photos')
          .update(updates)
          .in('id', photoUpdates.map(item => item.id));
        if (photoError) throw photoError;
      }

      if (videoUpdates.length > 0) {
        const { error: videoError } = await supabase
          .from('model_videos')
          .update(updates)
          .in('id', videoUpdates.map(item => item.id));
        if (videoError) throw videoError;
      }
    },
    onSuccess: () => {
      toast.success('Itens atualizados com sucesso!');
      refetchPhotos();
      refetchVideos();
      setSelectedItems(new Set());
      setBulkActionMode(false);
    },
    onError: () => {
      toast.error('Erro ao atualizar itens');
    }
  });

  // Mutation para deletar em massa
  const bulkDeleteMutation = useMutation({
    mutationFn: async ({ items }: { items: Array<{id: string, type: 'photo' | 'video', url: string}> }) => {
      for (const item of items) {
        const urlParts = item.url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `${modelId}/${fileName}`;
        
        const bucketName = item.type === 'photo' ? 'model-photos' : 'model-videos';
        await supabase.storage
          .from(bucketName)
          .remove([filePath]);

        const tableName = item.type === 'photo' ? 'model_photos' : 'model_videos';
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', item.id);

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      toast.success(`${variables.items.length} ${variables.items.length === 1 ? 'item deletado' : 'itens deletados'} com sucesso!`);
      refetchPhotos();
      refetchVideos();
      setSelectedItems(new Set());
      setBulkActionMode(false);
    },
    onError: () => {
      toast.error('Erro ao deletar itens');
    }
  });

  // Funções auxiliares
  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const selectAllVisibleItems = () => {
    const allItems = [...photos.map(p => `photo-${p.id}`), ...videos.map(v => `video-${v.id}`)];
    setSelectedItems(new Set(allItems));
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
    setBulkActionMode(false);
  };

  const getSelectedItemsData = () => {
    const items: Array<{id: string, type: 'photo' | 'video', url: string}> = [];
    
    selectedItems.forEach(itemId => {
      if (itemId.startsWith('photo-')) {
        const photoId = itemId.replace('photo-', '');
        const photo = photos.find(p => p.id === photoId);
        if (photo) {
          items.push({
            id: photo.id,
            type: 'photo',
            url: photo.photo_url
          });
        }
      } else if (itemId.startsWith('video-')) {
        const videoId = itemId.replace('video-', '');
        const video = videos.find(v => v.id === videoId);
        if (video) {
          items.push({
            id: video.id,
            type: 'video',
            url: video.video_url
          });
        }
      }
    });
    
    return items;
  };

  const handleBulkAction = (action: string, value?: string) => {
    const items = getSelectedItemsData();
    if (items.length === 0) return;

    switch (action) {
      case 'delete':
        if (confirm(`Tem certeza que deseja deletar ${items.length} ${items.length === 1 ? 'item' : 'itens'}?`)) {
          bulkDeleteMutation.mutate({ items });
        }
        break;
      case 'stage':
        if (value) {
          bulkUpdateMutation.mutate({
            items: items.map(item => ({ id: item.id, type: item.type })),
            updates: { stage: value }
          });
        }
        break;
      case 'folder':
        bulkUpdateMutation.mutate({
          items: items.map(item => ({ id: item.id, type: item.type })),
          updates: { folder_id: value === 'no-folder' ? null : value }
        });
        break;
      case 'addTag':
        if (value && value.trim()) {
          // Adicionar tag aos itens selecionados
          items.forEach(item => {
            const currentItem = item.type === 'photo' 
              ? photos.find(p => p.id === item.id)
              : videos.find(v => v.id === item.id);
            
            if (currentItem) {
              const currentTags = currentItem.tags || [];
              const newTags = [...currentTags, value.trim()].filter((tag, index, arr) => arr.indexOf(tag) === index);
              
              updateMediaMutation.mutate({
                id: item.id,
                type: item.type,
                data: { tags: newTags }
              });
            }
          });
        }
        break;
    }
  };

  const addTagToItem = (itemId: string, type: 'photo' | 'video', tag: string) => {
    const currentItem = type === 'photo' 
      ? photos.find(p => p.id === itemId)
      : videos.find(v => v.id === itemId);
    
    if (currentItem) {
      const currentTags = currentItem.tags || [];
      const newTags = [...currentTags, tag].filter((tag, index, arr) => arr.indexOf(tag) === index);
      
      updateMediaMutation.mutate({
        id: itemId,
        type,
        data: { tags: newTags }
      });
    }
  };

  const removeTagFromItem = (itemId: string, type: 'photo' | 'video', tagToRemove: string) => {
    const currentItem = type === 'photo' 
      ? photos.find(p => p.id === itemId)
      : videos.find(v => v.id === itemId);
    
    if (currentItem) {
      const newTags = (currentItem.tags || []).filter(tag => tag !== tagToRemove);
      
      updateMediaMutation.mutate({
        id: itemId,
        type,
        data: { tags: newTags }
      });
    }
  };

  const filteredPhotos = filters.contentType === 'video' ? [] : photos;
  const filteredVideos = filters.contentType === 'photo' ? [] : videos;

  // Deletar mídia individual
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
    <div className="bg-zinc-950 h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-zinc-800 p-4 bg-zinc-900">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onBack}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-white">Gerenciar Mídias</h2>
            <p className="text-sm text-zinc-400">Organize suas fotos e vídeos</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 text-zinc-300">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                    {(filters.folder !== 'all' || filters.stage !== 'all' || filters.tags.length > 0 || filters.contentType !== 'all') && (
                      <Badge className="ml-2 bg-purple-600">
                        {[
                          filters.folder !== 'all' ? 1 : 0,
                          filters.stage !== 'all' ? 1 : 0,
                          filters.tags.length,
                          filters.contentType !== 'all' ? 1 : 0
                        ].reduce((a, b) => a + b, 0)}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-zinc-900 border-zinc-700">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-zinc-300">Tipo de Conteúdo</Label>
                      <Select value={filters.contentType} onValueChange={(value: ContentType) => 
                        setFilters(prev => ({ ...prev, contentType: value }))
                      }>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="photo">Apenas Fotos</SelectItem>
                          <SelectItem value="video">Apenas Vídeos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-zinc-300">Pasta</Label>
                      <Select value={filters.folder} onValueChange={(value) => 
                        setFilters(prev => ({ ...prev, folder: value }))
                      }>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-300">
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

                    <div>
                      <Label className="text-zinc-300">Estágio</Label>
                      <Select value={filters.stage} onValueChange={(value) => 
                        setFilters(prev => ({ ...prev, stage: value }))
                      }>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-300">
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

                    <div>
                      <Label className="text-zinc-300">Tags</Label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {allTags.map(tag => (
                          <Button
                            key={tag}
                            size="sm"
                            variant={filters.tags.includes(tag) ? "default" : "outline"}
                            onClick={() => {
                              const newTags = filters.tags.includes(tag)
                                ? filters.tags.filter(t => t !== tag)
                                : [...filters.tags, tag];
                              setFilters(prev => ({ ...prev, tags: newTags }));
                            }}
                            className={`text-xs ${
                              filters.tags.includes(tag) 
                                ? 'bg-purple-600 hover:bg-purple-700' 
                                : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                            }`}
                          >
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={() => setFilters({ folder: 'all', stage: 'all', tags: [], contentType: 'all' })}
                      variant="outline"
                      size="sm"
                      className="w-full bg-zinc-800 border-zinc-700 text-zinc-300"
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="bg-zinc-800 border-zinc-700 text-zinc-300"
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {bulkActionMode && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400">
                    {selectedItems.size} selecionados
                  </span>
                  <Button size="sm" onClick={selectAllVisibleItems} className="bg-purple-600 hover:bg-purple-700">
                    Selecionar Todos
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearSelection} className="bg-zinc-800 border-zinc-700 text-zinc-300">
                    Limpar
                  </Button>
                </div>
              )}

              <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 text-zinc-300">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Nova Pasta
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Criar Nova Pasta</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Nome da pasta"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => createFolderMutation.mutate(newFolderName)}
                        disabled={!newFolderName.trim()}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Criar
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreateFolderOpen(false)}
                        className="bg-zinc-800 border-zinc-700 text-zinc-300"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant={bulkActionMode ? "destructive" : "outline"}
                size="sm"
                onClick={() => setBulkActionMode(!bulkActionMode)}
                className={bulkActionMode ? "" : "bg-zinc-800 border-zinc-700 text-zinc-300"}
              >
                {bulkActionMode ? <X className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
                {bulkActionMode ? 'Cancelar' : 'Selecionar'}
              </Button>
            </div>
          </div>

          {/* Ações em massa */}
          {bulkActionMode && selectedItems.size > 0 && (
            <div className="flex items-center gap-2 p-3 bg-zinc-800 rounded-lg">
              <span className="text-sm text-zinc-300">Ações em massa:</span>
              
              <Select onValueChange={(value) => handleBulkAction('stage', value)}>
                <SelectTrigger className="w-40 bg-zinc-700 border-zinc-600 text-zinc-300">
                  <SelectValue placeholder="Estágio" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {stages.map(stage => (
                    <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => handleBulkAction('folder', value)}>
                <SelectTrigger className="w-40 bg-zinc-700 border-zinc-600 text-zinc-300">
                  <SelectValue placeholder="Pasta" />
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

              <Dialog open={isAddTagOpen} onOpenChange={setIsAddTagOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="bg-zinc-700 border-zinc-600 text-zinc-300">
                    <Tag className="h-4 w-4 mr-1" />
                    Tag
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Adicionar Tag</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Nome da tag"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          if (newTagName.trim()) {
                            handleBulkAction('addTag', newTagName.trim());
                            setNewTagName('');
                            setIsAddTagOpen(false);
                          }
                        }}
                        disabled={!newTagName.trim()}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Adicionar
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsAddTagOpen(false)}
                        className="bg-zinc-800 border-zinc-700 text-zinc-300"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Deletar
              </Button>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="p-4">
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

        {/* Media Grid/List */}
        <div className="p-4">
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
              ? "grid grid-cols-2 md:grid-cols-3 gap-4" 
              : "space-y-4"
            }>
              {/* Render Photos */}
              {filteredPhotos.map((photo) => (
                <Card key={`photo-${photo.id}`} className="bg-zinc-800 border-zinc-700 overflow-hidden">
                  <div className="relative group">
                    {bulkActionMode && (
                      <div className="absolute top-2 right-2 z-10">
                        <Checkbox
                          checked={selectedItems.has(`photo-${photo.id}`)}
                          onCheckedChange={() => toggleItemSelection(`photo-${photo.id}`)}
                          className="bg-zinc-700 border-zinc-600"
                        />
                      </div>
                    )}
                    
                    <img
                      src={photo.photo_url}
                      alt="Foto"
                      className={viewMode === 'grid' ? "w-full h-32 object-cover" : "w-20 h-20 object-cover rounded"}
                    />
                    
                    {!bulkActionMode && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => togglePrimary(photo.id)}
                          className="bg-zinc-700 hover:bg-zinc-600"
                        >
                          <Star className={`h-4 w-4 ${photo.is_primary ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-300'}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate({
                            id: photo.id,
                            type: 'photo',
                            url: photo.photo_url
                          })}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    {photo.is_primary && (
                      <Badge className="absolute top-2 left-2 bg-yellow-600 text-white">
                        Principal
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-3 space-y-3">
                    {/* Tags */}
                    {photo.tags && photo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {photo.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs bg-zinc-700 border-zinc-600 text-zinc-300 cursor-pointer hover:bg-red-600"
                            onClick={() => removeTagFromItem(photo.id, 'photo', tag)}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Stage and Folder */}
                    <div className="flex gap-2">
                      <Select 
                        value={photo.stage || stages[0]} 
                        onValueChange={(value) => updateMediaMutation.mutate({
                          id: photo.id,
                          type: 'photo',
                          data: { stage: value }
                        })}
                      >
                        <SelectTrigger className="text-xs bg-zinc-900 border-zinc-600 text-zinc-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          {stages.map(stage => (
                            <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select 
                        value={photo.folder_id || 'no-folder'} 
                        onValueChange={(value) => updateMediaMutation.mutate({
                          id: photo.id,
                          type: 'photo',
                          data: { folder_id: value === 'no-folder' ? null : value }
                        })}
                      >
                        <SelectTrigger className="text-xs bg-zinc-900 border-zinc-600 text-zinc-300">
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

                    {/* Visibility Controls */}
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-zinc-400">Perfil</Label>
                      <Switch
                        checked={photo.show_in_profile}
                        onCheckedChange={(checked) => updateMediaMutation.mutate({
                          id: photo.id,
                          type: 'photo',
                          data: { show_in_profile: checked }
                        })}
                        className="data-[state=checked]:bg-purple-600"
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
                        className="data-[state=checked]:bg-purple-600"
                      />
                    </div>

                    {/* Add Tag */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Adicionar tag"
                        className="text-xs bg-zinc-900 border-zinc-600 text-white"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement;
                            if (target.value.trim()) {
                              addTagToItem(photo.id, 'photo', target.value.trim());
                              target.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Render Videos */}
              {filteredVideos.map((video) => (
                <Card key={`video-${video.id}`} className="bg-zinc-800 border-zinc-700 overflow-hidden">
                  <div className="relative group">
                    {bulkActionMode && (
                      <div className="absolute top-2 right-2 z-10">
                        <Checkbox
                          checked={selectedItems.has(`video-${video.id}`)}
                          onCheckedChange={() => toggleItemSelection(`video-${video.id}`)}
                          className="bg-zinc-700 border-zinc-600"
                        />
                      </div>
                    )}
                    
                    <div className={viewMode === 'grid' ? "w-full h-32 bg-zinc-900 flex items-center justify-center" : "w-20 h-20 bg-zinc-900 flex items-center justify-center rounded"}>
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
                          onClick={() => toggleReelsFeatured(video.id, video.is_featured_in_reels)}
                          className="bg-zinc-700 hover:bg-zinc-600"
                        >
                          <Film className={`h-4 w-4 ${video.is_featured_in_reels ? 'fill-blue-400 text-blue-400' : 'text-zinc-300'}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate({
                            id: video.id,
                            type: 'video',
                            url: video.video_url
                          })}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    {video.is_featured_in_reels && (
                      <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                        Reels
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-3 space-y-3">
                    <Input
                      value={video.title || ''}
                      onChange={(e) => updateMediaMutation.mutate({
                        id: video.id,
                        type: 'video',
                        data: { title: e.target.value }
                      })}
                      placeholder="Título do vídeo"
                      className="bg-zinc-900 border-zinc-600 text-white text-sm"
                    />

                    {/* Tags */}
                    {video.tags && video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {video.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs bg-zinc-700 border-zinc-600 text-zinc-300 cursor-pointer hover:bg-red-600"
                            onClick={() => removeTagFromItem(video.id, 'video', tag)}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Stage and Folder */}
                    <div className="flex gap-2">
                      <Select 
                        value={video.stage || stages[0]} 
                        onValueChange={(value) => updateMediaMutation.mutate({
                          id: video.id,
                          type: 'video',
                          data: { stage: value }
                        })}
                      >
                        <SelectTrigger className="text-xs bg-zinc-900 border-zinc-600 text-zinc-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          {stages.map(stage => (
                            <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select 
                        value={video.folder_id || 'no-folder'} 
                        onValueChange={(value) => updateMediaMutation.mutate({
                          id: video.id,
                          type: 'video',
                          data: { folder_id: value === 'no-folder' ? null : value }
                        })}
                      >
                        <SelectTrigger className="text-xs bg-zinc-900 border-zinc-600 text-zinc-300">
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
                    
                    {/* Visibility Controls */}
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-zinc-400">Perfil</Label>
                      <Switch
                        checked={video.show_in_profile}
                        onCheckedChange={(checked) => updateMediaMutation.mutate({
                          id: video.id,
                          type: 'video',
                          data: { show_in_profile: checked }
                        })}
                        className="data-[state=checked]:bg-purple-600"
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
                        className="data-[state=checked]:bg-purple-600"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-zinc-400">Reels</Label>
                      <Switch
                        checked={video.is_featured_in_reels}
                        onCheckedChange={(checked) => toggleReelsFeatured(video.id, !checked)}
                        className="data-[state=checked]:bg-purple-600"
                      />
                    </div>

                    {/* Add Tag */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Adicionar tag"
                        className="text-xs bg-zinc-900 border-zinc-600 text-white"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement;
                            if (target.value.trim()) {
                              addTagToItem(video.id, 'video', target.value.trim());
                              target.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMediaManager;