import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Star, MapPin, Calendar, Heart, Share2 } from 'lucide-react';
import { useCreateConversation } from '@/hooks/useChat';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ModelProfileProps {
  model: {
    id: string;
    name: string;
    age?: number;
    location?: string;
    rating?: number;
    price?: number;
    description?: string;
    photos?: Array<{
      id: string;
      photo_url: string;
      is_primary: boolean;
    }>;
    is_online?: boolean;
    categories?: Array<{
      id: string;
      name: string;
    }>;
  };
  onBooking?: (model: any) => void;
}

export const ModelProfile: React.FC<ModelProfileProps> = ({ model, onBooking }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createConversation = useCreateConversation();

  const handleChat = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const conversation = await createConversation.mutateAsync(model.id);
      navigate(`/v2/chat?conversation=${conversation.id}`);
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      // Fallback: navegar para chat geral
      navigate('/v2/chat');
    }
  };

  const getPrimaryPhoto = () => {
    if (model.photos && model.photos.length > 0) {
      const primaryPhoto = model.photos.find(p => p.is_primary);
      return primaryPhoto ? primaryPhoto.photo_url : model.photos[0].photo_url;
    }
    return '/placeholder.svg';
  };

  const getAllPhotos = () => {
    return model.photos || [];
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="bg-zinc-900 border-zinc-700 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Foto Principal */}
          <div className="aspect-[3/4] overflow-hidden rounded-lg">
            <img
              src={getPrimaryPhoto()}
              alt={model.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>

          {/* Informações */}
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{model.name}</h1>
                {model.age && (
                  <p className="text-zinc-400 mb-2">{model.age} anos</p>
                )}
                {model.location && (
                  <div className="flex items-center gap-1 text-zinc-400 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{model.location}</span>
                  </div>
                )}
              </div>
              
              {model.is_online && (
                <Badge className="bg-green-500 text-white border-0">
                  Online
                </Badge>
              )}
            </div>

            {/* Rating */}
            {model.rating && (
              <div className="flex items-center gap-1 mb-4">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="text-white font-semibold">{model.rating}</span>
                <span className="text-zinc-400 text-sm ml-2">(45 avaliações)</span>
              </div>
            )}

            {/* Categorias */}
            {model.categories && model.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {model.categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant="secondary"
                    className="bg-zinc-800 text-white border-0"
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Preço */}
            {model.price && (
              <div className="text-2xl font-bold text-pink-400 mb-4">
                R$ {model.price}/hora
              </div>
            )}

            {/* Descrição */}
            {model.description && (
              <p className="text-zinc-300 mb-6 line-clamp-3">
                {model.description}
              </p>
            )}

            {/* Botões de Ação */}
            <div className="flex gap-3 mb-4">
              <Button
                onClick={handleChat}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Conversar
              </Button>
              
              {onBooking && (
                <Button
                  onClick={() => onBooking(model)}
                  variant="outline"
                  className="flex-1 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar
                </Button>
              )}
            </div>

            {/* Botões Secundários */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-zinc-600 text-zinc-400 hover:bg-zinc-800">
                <Heart className="h-4 w-4 mr-1" />
                Favoritar
              </Button>
              <Button variant="outline" size="sm" className="border-zinc-600 text-zinc-400 hover:bg-zinc-800">
                <Share2 className="h-4 w-4 mr-1" />
                Compartilhar
              </Button>
            </div>
          </CardContent>
        </div>

        {/* Galeria de Fotos */}
        {getAllPhotos().length > 1 && (
          <div className="p-6 border-t border-zinc-700">
            <h3 className="text-lg font-semibold text-white mb-4">Mais Fotos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {getAllPhotos().slice(1, 5).map((photo) => (
                <div key={photo.id} className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={photo.photo_url}
                    alt=""
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ModelProfile;
