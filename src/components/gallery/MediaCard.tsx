
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, MapPin, User } from 'lucide-react';
import { GalleryMedia } from '@/hooks/useGalleryMedia';
import { Link } from 'react-router-dom';

interface MediaCardProps {
  media: GalleryMedia;
}

const MediaCard = ({ media }: MediaCardProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const mediaUrl = `/midia/${media.media_type}/${media.id}`;

  // Fallback thumbnail URL
  const fallbackThumbnail = 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=200&fit=crop';

  return (
    <Link to={mediaUrl}>
      <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group">
        <CardContent className="p-0 relative">
          <div className="relative overflow-hidden rounded-t-lg">
            {media.media_type === 'video' ? (
              <div className="relative">
                <img
                  src={imageError ? fallbackThumbnail : (media.thumbnail_url || fallbackThumbnail)}
                  alt={media.title || `Vídeo de ${media.model_name}`}
                  className="w-full h-48 object-cover"
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <Play className="h-6 w-6 text-white fill-white" />
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={imageError ? fallbackThumbnail : media.media_url}
                alt={media.title || `Mídia de ${media.model_name}`}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                onError={handleImageError}
              />
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
              <Link 
                to={`/modelo/${media.model_id}`}
                className="text-white font-medium hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {media.model_name}
              </Link>
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
    </Link>
  );
};

export default MediaCard;
