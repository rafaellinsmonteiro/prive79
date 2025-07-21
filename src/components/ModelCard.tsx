import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Star, MapPin, Calendar } from 'lucide-react';
import { useCreateConversation } from '@/hooks/useChat';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ModelCardProps {
  model: {
    id: string;
    name: string;
    age?: number;
    location?: string;
    rating?: number;
    price?: number;
    photos?: Array<{
      id: string;
      photo_url: string;
      is_primary: boolean;
    }>;
    is_online?: boolean;
    categories?: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  };
  onBooking?: (model: any) => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({ model, onBooking }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createConversation = useCreateConversation();

  const handleChat = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
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

  const handleCardClick = () => {
    navigate(`/modelo/${model.id}`);
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 bg-zinc-900 border-zinc-700 overflow-hidden"
      onClick={handleCardClick}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={getPrimaryPhoto()}
          alt={model.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        
        {/* Status Online */}
        {model.is_online && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-green-500 text-white border-0">
              Online
            </Badge>
          </div>
        )}

        {/* Categorias */}
        {model.categories && model.categories.length > 0 && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
            {model.categories.slice(0, 2).map((category) => (
              <Badge
                key={category.id}
                variant="secondary"
                className="bg-black/60 text-white border-0 text-xs"
              >
                {category.name}
              </Badge>
            ))}
            {model.categories.length > 2 && (
              <Badge
                variant="secondary"
                className="bg-black/60 text-white border-0 text-xs"
              >
                +{model.categories.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Overlay com botões */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleChat}
            className="bg-white/90 text-black hover:bg-white"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>
          
          {onBooking && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onBooking(model);
              }}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Agendar
            </Button>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-lg text-white group-hover:text-pink-400 transition-colors">
              {model.name}
            </h3>
            {model.age && (
              <p className="text-sm text-zinc-400">{model.age} anos</p>
            )}
          </div>
          
          {model.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-zinc-300">{model.rating}</span>
            </div>
          )}
        </div>

        {model.location && (
          <div className="flex items-center gap-1 text-zinc-400 text-sm mb-2">
            <MapPin className="h-4 w-4" />
            <span>{model.location}</span>
          </div>
        )}

        {model.price && (
          <div className="text-pink-400 font-semibold">
            R$ {model.price}/hora
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModelCard;
