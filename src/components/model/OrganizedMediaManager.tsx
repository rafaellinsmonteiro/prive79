import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Image, Video, Plus, Upload, Trash2, Star, Eye, Film, Settings, 
  Folder, FolderPlus, Tag, Filter, Move, Grid3X3, List, FileText,
  ChevronDown, X, Edit3, RotateCw, FlipHorizontal, FlipVertical, Save,
  CheckSquare, Square, MoreHorizontal
} from 'lucide-react';
import ReactCrop, { type Crop as ReactCropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Progress } from '@/components/ui/progress';
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
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Estados para edição de imagem
  const [isImageEditOpen, setIsImageEditOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<ReactCropType>();
  const [completedCrop, setCompletedCrop] = useState<ReactCropType>();
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [cropAspect, setCropAspect] = useState<number | undefined>(1);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);

  // Estados para upload múltiplo
  const [uploadQueue, setUploadQueue] = useState<Array<{
    id: string;
    file: File;
    type: 'photo' | 'video';
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
  }>>([]);

  // Estados para seleção múltipla
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const hiddenFileInput = useRef<HTMLInputElement>(null);
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

      const { data, error } = await query.order('display_order');
      
      if (error) {
        console.error('Error fetching photos:', error);
        throw error;
      }
      
      console.log('Photos loaded:', data?.length);
      return data || [];
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

      if (error) {
        console.error('Error fetching videos:', error);
        throw error;
      }
      
      console.log('Videos loaded:', data?.length, data);
      return data || [];
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

  // Funções para seleção múltipla
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
          // Buscar itens atuais para obter suas tags
          const photosToUpdate = items.filter(item => item.type === 'photo').map(item => item.id);
          const videosToUpdate = items.filter(item => item.type === 'video').map(item => item.id);
          
          Promise.all([
            ...(photosToUpdate.length > 0 ? [
              supabase.from('model_photos')
                .select('id, tags')
                .in('id', photosToUpdate)
                .then(({ data }) => data?.map(photo => ({
                  id: photo.id,
                  type: 'photo' as const,
                  newTags: [...(photo.tags || []), value].filter((tag, index, arr) => arr.indexOf(tag) === index)
                })) || [])
            ] : []),
            ...(videosToUpdate.length > 0 ? [
              supabase.from('model_videos')
                .select('id, tags')
                .in('id', videosToUpdate)
                .then(({ data }) => data?.map(video => ({
                  id: video.id,
                  type: 'video' as const,
                  newTags: [...(video.tags || []), value].filter((tag, index, arr) => arr.indexOf(tag) === index)
                })) || [])
            ] : [])
          ]).then(async (results) => {
            const allUpdates = results.flat();
            
            // Atualizar fotos
            const photoUpdates = allUpdates.filter(item => item.type === 'photo');
            if (photoUpdates.length > 0) {
              for (const update of photoUpdates) {
                await supabase.from('model_photos')
                  .update({ tags: update.newTags })
                  .eq('id', update.id);
              }
            }
            
            // Atualizar vídeos
            const videoUpdates = allUpdates.filter(item => item.type === 'video');
            if (videoUpdates.length > 0) {
              for (const update of videoUpdates) {
                await supabase.from('model_videos')
                  .update({ tags: update.newTags })
                  .eq('id', update.id);
              }
            }
            
            toast.success(`Tag "${value}" adicionada aos itens selecionados!`);
            refetchPhotos();
            refetchVideos();
            setSelectedItems(new Set());
            setBulkActionMode(false);
          }).catch(() => {
            toast.error('Erro ao adicionar tag');
          });
        }
        break;
    }
    setIsBulkActionsOpen(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newUploads = files.map(file => {
      const isImage = file.type.startsWith('image/') || file.type === 'image/heif' || file.type === 'image/heic';
      const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mov');

      if (!isImage && !isVideo) {
        toast.error(`Arquivo ${file.name} não é suportado. Apenas imagens (incluindo HEIF) e vídeos são aceitos.`);
        return null;
      }

      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        type: isImage ? 'photo' as const : 'video' as const,
        progress: 0,
        status: 'pending' as const
      };
    }).filter(Boolean) as Array<{
      id: string;
      file: File;
      type: 'photo' | 'video';
      progress: number;
      status: 'pending' | 'uploading' | 'completed' | 'error';
    }>;

    if (newUploads.length === 0) return;

    setUploadQueue(prev => [...prev, ...newUploads]);
    
    // Processar uploads um por vez
    processUploadQueue(newUploads);
  };

  const processUploadQueue = async (uploads: typeof uploadQueue) => {
    for (const upload of uploads) {
      await processIndividualUpload(upload);
    }
  };

  const processIndividualUpload = async (upload: typeof uploadQueue[0]) => {
    try {
      // Atualizar status para uploading
      setUploadQueue(prev => prev.map(item => 
        item.id === upload.id 
          ? { ...item, status: 'uploading' }
          : item
      ));

      const bucketName = upload.type === 'photo' ? 'model-photos' : 'model-videos';
      const fileName = `${modelId}/${Date.now()}-${upload.file.name}`;
      
      // Simular progresso durante upload
      const progressInterval = setInterval(() => {
        setUploadQueue(prev => prev.map(item => 
          item.id === upload.id && item.progress < 70
            ? { ...item, progress: item.progress + 10 }
            : item
        ));
      }, 200);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, upload.file);

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      // Atualizar progresso para 80%
      setUploadQueue(prev => prev.map(item => 
        item.id === upload.id 
          ? { ...item, progress: 80 }
          : item
      ));

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      let finalUrl = publicUrl;
      let thumbnailUrl = null;

      // Processar arquivos especiais
      const isHeic = upload.file.type === 'image/heif' || upload.file.type === 'image/heic' || 
                     upload.file.name.toLowerCase().endsWith('.heic') || upload.file.name.toLowerCase().endsWith('.heif');
      
      const isVideo = upload.type === 'video';

      if (isHeic) {
        try {
          const { data: convertResult } = await supabase.functions.invoke('media-converter', {
            body: {
              action: 'convert-heic',
              fileUrl: publicUrl,
              fileName: upload.file.name,
              modelId: modelId
            }
          });

          if (convertResult?.success && convertResult?.convertedUrl) {
            finalUrl = convertResult.convertedUrl;
            // Forçar o tipo para photo quando é HEIC convertido
            upload.type = 'photo';
            toast.success(`HEIC convertido: ${upload.file.name}`);
          } else {
            throw new Error('Conversão HEIC falhou');
          }
        } catch (error) {
          console.error('Error converting HEIC:', error);
          toast.error(`Erro ao converter HEIC: ${upload.file.name}`);
        }
      }

      if (isVideo) {
        try {
          const { data: thumbnailResult } = await supabase.functions.invoke('media-converter', {
            body: {
              action: 'generate-thumbnail',
              fileUrl: publicUrl,
              fileName: upload.file.name,
              modelId: modelId
            }
          });

          if (thumbnailResult?.success && thumbnailResult?.thumbnailUrl) {
            thumbnailUrl = thumbnailResult.thumbnailUrl;
            toast.success(`Thumbnail gerada para: ${upload.file.name}`);
          }
        } catch (error) {
          console.error('Error generating thumbnail:', error);
          console.log('Continuando sem thumbnail...');
          // Não bloquear o upload se falhar a geração do thumbnail
        }
      }

      // Atualizar progresso para 90%
      setUploadQueue(prev => prev.map(item => 
        item.id === upload.id 
          ? { ...item, progress: 90 }
          : item
      ));

      const baseData = {
        model_id: modelId,
        display_order: (upload.type === 'photo' ? photos : videos).length,
        stage: stages[0] || 'Organizar',
        tags: [],
        folder_id: filters.folder !== 'all' && filters.folder !== 'no-folder' ? filters.folder : null,
        created_by_user_id: (await supabase.auth.getUser()).data.user?.id
      };

      if (upload.type === 'photo') {
        const { error: dbError } = await supabase
          .from('model_photos')
          .insert({
            ...baseData,
            photo_url: finalUrl,
            is_primary: photos.length === 0
          });
        if (dbError) throw dbError;
        // Forçar refetch das fotos para mostrar imagens convertidas
        await refetchPhotos();
      } else {
        const { error: dbError } = await supabase
          .from('model_videos')
          .insert({
            ...baseData,
            video_url: finalUrl,
            thumbnail_url: thumbnailUrl,
            title: upload.file.name.split('.')[0]
          });
        if (dbError) throw dbError;
        // Forçar refetch dos vídeos para mostrar thumbnails
        await refetchVideos();
      }

      // Marcar como completo
      setUploadQueue(prev => prev.map(item => 
        item.id === upload.id 
          ? { ...item, status: 'completed', progress: 100 }
          : item
      ));

      // Invalidar cache das queries para forçar atualização
      queryClient.invalidateQueries({ queryKey: ['model-photos', modelId] });
      queryClient.invalidateQueries({ queryKey: ['model-videos', modelId] });

      toast.success(`${upload.file.name} enviado com sucesso!`);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadQueue(prev => prev.map(item => 
        item.id === upload.id 
          ? { ...item, status: 'error', error: 'Erro no upload' }
          : item
      ));
      toast.error(`Erro ao enviar ${upload.file.name}`);
    }
  };

  const clearCompletedUploads = () => {
    setUploadQueue(prev => prev.filter(item => item.status !== 'completed'));
  };

  const removeUpload = (id: string) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id));
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

  // Funções de edição de imagem
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setIsImageEditOpen(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        cropAspect || 1,
        width,
        height
      ),
      width,
      height
    );
    setCrop(newCrop);
  }, [cropAspect]);

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: ReactCropType, rotation: number, flipH: boolean, flipV: boolean): Promise<Blob> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Calcular dimensões do canvas considerando rotação
      const rotRad = (rotation * Math.PI) / 180;
      const sin = Math.abs(Math.sin(rotRad));
      const cos = Math.abs(Math.cos(rotRad));
      
      const cropWidth = crop.width * scaleX;
      const cropHeight = crop.height * scaleY;
      
      canvas.width = cropWidth * cos + cropHeight * sin;
      canvas.height = cropWidth * sin + cropHeight * cos;

      // Centralizar e aplicar transformações
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rotRad);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        cropWidth,
        cropHeight,
        -cropWidth / 2,
        -cropHeight / 2,
        cropWidth,
        cropHeight
      );

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            throw new Error('Canvas is empty');
          }
          resolve(blob);
        }, 'image/jpeg', 0.9);
      });
    },
    []
  );

  const resetImageEdit = () => {
    setImageSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setCropAspect(1);
    setIsImageEditOpen(false);
  };

  const handleSaveEditedImage = async () => {
    if (!completedCrop || !imgRef.current || !selectedItem) {
      toast.error('Erro ao processar a imagem');
      return;
    }

    setIsUpdatingPhoto(true);
    
    try {
      // Gerar imagem editada
      const croppedBlob = await getCroppedImg(
        imgRef.current, 
        completedCrop, 
        rotation, 
        flipHorizontal, 
        flipVertical
      );
      
      // Upload da nova imagem
      const fileName = `${modelId}/${Date.now()}-edited.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('model-photos')
        .upload(fileName, croppedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('model-photos')
        .getPublicUrl(fileName);

      // Atualizar no banco de dados
      updateMediaMutation.mutate({
        id: selectedItem.id,
        type: 'photo',
        data: { photo_url: publicUrl }
      });

      // Atualizar estado local
      setSelectedItem({...selectedItem, photo_url: publicUrl});
      
      resetImageEdit();
      toast.success('Imagem atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Erro ao atualizar a imagem');
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  const startImageEdit = () => {
    if (selectedItem?.type === 'photo') {
      setImageSrc(selectedItem.photo_url);
      setIsImageEditOpen(true);
    }
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
              {/* Botão Selecionar */}
              <Button
                variant={bulkActionMode ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => {
                  setBulkActionMode(!bulkActionMode);
                  if (bulkActionMode) {
                    clearSelection();
                  }
                }}
                className="flex items-center gap-2"
              >
                {bulkActionMode ? (
                  <>
                    <X className="h-4 w-4" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4" />
                    Selecionar
                  </>
                )}
              </Button>

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
            accept="image/*,image/heif,image/heic,video/*,.mov"
            onChange={handleFileUpload}
            className="hidden"
            multiple
          />
        </CardContent>
      </Card>

      {/* Fila de Upload */}
      {uploadQueue.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload de Arquivos ({uploadQueue.filter(u => u.status === 'completed').length}/{uploadQueue.length})
              </CardTitle>
              {uploadQueue.some(u => u.status === 'completed') && (
                <Button variant="outline" size="sm" onClick={clearCompletedUploads}>
                  Limpar Concluídos
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {uploadQueue.map((upload) => (
              <div key={upload.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {upload.type === 'photo' ? (
                      <Image className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Video className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium truncate max-w-64">
                      {upload.file.name}
                    </span>
                    <Badge 
                      variant={
                        upload.status === 'completed' ? 'default' :
                        upload.status === 'error' ? 'destructive' :
                        upload.status === 'uploading' ? 'secondary' : 'outline'
                      }
                      className="text-xs"
                    >
                      {upload.status === 'pending' && 'Pendente'}
                      {upload.status === 'uploading' && 'Enviando'}
                      {upload.status === 'completed' && 'Concluído'}
                      {upload.status === 'error' && 'Erro'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {upload.progress}%
                    </span>
                    {upload.status !== 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUpload(upload.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <Progress value={upload.progress} className="h-2" />
                {upload.error && (
                  <p className="text-xs text-destructive">{upload.error}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Barra de Ações em Massa */}
      {selectedItems.size > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedItems.size} {selectedItems.size === 1 ? 'item selecionado' : 'itens selecionados'}
                </span>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <DropdownMenu open={isBulkActionsOpen} onOpenChange={setIsBulkActionsOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4 mr-2" />
                      Ações
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {/* Alterar Etapa */}
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Etapa</div>
                    {stages.map(stage => (
                      <DropdownMenuItem key={stage} onClick={() => handleBulkAction('stage', stage)}>
                        <Move className="h-4 w-4 mr-2" />
                        {stage}
                      </DropdownMenuItem>
                    ))}
                    
                    <DropdownMenuSeparator />
                    
                    {/* Alterar Pasta */}
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Pasta</div>
                    <DropdownMenuItem onClick={() => handleBulkAction('folder', 'no-folder')}>
                      <Folder className="h-4 w-4 mr-2" />
                      Sem pasta
                    </DropdownMenuItem>
                    {folders.map(folder => (
                      <DropdownMenuItem key={folder.id} onClick={() => handleBulkAction('folder', folder.id)}>
                        <Folder className="h-4 w-4 mr-2" />
                        {folder.name}
                      </DropdownMenuItem>
                    ))}
                    
                    <DropdownMenuSeparator />
                    
                    {/* Adicionar Tag */}
                    <DropdownMenuItem 
                      onClick={() => {
                        const tag = prompt('Digite a tag para adicionar:');
                        if (tag) handleBulkAction('addTag', tag);
                      }}
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      Adicionar Tag
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Excluir */}
                    <DropdownMenuItem 
                      onClick={() => handleBulkAction('delete')}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir Selecionados
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" 
              : "space-y-4"
            }>
              {content.map((item) => {
                const itemKey = `${item.type}-${item.id}`;
                const isSelected = selectedItems.has(itemKey);
                
                return (
                <Card key={item.id} className={`border-border bg-card overflow-hidden transition-all relative ${
                  viewMode === 'list' ? 'flex' : ''
                } ${isSelected ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-primary/20 cursor-pointer'}`}>
                  
                  {/* Checkbox para seleção múltipla */}
                  {bulkActionMode && (
                    <div className="absolute top-2 left-2 z-10">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleItemSelection(itemKey)}
                        className="bg-background border-2"
                      />
                    </div>
                  )}
                  
                  <div 
                    onClick={() => {
                      if (bulkActionMode) {
                        toggleItemSelection(itemKey);
                      } else {
                        setSelectedItem(item);
                        setIsDetailsOpen(true);
                      }
                    }}
                    className="w-full h-full cursor-pointer"
                  >
                  {viewMode === 'grid' ? (
                    // Visualização em Grade - Foco na imagem/thumbnail
                    <div className="aspect-square relative group">
                      {item.type === 'photo' ? (
                        <img
                          src={item.photo_url}
                          alt="Foto"
                          className="w-full h-full object-cover"
                        />
                       ) : (
                         <div className="w-full h-full bg-muted flex items-center justify-center relative">
                           {item.thumbnail_url ? (
                             <>
                               <img
                                 src={item.thumbnail_url}
                                 alt="Thumbnail"
                                 className="w-full h-full object-cover"
                               />
                               {/* Play icon overlay */}
                               <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="bg-black/60 rounded-full p-3">
                                   <Film className="h-8 w-8 text-white" />
                                 </div>
                               </div>
                             </>
                           ) : (
                             <div className="flex flex-col items-center gap-2">
                               <Video className="h-12 w-12 text-muted-foreground" />
                               <span className="text-xs text-muted-foreground text-center px-2">
                                 {item.video_url?.includes('.mov') ? 'MOV' : 'VIDEO'}
                               </span>
                             </div>
                           )}
                         </div>
                       )}
                      
                      {/* Overlay com informações essenciais */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {item.type === 'photo' && item.is_primary && (
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              )}
                              <Badge variant="secondary" className="text-xs">
                                {item.stage}
                              </Badge>
                            </div>
                            {item.type === 'photo' ? (
                              <Image className="h-4 w-4 text-white" />
                            ) : (
                              <Video className="h-4 w-4 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Visualização em Lista - Layout horizontal
                    <>
                      <div className="w-32 h-24 flex-shrink-0 relative">
                        {item.type === 'photo' ? (
                          <img
                            src={item.photo_url}
                            alt="Foto"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                           <div className="w-full h-full bg-muted flex items-center justify-center relative">
                             {item.thumbnail_url ? (
                               <>
                                 <img
                                   src={item.thumbnail_url}
                                   alt="Thumbnail"
                                   className="w-full h-full object-cover"
                                 />
                                 {/* Play icon overlay */}
                                 <div className="absolute inset-0 flex items-center justify-center">
                                   <div className="bg-black/60 rounded-full p-1">
                                     <Film className="h-4 w-4 text-white" />
                                   </div>
                                 </div>
                               </>
                             ) : (
                               <div className="flex flex-col items-center gap-1">
                                 <Video className="h-6 w-6 text-muted-foreground" />
                                 <span className="text-xs text-muted-foreground">
                                   {item.video_url?.includes('.mov') ? 'MOV' : 'VIDEO'}
                                 </span>
                               </div>
                             )}
                           </div>
                         )}
                        
                        {item.type === 'photo' && item.is_primary && (
                          <Badge className="absolute top-1 left-1 bg-yellow-600 text-white text-xs">
                            Principal
                          </Badge>
                        )}
                      </div>
                      
                      <CardContent className="p-3 flex-1 flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                          <div>
                            <h3 className="font-medium text-sm">
                              {item.type === 'video' ? (item.title || 'Vídeo sem título') : 'Foto'}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {item.stage}
                              </Badge>
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {item.tags.slice(0, 2).map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {item.tags.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{item.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Clique para editar</span>
                            <Edit3 className="h-3 w-3" />
                          </div>
                        </div>
                       </CardContent>
                     </>
                   )}
                   </div>
                 </Card>
                 );
               })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Modal de Detalhes do Item */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle>
               {selectedItem?.type === 'video' ? 'Detalhes do Vídeo' : 'Detalhes da Foto'}
             </DialogTitle>
           </DialogHeader>
          
          {selectedItem && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preview do conteúdo */}
              <div className="space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                  {selectedItem.type === 'photo' ? (
                    <img
                      src={selectedItem.photo_url}
                      alt="Foto"
                      className="w-full h-full object-contain"
                    />
                   ) : (
                     <div className="w-full h-full bg-muted flex items-center justify-center relative">
                       {selectedItem.thumbnail_url ? (
                         <>
                           <img
                             src={selectedItem.thumbnail_url}
                             alt="Thumbnail"
                             className="w-full h-full object-contain"
                           />
                           {/* Overlay com informações do vídeo */}
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                             <div className="absolute bottom-4 left-4 right-4">
                               <div className="flex items-center justify-between text-white">
                                 <span className="text-sm">{selectedItem.title || 'Vídeo'}</span>
                                 <div className="flex items-center gap-2">
                                   <Film className="h-4 w-4" />
                                   {selectedItem.video_url?.includes('.mov') && (
                                     <Badge variant="secondary" className="text-xs">MOV</Badge>
                                   )}
                                 </div>
                               </div>
                             </div>
                           </div>
                           {/* Play button */}
                           <div className="absolute inset-0 flex items-center justify-center">
                             <div className="bg-black/60 rounded-full p-4 hover:bg-black/80 transition-colors cursor-pointer">
                               <Film className="h-12 w-12 text-white" />
                             </div>
                           </div>
                         </>
                       ) : (
                         <div className="flex flex-col items-center gap-4">
                           <Video className="h-24 w-24 text-muted-foreground" />
                           <div className="text-center">
                             <p className="text-sm font-medium">{selectedItem.title || 'Vídeo'}</p>
                             {selectedItem.video_url?.includes('.mov') && (
                               <Badge variant="outline" className="mt-2">Formato MOV</Badge>
                             )}
                           </div>
                         </div>
                       )}
                     </div>
                   )}
                   
                   {selectedItem.type === 'photo' && selectedItem.is_primary && (
                     <Badge className="absolute top-2 left-2 bg-yellow-600 text-white">
                       Principal
                     </Badge>
                   )}
                 </div>
                 
                 {/* Botão de Edição de Imagem */}
                 {selectedItem.type === 'photo' && (
                   <div className="flex justify-center">
                     <Button
                       variant="outline"
                       onClick={startImageEdit}
                       className="w-full"
                     >
                       <Edit3 className="h-4 w-4 mr-2" />
                       Editar Imagem
                     </Button>
                   </div>
                 )}
                 
                 {selectedItem.type === 'photo' && (
                   <div className="flex justify-center">
                     <Button
                       variant={selectedItem.is_primary ? "default" : "outline"}
                       onClick={() => togglePrimary(selectedItem.id)}
                     >
                       <Star className={`h-4 w-4 mr-2 ${selectedItem.is_primary ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                       {selectedItem.is_primary ? 'Foto Principal' : 'Definir como Principal'}
                     </Button>
                   </div>
                 )}
              </div>
              
              {/* Configurações e ajustes */}
              <div className="space-y-6">
                 {selectedItem.type === 'video' && (
                   <div>
                     <Label className="text-sm font-medium mb-2 block text-foreground">Título do Vídeo</Label>
                     <Input
                       value={selectedItem.title || ''}
                       onChange={(e) => {
                        updateMediaMutation.mutate({
                          id: selectedItem.id,
                          type: 'video',
                          data: { title: e.target.value }
                        });
                        setSelectedItem({...selectedItem, title: e.target.value});
                       }}
                       placeholder="Título do vídeo"
                     />
                  </div>
                )}

                {/* Etapa */}
                 <div>
                   <Label className="text-sm font-medium mb-2 block text-foreground">Etapa</Label>
                  <Select 
                    value={selectedItem.stage || stages[0]} 
                    onValueChange={(stage) => {
                      updateStage(selectedItem.id, selectedItem.type, stage);
                      setSelectedItem({...selectedItem, stage});
                    }}
                   >
                     <SelectTrigger>
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
                   <Label className="text-sm font-medium mb-2 block text-foreground">Pasta</Label>
                  <Select 
                    value={selectedItem.folder_id || 'no-folder'} 
                    onValueChange={(folderId) => {
                      const newFolderId = folderId === 'no-folder' ? null : folderId;
                      updateFolder(selectedItem.id, selectedItem.type, newFolderId);
                      setSelectedItem({...selectedItem, folder_id: newFolderId});
                    }}
                   >
                     <SelectTrigger>
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
                   <Label className="text-sm font-medium mb-2 block text-foreground">Tags</Label>
                  <div className="flex flex-wrap gap-1 mb-2">
                     {(selectedItem.tags || []).map(tag => (
                       <Badge key={tag} variant="outline" className="flex items-center gap-1">
                        {tag}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                          onClick={() => {
                            removeTagFromMedia(selectedItem.id, selectedItem.type, selectedItem.tags || [], tag);
                            setSelectedItem({
                              ...selectedItem, 
                              tags: (selectedItem.tags || []).filter(t => t !== tag)
                            });
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                     <Input 
                       placeholder="Nova tag"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          const newTag = input.value.trim();
                          if (newTag && !(selectedItem.tags || []).includes(newTag)) {
                            addTagToMedia(selectedItem.id, selectedItem.type, selectedItem.tags || [], newTag);
                            setSelectedItem({
                              ...selectedItem, 
                              tags: [...(selectedItem.tags || []), newTag]
                            });
                            input.value = '';
                          }
                        }
                      }}
                    />
                     <Button
                       variant="outline"
                       onClick={(e) => {
                        const input = (e.target as HTMLElement).closest('.flex')?.querySelector('input') as HTMLInputElement;
                        const newTag = input?.value.trim();
                        if (newTag && !(selectedItem.tags || []).includes(newTag)) {
                          addTagToMedia(selectedItem.id, selectedItem.type, selectedItem.tags || [], newTag);
                          setSelectedItem({
                            ...selectedItem, 
                            tags: [...(selectedItem.tags || []), newTag]
                          });
                          input.value = '';
                        }
                      }}
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Opções de Visibilidade */}
                 <div>
                   <Label className="text-sm font-medium mb-2 block text-foreground">Visibilidade</Label>
                   <div className="space-y-3">
                     <div className="flex items-center justify-between p-2 rounded border bg-muted/50">
                       <div className="flex items-center space-x-2">
                         <Eye className="h-4 w-4 text-muted-foreground" />
                         <Label className="text-sm text-foreground">Mostrar no Perfil</Label>
                      </div>
                      <Switch
                        checked={selectedItem.show_in_profile}
                        onCheckedChange={(checked) => {
                          updateMediaMutation.mutate({
                            id: selectedItem.id,
                            type: selectedItem.type,
                            data: { show_in_profile: checked }
                          });
                          setSelectedItem({...selectedItem, show_in_profile: checked});
                        }}
                      />
                    </div>
                     
                     <div className="flex items-center justify-between p-2 rounded border bg-muted/50">
                       <div className="flex items-center space-x-2">
                         <Image className="h-4 w-4 text-muted-foreground" />
                         <Label className="text-sm text-foreground">Mostrar na Galeria</Label>
                       </div>
                      <Switch
                        checked={selectedItem.show_in_gallery}
                        onCheckedChange={(checked) => {
                          updateMediaMutation.mutate({
                            id: selectedItem.id,
                            type: selectedItem.type,
                            data: { show_in_gallery: checked }
                          });
                          setSelectedItem({...selectedItem, show_in_gallery: checked});
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="pt-4 border-t flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deleteMutation.mutate({
                        id: selectedItem.id,
                        type: selectedItem.type,
                        url: selectedItem.type === 'photo' ? selectedItem.photo_url : selectedItem.video_url
                      });
                      setIsDetailsOpen(false);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Deletar
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailsOpen(false)}
                    className="ml-auto"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          )}
         </DialogContent>
       </Dialog>

       {/* Modal de Edição de Imagem */}
       <Dialog open={isImageEditOpen} onOpenChange={setIsImageEditOpen}>
         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle>Editar Imagem</DialogTitle>
           </DialogHeader>
           
           <div className="space-y-6">
             {imageSrc && (
               <>
                 {/* Controles de Edição */}
                 <div className="flex flex-wrap gap-4 items-center justify-center border-b pb-4">
                   {/* Aspecto do Corte */}
                   <div className="flex items-center gap-2">
                     <Label className="text-sm font-medium">Aspecto:</Label>
                     <Select
                       value={cropAspect?.toString() || 'free'}
                       onValueChange={(value) => {
                         const aspect = value === 'free' ? undefined : parseFloat(value);
                         setCropAspect(aspect);
                       }}
                     >
                       <SelectTrigger className="w-32">
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="free">Livre</SelectItem>
                         <SelectItem value="1">1:1 (Quadrado)</SelectItem>
                         <SelectItem value="1.7777777778">16:9 (Paisagem)</SelectItem>
                         <SelectItem value="0.5625">9:16 (Retrato)</SelectItem>
                         <SelectItem value="1.3333333333">4:3</SelectItem>
                         <SelectItem value="0.75">3:4</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>

                   {/* Rotação */}
                   <div className="flex items-center gap-2">
                     <Label className="text-sm font-medium">Rotação:</Label>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setRotation(prev => (prev + 90) % 360)}
                     >
                       <RotateCw className="h-4 w-4 mr-1" />
                       90°
                     </Button>
                     <span className="text-sm text-muted-foreground">{rotation}°</span>
                   </div>

                   {/* Espelhar */}
                   <div className="flex items-center gap-2">
                     <Label className="text-sm font-medium">Espelhar:</Label>
                     <Button
                       variant={flipHorizontal ? "default" : "outline"}
                       size="sm"
                       onClick={() => setFlipHorizontal(prev => !prev)}
                     >
                       <FlipHorizontal className="h-4 w-4 mr-1" />
                       H
                     </Button>
                     <Button
                       variant={flipVertical ? "default" : "outline"}
                       size="sm"
                       onClick={() => setFlipVertical(prev => !prev)}
                     >
                       <FlipVertical className="h-4 w-4 mr-1" />
                       V
                     </Button>
                   </div>
                 </div>

                 {/* Área de Corte */}
                 <div className="flex justify-center">
                   <div className="relative" style={{ transform: `rotate(${rotation}deg) scaleX(${flipHorizontal ? -1 : 1}) scaleY(${flipVertical ? -1 : 1})` }}>
                     <ReactCrop
                       crop={crop}
                       onChange={(_, percentCrop) => setCrop(percentCrop)}
                       onComplete={(c) => setCompletedCrop(c)}
                       aspect={cropAspect}
                       minWidth={50}
                       minHeight={50}
                     >
                       <img
                         ref={imgRef}
                         alt="Editar imagem"
                         src={imageSrc}
                         style={{ maxHeight: '400px', maxWidth: '100%' }}
                         onLoad={onImageLoad}
                       />
                     </ReactCrop>
                   </div>
                 </div>

                 {/* Ações */}
                 <div className="flex justify-end gap-2 pt-4 border-t">
                   <Button
                     variant="outline"
                     onClick={resetImageEdit}
                     disabled={isUpdatingPhoto}
                   >
                     <X className="h-4 w-4 mr-2" />
                     Cancelar
                   </Button>
                   <Button
                     onClick={handleSaveEditedImage}
                     disabled={!completedCrop || isUpdatingPhoto}
                   >
                     {isUpdatingPhoto ? (
                       <>Salvando...</>
                     ) : (
                       <>
                         <Save className="h-4 w-4 mr-2" />
                         Salvar Alterações
                       </>
                     )}
                   </Button>
                 </div>
               </>
             )}
           </div>
         </DialogContent>
       </Dialog>

       {/* Input de arquivo oculto para edição */}
       <input
         ref={hiddenFileInput}
         type="file"
         accept="image/*,image/heif,image/heic"
         onChange={onSelectFile}
         className="hidden"
       />
     </div>
   );
 };
 
 export default OrganizedMediaManager;