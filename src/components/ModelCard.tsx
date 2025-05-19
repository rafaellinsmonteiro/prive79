
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { PhoneCall } from "lucide-react";
import ModelDetails from "./ModelDetails";

interface ModelCardProps {
  name: string;
  age: number;
  image: string;
  id: number;
}

const ModelCard = ({ name, age, image, id }: ModelCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const whatsappLink = `https://wa.me/5511999999999?text=Ol%C3%A1%20${encodeURIComponent(name)},%20gostaria%20de%20conversar`;

  // Sample photos for the model (in a real app, these would come from an API or database)
  const modelWithPhotos = {
    id,
    name,
    age,
    image,
    photos: [
      { id: 1, url: image },
      { id: 2, url: `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?q=80&w=500` },
      { id: 3, url: `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=500` },
      { id: 4, url: `https://images.unsplash.com/photo-1500673922987-e212871fec22?q=80&w=500` },
      { id: 5, url: `https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?q=80&w=500` },
      { id: 6, url: `https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?q=80&w=500` },
    ]
  };

  return (
    <>
      <Card 
        className="group overflow-hidden transition-all hover:scale-[1.02] cursor-pointer border-zinc-800/50 bg-zinc-900/50 relative"
        onClick={() => setShowDetails(true)}
      >
        <AspectRatio ratio={3/4}>
          <img 
            src={image} 
            alt={name}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        </AspectRatio>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white text-xl font-medium">{name}</h3>
            <p className="text-zinc-300 text-sm mt-1">{age} anos</p>
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

      <ModelDetails 
        isOpen={showDetails} 
        onClose={() => setShowDetails(false)} 
        model={modelWithPhotos} 
      />
    </>
  );
};

export default ModelCard;
