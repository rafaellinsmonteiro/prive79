
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { PhoneCall } from "lucide-react";
import { Model } from "@/hooks/useModels";
import { Link } from "react-router-dom";

interface ModelCardProps {
  model: Model;
  onClick?: () => void;
}

const ModelCard = ({ model, onClick }: ModelCardProps) => {
  // Pegar a primeira foto como imagem principal
  const primaryPhoto = model.photos.find(photo => photo.is_primary) || model.photos[0];
  const imageUrl = primaryPhoto?.photo_url || '/placeholder.svg';

  const whatsappLink = `https://wa.me/${model.whatsapp_number || '5511999999999'}?text=Ol%C3%A1%20${encodeURIComponent(model.name)},%20gostaria%20de%20conversar`;

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
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={(e) => {
                e.stopPropagation();
                window.open(whatsappLink, '_blank');
              }}
            >
              <PhoneCall className="h-5 w-5" />
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
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                window.open(whatsappLink, '_blank');
              }}
            >
              <PhoneCall className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ModelCard;
