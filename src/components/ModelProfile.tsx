
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, ArrowLeft, ArrowRight, X, Video } from "lucide-react";
import { Model } from "@/hooks/useModels";
import { useModelMedia } from "@/hooks/useModelMedia";

interface ModelProfileProps {
  model: Model;
  onClose: () => void;
}

const ModelProfile = ({ model, onClose }: ModelProfileProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { data: mediaItems = [] } = useModelMedia(model.id);
  
  const whatsappLink = `https://wa.me/${model.whatsapp_number}?text=Ol%C3%A1%20${encodeURIComponent(model.name)},%20gostaria%20de%20conversar`;

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % mediaItems.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const currentMedia = mediaItems[currentImageIndex];

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 overflow-y-auto">
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h1 className="text-2xl font-bold">{model.name}</h1>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-zinc-100">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side - Main image/video and thumbnails */}
            <div className="space-y-4">
              {/* Main media with navigation */}
              <div className="relative aspect-[3/4] bg-zinc-900 rounded-lg overflow-hidden">
                {currentMedia?.media_type === 'photo' ? (
                  <img 
                    src={currentMedia.media_url} 
                    alt={model.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <div className="text-center">
                      <Video className="h-16 w-16 mx-auto mb-4 text-zinc-400" />
                      <p className="text-zinc-400">Vídeo Preview</p>
                    </div>
                  </div>
                )}
                
                {mediaItems.length > 1 && (
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

              {/* Media thumbnails */}
              {mediaItems.length > 1 && (
                <div className="grid grid-cols-6 gap-2">
                  {mediaItems.map((media, index) => (
                    <button
                      key={media.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                        currentImageIndex === index 
                          ? "border-pink-500" 
                          : "border-zinc-700 hover:border-zinc-600"
                      }`}
                    >
                      {media.media_type === 'photo' ? (
                        <img 
                          src={media.media_url} 
                          alt={`${model.name} ${index + 1}`} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                          <Video className="h-4 w-4 text-zinc-400" />
                        </div>
                      )}
                      
                      {/* Video icon overlay */}
                      {media.media_type === 'video' && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Video className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right side - Model information */}
            <div className="space-y-6">
              {/* About section */}
              <div className="flex items-center gap-2 text-lg">
                <span className="text-zinc-400">👤</span>
                <span>Sobre a modelo</span>
              </div>

              <Button onClick={() => window.open(whatsappLink, '_blank')} className="w-full text-white py-3 bg-green-500 hover:bg-green-400">
                <Phone className="h-5 w-5 mr-2" />
                Chamar no WhatsApp
              </Button>

              <div className="space-y-4">
                {model.location && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-400 block">Localização</span>
                      <span>{model.location}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {model.appearance && (
                    <div>
                      <span className="text-zinc-400 block">Aparência</span>
                      <span>{model.appearance}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-zinc-400 block">Idade</span>
                    <span>{model.age}</span>
                  </div>
                </div>

                {(model.height || model.weight) && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {model.height && (
                      <div>
                        <span className="text-zinc-400 block">Altura</span>
                        <span>{model.height}</span>
                      </div>
                    )}
                    {model.weight && (
                      <div>
                        <span className="text-zinc-400 block">Peso</span>
                        <span>{model.weight}</span>
                      </div>
                    )}
                  </div>
                )}

                {(model.silicone !== null || model.shoe_size) && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-400 block">Silicone</span>
                      <span>{model.silicone ? 'Sim' : 'Não'}</span>
                    </div>
                    {model.shoe_size && (
                      <div>
                        <span className="text-zinc-400 block">Pés</span>
                        <span>{model.shoe_size}</span>
                      </div>
                    )}
                  </div>
                )}

                {(model.bust || model.waist) && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {model.bust && (
                      <div>
                        <span className="text-zinc-400 block">Busto</span>
                        <span>{model.bust}</span>
                      </div>
                    )}
                    {model.waist && (
                      <div>
                        <span className="text-zinc-400 block">Cintura</span>
                        <span>{model.waist}</span>
                      </div>
                    )}
                  </div>
                )}

                {(model.hip || model.body_type) && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {model.hip && (
                      <div>
                        <span className="text-zinc-400 block">Quadril</span>
                        <span>{model.hip}</span>
                      </div>
                    )}
                    {model.body_type && (
                      <div>
                        <span className="text-zinc-400 block">Manequim</span>
                        <span>{model.body_type}</span>
                      </div>
                    )}
                  </div>
                )}

                {model.eyes && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-400 block">Olhos</span>
                      <span>{model.eyes}</span>
                    </div>
                  </div>
                )}

                {model.languages && (
                  <div className="text-sm">
                    <span className="text-zinc-400 block">Línguas</span>
                    <span>{model.languages}</span>
                  </div>
                )}

                {model.description && (
                  <div className="text-sm">
                    <span className="text-zinc-400 block mb-2">Descrição</span>
                    <p className="text-zinc-300 leading-relaxed">{model.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelProfile;
