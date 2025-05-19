
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { PhoneCall } from "lucide-react";

interface Photo {
  id: number;
  url: string;
}

interface ModelDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  model: {
    id: number;
    name: string;
    age: number;
    image: string;
    photos: Photo[];
  };
}

const ModelDetails = ({ isOpen, onClose, model }: ModelDetailsProps) => {
  const whatsappLink = `https://wa.me/5511999999999?text=Ol%C3%A1%20${encodeURIComponent(model.name)},%20gostaria%20de%20conversar`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">{model.name}, {model.age} anos</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {model.photos.map((photo) => (
            <AspectRatio key={photo.id} ratio={3/4} className="overflow-hidden rounded-lg">
              <img 
                src={photo.url} 
                alt={`${model.name} photo ${photo.id}`} 
                className="object-cover w-full h-full"
              />
            </AspectRatio>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <Button 
            variant="default" 
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={() => window.open(whatsappLink, '_blank')}
          >
            <PhoneCall className="h-5 w-5 mr-2" />
            WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModelDetails;
