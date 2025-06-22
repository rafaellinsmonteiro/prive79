
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, ArrowLeft, ArrowRight, X, Video, Play } from "lucide-react";
import { Model } from "@/hooks/useModels";
import { useModelMedia } from "@/hooks/useModelMedia";
import { useCustomFields, useCustomSections } from "@/hooks/useCustomFields";

interface ModelProfileProps {
  model: Model;
  onClose: () => void;
}

const ModelProfile = ({ model, onClose }: ModelProfileProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { data: mediaItems = [] } = useModelMedia(model.id);
  const { data: customFields = [] } = useCustomFields();
  const { data: customSections = [] } = useCustomSections();
  
  const whatsappLink = `https://wa.me/${model.whatsapp_number}?text=Ol%C3%A1%20${encodeURIComponent(model.name)},%20gostaria%20de%20conversar`;

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % mediaItems.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const currentMedia = mediaItems[currentImageIndex];

  // Function to generate thumbnail from video if needed
  const generateVideoThumbnail = (videoUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.currentTime = 1; // Get frame at 1 second
      
      video.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(thumbnailUrl);
      };
      
      video.onerror = () => {
        resolve(''); // Return empty string if thumbnail generation fails
      };
      
      video.src = videoUrl;
    });
  };

  // Filter and organize custom fields for display
  const systemSections = [
    'Informações Básicas',
    'Características Físicas', 
    'Atendimento',
    'Outras Informações',
    'Controle de Acesso',
    'Configurações'
  ];

  const activeCustomFields = customFields.filter(field => 
    field.is_active && 
    !systemSections.includes(field.section || '') &&
    !['name', 'age', 'whatsapp_number', 'neighborhood', 'height', 'weight', 'eyes', 'body_type', 'shoe_size', 'bust', 'waist', 'hip', 'description', 'silicone', 'is_active', 'display_order', 'visibility_type', 'allowed_plan_ids'].includes(field.field_name)
  );

  const customFieldsBySection = activeCustomFields.reduce((acc, field) => {
    const section = field.section || 'Campos Personalizados';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(field);
    return acc;
  }, {} as Record<string, typeof activeCustomFields>);

  // Get custom field values from model data (assuming they're stored with custom_ prefix)
  const getCustomFieldValue = (fieldName: string) => {
    const key = `custom_${fieldName}`;
    return (model as any)[key];
  };

  const formatCustomFieldValue = (field: typeof activeCustomFields[0], value: any) => {
    if (value === null || value === undefined || value === '') return null;
    
    switch (field.field_type) {
      case 'boolean':
        return value ? 'Sim' : 'Não';
      case 'date':
        return new Date(value).toLocaleDateString('pt-BR');
      case 'select':
      case 'text':
      case 'textarea':
      case 'email':
      case 'url':
      case 'number':
      default:
        return String(value);
    }
  };

  const activeCustomSections = customSections
    .filter(section => section.is_active && !systemSections.includes(section.name))
    .sort((a, b) => a.display_order - b.display_order);

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
                ) : currentMedia?.media_type === 'video' ? (
                  <video 
                    src={currentMedia.media_url}
                    controls
                    preload="metadata"
                    poster={currentMedia.thumbnail_url || undefined}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Erro ao carregar vídeo:', e);
                    }}
                  >
                    Seu navegador não suporta reprodução de vídeo.
                  </video>
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <div className="text-center">
                      <Video className="h-16 w-16 mx-auto mb-4 text-zinc-400" />
                      <p className="text-zinc-400">Mídia não disponível</p>
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
                      ) : media.media_type === 'video' ? (
                        <>
                          {media.thumbnail_url ? (
                            <img 
                              src={media.thumbnail_url} 
                              alt={`${model.name} vídeo ${index + 1}`} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <video 
                              src={media.media_url}
                              preload="metadata"
                              className="w-full h-full object-cover"
                              muted
                            />
                          )}
                          {/* Video play icon overlay */}
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Play className="h-6 w-6 text-white fill-white" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                          <Video className="h-4 w-4 text-zinc-400" />
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
                  {model.categories && model.categories.length > 0 && (
                    <div>
                      <span className="text-zinc-400 block">Aparência</span>
                      <span>{model.categories.map(c => c.name).join(', ')}</span>
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

                {/* Custom Fields Sections */}
                {activeCustomSections.map((section) => {
                  const fieldsInSection = customFieldsBySection[section.name] || [];
                  
                  if (fieldsInSection.length === 0) return null;

                  const visibleFields = fieldsInSection.filter(field => {
                    const value = getCustomFieldValue(field.field_name);
                    return value !== null && value !== undefined && value !== '';
                  });

                  if (visibleFields.length === 0) return null;

                  return (
                    <div key={section.id} className="space-y-4">
                      <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
                        {section.name}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {visibleFields.map(field => {
                          const value = getCustomFieldValue(field.field_name);
                          const formattedValue = formatCustomFieldValue(field, value);
                          
                          if (!formattedValue) return null;

                          return (
                            <div key={field.id}>
                              <span className="text-zinc-400 block">{field.label}</span>
                              <span>{formattedValue}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Default custom fields section */}
                {customFieldsBySection['Campos Personalizados'] && customFieldsBySection['Campos Personalizados'].length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
                      Campos Personalizados
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {customFieldsBySection['Campos Personalizados']
                        .filter(field => {
                          const value = getCustomFieldValue(field.field_name);
                          return value !== null && value !== undefined && value !== '';
                        })
                        .map(field => {
                          const value = getCustomFieldValue(field.field_name);
                          const formattedValue = formatCustomFieldValue(field, value);
                          
                          if (!formattedValue) return null;

                          return (
                            <div key={field.id}>
                              <span className="text-zinc-400 block">{field.label}</span>
                              <span>{formattedValue}</span>
                            </div>
                          );
                        })}
                    </div>
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
