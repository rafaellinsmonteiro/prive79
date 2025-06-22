
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Play, MapPin, User } from 'lucide-react';
import { GalleryMedia } from '@/hooks/useGalleryMedia';

interface MediaCardProps {
  media: GalleryMedia;
}

const MediaCard = ({ media }: MediaCardProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const renderMedia = (isModal = false) => {
    if (media.media_type === 'video') {
      return (
        <video
          controls={isModal}
          className={`w-full ${isModal ? 'max-h-[80vh]' : 'h-48'} object-cover`}
          poster={media.thumbnail_url}
        >
          <source src={media.media_url} type="video/mp4" />
          Seu navegador não suporta vídeos.
        </video>
      );
    }

    return (
      <img
        src={imageError ? 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=200&fit=crop' : media.media_url}
        alt={media.title || `Mídia de ${media.model_name}`}
        className={`w-full ${isModal ? 'max-h-[80vh]' : 'h-48'} object-cover`}
        onError={handleImageError}
      />
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group">
          <CardContent className="p-0 relative">
            <div className="relative overflow-hidden rounded-t-lg">
              {renderMedia()}
              
              {/* Overlay para vídeos */}
              {media.media_type === 'video' && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <Play className="h-6 w-6 text-white fill-white" />
                  </div>
                </div>
              )}

              {/* Badge do tipo de mídia */}
              <Badge 
                variant={media.media_type === 'video' ? 'default' : 'secondary'}
                className="absolute top-2 right-2 bg-black/70 text-white"
              >
                {media.media_type === 'video' ? 'Vídeo' : 'Foto'}
              </Badge>
            </div>

            {/* Informações */}
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                <User className="h-4 w-4" />
                <span className="text-white font-medium">{media.model_name}</span>
              </div>
              
              {media.city_name && (
                <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{media.city_name}</span>
                </div>
              )}

              {media.title && (
                <p className="text-sm text-zinc-300 truncate">{media.title}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] bg-zinc-900 border-zinc-800">
        <div className="flex flex-col items-center">
          {renderMedia(true)}
          
          <div className="mt-4 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              {media.title || `Mídia de ${media.model_name}`}
            </h3>
            <div className="flex items-center justify-center gap-4 text-sm text-zinc-400">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{media.model_name}</span>
              </div>
              {media.city_name && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{media.city_name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaCard;
