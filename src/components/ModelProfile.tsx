
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, ArrowLeft, ArrowRight, X } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ModelProfileProps {
  model: {
    id: number;
    name: string;
    age: number;
    image: string;
  };
  onClose: () => void;
}

const ModelProfile = ({ model, onClose }: ModelProfileProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Mock data for demonstration - in a real app this would come from an API
  const profileData = {
    location: "Bela Vista, São Paulo - SP",
    appearance: "Loira",
    age: model.age,
    height: "160 cm",
    weight: "55 kg",
    silicone: "Sim",
    size: "35",
    bust: "C",
    waist: "65",
    hip: "90",
    bodyType: "34",
    eyes: "Azuis",
    languages: "Inglês, espanhol e português",
    description: "Loirinha linda, de pele branquinha, rosto delicado, e um corpo de tirar o fôlego, gosta de frequentar baladas pelas manhãs, caminhar pelo parque aos domingos, ter boas conversas acompanhadas de bons vinhos, e boas gastronomias. É carinhosa, meiga, extrovertida e divertida. Entre em contato e descubra mais!"
  };

  // Mock additional photos - in a real app these would come from the model data
  const photos = [
    model.image,
    "/lovable-uploads/b9bd7d45-b917-4290-a1aa-bee5b931dc68.png",
    "/lovable-uploads/6e0363be-2338-4902-9942-2b48013527c7.png",
    "/lovable-uploads/aa64fd07-f6e9-44dc-9884-31df43791242.png",
    "/lovable-uploads/b79999d0-f8f1-48f6-aa79-16285eb7104d.png",
    "/lovable-uploads/4fc5af21-d6b9-4ec2-8548-3712319ddf5e.png"
  ];

  const whatsappLink = `https://wa.me/5511999999999?text=Ol%C3%A1%20${encodeURIComponent(model.name)},%20gostaria%20de%20conversar`;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % photos.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 overflow-y-auto">
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h1 className="text-2xl font-bold">{model.name}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side - Main image and thumbnails */}
            <div className="space-y-4">
              {/* Main image with navigation */}
              <div className="relative aspect-[3/4] bg-zinc-900 rounded-lg overflow-hidden">
                <img
                  src={photos[currentImageIndex]}
                  alt={model.name}
                  className="w-full h-full object-cover"
                />
                {photos.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={prevImage}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={nextImage}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>

              {/* Photo thumbnails */}
              <div className="grid grid-cols-6 gap-2">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index
                        ? "border-pink-500"
                        : "border-zinc-700 hover:border-zinc-600"
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`${model.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right side - Model information */}
            <div className="space-y-6">
              {/* About section */}
              <div className="flex items-center gap-2 text-lg">
                <span className="text-zinc-400">👤</span>
                <span>Sobre a acompanhante</span>
              </div>

              {/* Phone button */}
              <Button
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3"
                onClick={() => window.open(whatsappLink, '_blank')}
              >
                <Phone className="h-5 w-5 mr-2" />
                Ver telefone
              </Button>

              {/* Information grid */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400 block">Localização</span>
                    <span>{profileData.location}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400 block">Aparência</span>
                    <span>{profileData.appearance}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Idade</span>
                    <span>{profileData.age}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400 block">Altura</span>
                    <span>{profileData.height}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Peso</span>
                    <span>{profileData.weight}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400 block">Silicone</span>
                    <span>{profileData.silicone}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Pés</span>
                    <span>{profileData.size}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400 block">Busto</span>
                    <span>{profileData.bust}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Cintura</span>
                    <span>{profileData.waist}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400 block">Quadril</span>
                    <span>{profileData.hip}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Manequim</span>
                    <span>{profileData.bodyType}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400 block">Olhos</span>
                    <span>{profileData.eyes}</span>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-zinc-400 block">Línguas</span>
                  <span>{profileData.languages}</span>
                </div>

                {/* Description */}
                <div className="text-sm">
                  <span className="text-zinc-400 block mb-2">Descrição</span>
                  <p className="text-zinc-300 leading-relaxed">{profileData.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelProfile;
