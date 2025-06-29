
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, MapPin, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Model } from '@/hooks/useModels';
import { useCreateConversation } from '@/hooks/useChat';
import { toast } from 'sonner';

interface ModelCardProps {
  model: Model;
  showViewButton?: boolean;
}

const ModelCard = ({ model, showViewButton = true }: ModelCardProps) => {
  const navigate = useNavigate();
  const createConversation = useCreateConversation();

  const handleChatClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      console.log(`🔄 Iniciando chat com modelo: ${model.name} (ID: ${model.id})`);
      
      const conversation = await createConversation.mutateAsync(model.id);
      
      console.log(`✅ Conversa criada/encontrada: ${conversation.id}`);
      
      // Navegar para o chat com a conversa específica
      navigate(`/chat?conversation=${conversation.id}`);
      
      toast.success(`Chat iniciado com ${model.name}!`);
    } catch (error: any) {
      console.error('❌ Erro ao iniciar chat:', error);
      
      let errorMessage = 'Erro ao iniciar chat. Tente novamente.';
      
      if (error.message?.includes('não encontrada') || error.message?.includes('not found')) {
        errorMessage = 'Modelo não encontrada ou indisponível para chat.';
      } else if (error.message?.includes('não tem perfil')) {
        errorMessage = 'Esta modelo ainda não está configurada para chat.';
      } else if (error.message?.includes('não tem usuário')) {
        errorMessage = 'Erro de configuração da modelo. Entre em contato com o suporte.';
      }
      
      toast.error(errorMessage);
    }
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/model/${model.id}`);
  };

  const handleCardClick = () => {
    navigate(`/model/${model.id}`);
  };

  const primaryPhoto = model.photos?.find(photo => photo.is_primary) || model.photos?.[0];

  return (
    <Card 
      className="bg-zinc-900 border-zinc-700 hover:border-zinc-600 transition-all duration-300 cursor-pointer group overflow-hidden"
      onClick={handleCardClick}
    >
      <div className="relative">
        {primaryPhoto ? (
          <img
            src={primaryPhoto.photo_url}
            alt={model.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-48 bg-zinc-800 flex items-center justify-center">
            <span className="text-zinc-500">Sem foto</span>
          </div>
        )}
        
        {/* Overlay com botões */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          {showViewButton && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleViewClick}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver Perfil
            </Button>
          )}
          
          <Button
            size="sm"
            onClick={handleChatClick}
            disabled={createConversation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {createConversation.isPending ? 'Conectando...' : 'Chat'}
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-white truncate flex-1 mr-2">
            {model.name}
          </h3>
          <span className="text-sm text-zinc-400 whitespace-nowrap">
            {model.age} anos
          </span>
        </div>

        {(model.location || model.neighborhood) && (
          <div className="flex items-center gap-1 mb-2">
            <MapPin className="h-3 w-3 text-zinc-400" />
            <span className="text-sm text-zinc-400">
              {[model.neighborhood, model.location].filter(Boolean).join(', ')}
            </span>
          </div>
        )}

        {model.categories && model.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {model.categories.slice(0, 2).map((category) => (
              <Badge 
                key={category.id} 
                variant="secondary" 
                className="text-xs bg-zinc-800 text-zinc-300 border-zinc-700"
              >
                {category.name}
              </Badge>
            ))}
            {model.categories.length > 2 && (
              <Badge 
                variant="secondary" 
                className="text-xs bg-zinc-800 text-zinc-300 border-zinc-700"
              >
                +{model.categories.length - 2}
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {showViewButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewClick}
              className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver Perfil
            </Button>
          )}
          
          <Button
            size="sm"
            onClick={handleChatClick}
            disabled={createConversation.isPending}
            className={`${showViewButton ? 'flex-1' : 'w-full'} bg-blue-600 hover:bg-blue-700 text-white`}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {createConversation.isPending ? 'Conectando...' : 'Iniciar Chat'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelCard;
