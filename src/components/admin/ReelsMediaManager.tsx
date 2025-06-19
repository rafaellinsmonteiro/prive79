
import { useState } from 'react';
import { useReelsVideos, useToggleVideoInReels } from '@/hooks/useReelsMedia';
import { useCities } from '@/hooks/useCities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Search, Video, Star } from 'lucide-react';

const ReelsMediaManager = () => {
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const { data: cities = [] } = useCities();
  const { data: videos = [], isLoading } = useReelsVideos(selectedCityId || undefined);
  const toggleVideo = useToggleVideoInReels();

  const filteredVideos = videos.filter(video => {
    if (!searchTerm) return true;
    return (
      video.model?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleToggleVideo = (videoId: string, currentStatus: boolean) => {
    toggleVideo.mutate({
      id: videoId,
      is_featured: !currentStatus
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="text-center text-zinc-400">
            Carregando vídeos...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Gestão de Mídia para Reels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por modelo ou título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
            <Select value={selectedCityId} onValueChange={setSelectedCityId}>
              <SelectTrigger className="w-[200px] bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Filtrar por cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as cidades</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-white">
                {filteredVideos.length}
              </div>
              <div className="text-zinc-400 text-sm">Total de Vídeos</div>
            </div>
            <div className="bg-zinc-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-400">
                {filteredVideos.filter(v => v.is_featured_in_reels).length}
              </div>
              <div className="text-zinc-400 text-sm">Nos Reels</div>
            </div>
            <div className="bg-zinc-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-zinc-400">
                {filteredVideos.filter(v => !v.is_featured_in_reels).length}
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
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-white truncate">
                        {video.title || 'Sem título'}
                      </h3>
                      <p className="text-sm text-zinc-400 truncate">
                        Modelo: {video.model?.name}
                      </p>
                      {video.duration && (
                        <p className="text-xs text-zinc-500">
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

      {filteredVideos.length === 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="text-center text-zinc-400">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum vídeo encontrado.</p>
              {searchTerm && (
                <p className="text-sm mt-2">
                  Tente buscar por outros termos ou remover os filtros.
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
