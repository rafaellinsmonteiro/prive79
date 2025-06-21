
import { useState } from 'react';
import { useReelsVideos, useToggleVideoInReels } from '@/hooks/useReelsMedia';
import { useCities } from '@/hooks/useCities';
import { useAdminModels } from '@/hooks/useAdminModels';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import ReelsMediaFilters from './reels/ReelsMediaFilters';
import ReelsMediaStats from './reels/ReelsMediaStats';
import ReelsMediaList from './reels/ReelsMediaList';

interface Model {
  id: string;
  name: string;
  city_id: string;
}

const ReelsMediaManager = () => {
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyFeatured, setShowOnlyFeatured] = useState<boolean>(false);
  
  const { data: cities = [], isLoading: citiesLoading } = useCities();
  const { data: adminModels = [], isLoading: modelsLoading } = useAdminModels();
  const { data: videos = [], isLoading: videosLoading, refetch, error } = useReelsVideos(selectedCityId || undefined);
  const toggleVideo = useToggleVideoInReels();

  // Filter and map models to ensure consistent typing
  const models: Model[] = adminModels
    .filter(model => model.id && model.name && model.city_id)
    .map(model => ({
      id: model.id,
      name: model.name,
      city_id: model.city_id!
    }));

  console.log('ReelsMediaManager render:', {
    citiesCount: cities.length,
    modelsCount: models.length,
    videosCount: videos.length,
    isLoading: videosLoading,
    error: error?.message
  });

  const filteredVideos = videos.filter(video => {
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesModel = video.model?.name.toLowerCase().includes(searchLower);
      const matchesTitle = video.title?.toLowerCase().includes(searchLower);
      if (!matchesModel && !matchesTitle) return false;
    }

    // Filter by specific model
    if (selectedModelId && video.model_id !== selectedModelId) {
      return false;
    }

    // Filter by featured status
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

  const hasActiveFilters = Boolean(searchTerm || selectedCityId || selectedModelId || showOnlyFeatured);

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
          <ReelsMediaFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCityId={selectedCityId}
            setSelectedCityId={setSelectedCityId}
            selectedModelId={selectedModelId}
            setSelectedModelId={setSelectedModelId}
            showOnlyFeatured={showOnlyFeatured}
            setShowOnlyFeatured={setShowOnlyFeatured}
            cities={cities}
            models={models}
            onClearFilters={handleClearFilters}
          />
          
          <ReelsMediaStats
            total={stats.total}
            featured={stats.featured}
            available={stats.available}
          />
        </CardContent>
      </Card>

      <ReelsMediaList
        videos={filteredVideos}
        onToggleVideo={handleToggleVideo}
        isToggling={toggleVideo.isPending}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        isLoading={videosLoading}
      />
    </div>
  );
};

export default ReelsMediaManager;
