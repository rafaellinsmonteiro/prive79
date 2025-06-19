
import { Video } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReelsVideoCard from './ReelsVideoCard';

interface ReelsVideo {
  id: string;
  model_id: string;
  video_url: string;
  thumbnail_url: string | null;
  title: string | null;
  duration: number | null;
  is_featured_in_reels: boolean;
  display_order: number | null;
  created_at: string;
  model?: {
    name: string;
    city_id: string;
  };
}

interface ReelsMediaListProps {
  videos: ReelsVideo[];
  onToggleVideo: (videoId: string, currentStatus: boolean) => void;
  isToggling: boolean;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  isLoading: boolean;
}

const ReelsMediaList = ({ 
  videos, 
  onToggleVideo, 
  isToggling, 
  onClearFilters, 
  hasActiveFilters,
  isLoading 
}: ReelsMediaListProps) => {
  if (videos.length === 0 && !isLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="text-center text-zinc-400">
            <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum vídeo encontrado.</p>
            {hasActiveFilters ? (
              <div className="mt-4">
                <p className="text-sm mb-2">
                  Tente ajustar os filtros ou buscar por outros termos.
                </p>
                <Button variant="outline" size="sm" onClick={onClearFilters}>
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
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {videos.map((video) => (
        <ReelsVideoCard
          key={video.id}
          video={video}
          onToggle={onToggleVideo}
          isToggling={isToggling}
        />
      ))}
    </div>
  );
};

export default ReelsMediaList;
