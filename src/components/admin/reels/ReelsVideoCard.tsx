
import { Video, User, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

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

interface ReelsVideoCardProps {
  video: ReelsVideo;
  onToggle: (videoId: string, currentStatus: boolean) => void;
  isToggling: boolean;
}

const ReelsVideoCard = ({ video, onToggle, isToggling }: ReelsVideoCardProps) => {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
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

          {/* Information */}
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

            {/* Controls */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">
                  {video.is_featured_in_reels ? 'Remover dos reels' : 'Adicionar aos reels'}
                </span>
              </div>
              <Switch
                checked={video.is_featured_in_reels}
                onCheckedChange={() => onToggle(video.id, video.is_featured_in_reels)}
                disabled={isToggling}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReelsVideoCard;
