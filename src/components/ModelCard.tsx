
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Model } from "@/hooks/useModels";
import { Link, useNavigate } from "react-router-dom";
import { useCreateConversation } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";

interface ModelCardProps {
  model: Model;
  onClick?: () => void;
}

const ModelCard = ({ model, onClick }: ModelCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createConversation = useCreateConversation();
  
  // Pegar a primeira foto como imagem principal
  const primaryPhoto = model.photos.find(photo => photo.is_primary) || model.photos[0];
  const imageUrl = primaryPhoto?.photo_url || '/placeholder.svg';

  const handleMessageClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const conversation = await createConversation.mutateAsync(model.id);
      navigate(`/chat?conversation=${conversation.id}`);
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      // Fallback: navegar para chat geral
      navigate('/chat');
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // Se há um onClick prop, use o comportamento de modal
  if (onClick) {
    return (
      <Card 
        className="group overflow-hidden transition-all hover:scale-[1.02] cursor-pointer border-zinc-800/50 bg-zinc-900/50 relative"
        onClick={handleClick}
      >
        <AspectRatio ratio={3/4}>
          <img 
            src={imageUrl} 
            alt={model.name}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        </AspectRatio>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white text-xl font-medium">{model.name}</h3>
            <p className="text-zinc-300 text-sm mt-1">{model.age} anos</p>
          </div>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              variant="default" 
              size="icon" 
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleMessageClick}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Comportamento padrão: navegar para a página do modelo
  return (
    <Link to={`/modelo/${model.id}`}>
      <Card className="group overflow-hidden transition-all hover:scale-[1.02] cursor-pointer border-zinc-800/50 bg-zinc-900/50 relative">
        <AspectRatio ratio={3/4}>
          <img 
            src={imageUrl} 
            alt={model.name}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        </AspectRatio>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white text-xl font-medium">{model.name}</h3>
            <p className="text-zinc-300 text-sm mt-1">{model.age} anos</p>
          </div>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              variant="default" 
              size="icon" 
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleMessageClick}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ModelCard;
