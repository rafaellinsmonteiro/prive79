import { useState } from 'react';
import { useReelsVideos, useToggleVideoInReels } from '@/hooks/useReelsMedia';
import { useCities } from '@/hooks/useCities';
import { useAdminModels } from '@/hooks/useAdminModels';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Search, Video, Star, User, RefreshCw, Filter, AlertCircle } from 'lucide-react';

const ReelsMediaManager = () => {
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);
  
  const { data: cities = [], isLoading: citiesLoading } = useCities();
  const { data: models = [], isLoading: modelsLoading } = useAdminModels();
  const { data: videos = [], isLoading: videosLoading, refetch, error } = useReelsVideos(selectedCityId || undefined);
  const toggleVideo = useToggleVideoInReels();

  console.log('ReelsMediaManager render:', {
    citiesCount: cities.length,
    modelsCount: models.length,
    videosCount: videos.length,
    isLoading: videosLoading,
    error: error?.message
  });

  // More comprehensive filtering to prevent Select.Item errors
  const validCities = cities.filter(city => {
    const isValid = city.id && typeof city.id === 'string' && city.id.trim() !== '' && 
                   city.name && typeof city.name === 'string' && city.name.trim() !== '';
    if (!isValid) {
      console.warn('ReelsMediaManager: Filtering invalid city', city);
    }
    return isValid;
  });

  const validModels = models.filter(model => {
    const isValid = model.id && typeof model.id === 'string' && model.id.trim() !== '' && 
                   model.name && typeof model.name === 'string' && model.name.trim() !== '';
    if (!isValid) {
      console.warn('ReelsMediaManager: Filtering invalid model', model);
    }
    return isValid;
  });

  // Filtrar modelos baseado na cidade selecionada
  const filteredModels = selectedCityId 
    ? validModels.filter(model => model.city_id === selectedCityId)
    : validModels;

  const filteredVideos = videos.filter(video => {
    // Filtro por termo de busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesModel = video.model?.name.toLowerCase().includes(searchLower);
      const matchesTitle = video.title?.toLowerCase().includes(searchLower);
      if (!matchesModel && !matchesTitle) return false;
    }

    // Filtro por modelo específico
    if (selectedModelId && video.model_id !== selectedModelId) {
      return false;
    }

    // Filtro por status featured
    if (showOnlyFeatured && !video.is_featured_in_reels) {
      return false;
    }

    return true;
  });

  const handleToggleVideo = (videoId: string, currentStatus: boolean) => {
    console.log('Toggling video:', videoId, 'current status:', currentStatus);
    toggleVideo.mutate({
      id: videoId,
      is_featured: !currentStatus
    });
  };

  const handleClearFilters = () => {
    setSelectedCityId('');
    setSelectedModelId('');
    setSearchTerm('');
    setShowOnlyFeatured(false);
  };

  const stats = {
    total: filteredVideos.length,
    featured: filteredVideos.filter(v => v.is_featured_in_reels).length,
    available: filteredVideos.filter(v => !v.is_featured_in_reels).length,
  };

  // Loading state
  if (videosLoading || citiesLoading || modelsLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="text-center text-zinc-400 space-y-2">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin" />
            <p>Carregando dados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="text-center text-red-400 space-y-2">
            <AlertCircle className="h-8 w-8 mx-auto" />
            <p>Erro ao carregar dados</p>
            <p className="text-sm text-zinc-400">{error.message}</p>
            <Button variant="outline" onClick={() => refetch()}>
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Gestão de Mídia para Reels</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={videosLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
              <Input
                placeholder="Buscar por modelo ou título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            {/* Filtro por cidade */}
            <Select value={selectedCityId} onValueChange={setSelectedCityId}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Filtrar por cidade" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="">Todas as cidades</SelectItem>
                {validCities.map((city) => {
                  console.log('Rendering city SelectItem:', city.id, city.name);
                  return (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Filtro por modelo */}
            <Select value={selectedModelId} onValueChange={setSelectedModelId}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Filtrar por modelo" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="">Todas as modelos</SelectItem>
                {filteredModels.map((model) => {
                  console.log('Rendering model SelectItem:', model.id, model.name);
                  return (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Botões de ação */}
            <div className="flex gap-2">
              <Button
                variant={showOnlyFeatured ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOnlyFeatured(!showOnlyFeatured)}
                className="flex-1"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showOnlyFeatured ? 'Todos' : 'Só Reels'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
              >
                Limpar
              </Button>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-white">
                {stats.total}
              </div>
              <div className="text-zinc-400 text-sm">Total de Vídeos</div>
            </div>
            <div className="bg-zinc-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-400">
                {stats.featured}
              </div>
              <div className="text-zinc-400 text-sm">Nos Reels</div>
            </div>
            <div className="bg-zinc-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-zinc-400">
                {stats.available}
              </div>
              <div className="text-zinc-400 text-sm">Disponíveis</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Vídeos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-24 h-24 bg-zinc-800 rounded-lg overflow-hidden">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="h-8 w-8 text-zinc-400" />
                    </div>
                  )}
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-white truncate">
                        {video.title || 'Sem título'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                        <User className="h-3 w-3" />
                        <span className="truncate">{video.model?.name}</span>
                      </div>
                      {video.duration && (
                        <p className="text-xs text-zinc-500 mt-1">
                          Duração: {Math.round(video.duration)}s
                        </p>
                      )}
                    </div>

                    {/* Status Badge */}
                    <Badge
                      variant={video.is_featured_in_reels ? "default" : "secondary"}
                      className={video.is_featured_in_reels ? "bg-green-600" : ""}
                    >
                      {video.is_featured_in_reels ? (
                        <>
                          <Star className="h-3 w-3 mr-1" />
                          Nos Reels
                        </>
                      ) : (
                        'Disponível'
                      )}
                    </Badge>
                  </div>

                  {/* Controles */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-400">
                        {video.is_featured_in_reels ? 'Remover dos reels' : 'Adicionar aos reels'}
                      </span>
                    </div>
                    <Switch
                      checked={video.is_featured_in_reels}
                      onCheckedChange={() => handleToggleVideo(video.id, video.is_featured_in_reels)}
                      disabled={toggleVideo.isPending}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVideos.length === 0 && !videosLoading && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="text-center text-zinc-400">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum vídeo encontrado.</p>
              {(searchTerm || selectedCityId || selectedModelId || showOnlyFeatured) ? (
                <div className="mt-4">
                  <p className="text-sm mb-2">
                    Tente ajustar os filtros ou buscar por outros termos.
                  </p>
                  <Button variant="outline" size="sm" onClick={handleClearFilters}>
                    Limpar Filtros
                  </Button>
                </div>
              ) : (
                <p className="text-sm mt-2">
                  Adicione vídeos às modelos para começar a gerenciar os reels.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReelsMediaManager;
