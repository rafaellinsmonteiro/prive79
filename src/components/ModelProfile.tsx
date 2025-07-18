import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowLeft, ArrowRight, X, Video, Play } from "lucide-react";
import { Model } from "@/hooks/useModels";
import { useModelMedia } from "@/hooks/useModelMedia";
import { useCustomFields, useCustomSections } from "@/hooks/useCustomFields";
import { useNavigate } from "react-router-dom";
import { useCreateConversation } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";

interface ModelProfileProps {
  model: Model;
  onClose: () => void;
}

const ModelProfile = ({ model, onClose }: ModelProfileProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const createConversation = useCreateConversation();
  const { data: mediaItems = [] } = useModelMedia(model.id);
  const { data: customFields = [] } = useCustomFields();
  const { data: customSections = [] } = useCustomSections();

  const handleMessageClick = async () => {
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

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % mediaItems.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const currentMedia = mediaItems[currentImageIndex];

  // Organize fields by sections with proper ordering and no duplicates
  const organizeFieldsBySection = () => {
    const sections: Record<string, Array<{ label: string; value: any; type?: string }>> = {};

    // Get all active custom sections ordered by display_order
    const activeSections = customSections
      .filter(section => section.is_active)
      .sort((a, b) => a.display_order - b.display_order);

    console.log('📊 Active sections ordered:', activeSections.map(s => ({ name: s.name, order: s.display_order })));

    // Process each section in order
    activeSections.forEach(section => {
      const sectionName = section.name;
      
      // Skip sections that should not be displayed
      const excludedSections = ['Configurações', 'Controle de Acesso'];
      if (excludedSections.includes(sectionName)) {
        return;
      }

      // Initialize section
      if (!sections[sectionName]) {
        sections[sectionName] = [];
      }

      // Handle built-in sections with their specific fields
      if (sectionName === 'Informações Básicas') {
        if (model.name) sections[sectionName].push({ label: 'Nome', value: model.name });
        if (model.age) sections[sectionName].push({ label: 'Idade', value: model.age });
        if (model.cities?.name) sections[sectionName].push({ label: 'Cidade', value: model.cities.name });
        if (model.neighborhood) sections[sectionName].push({ label: 'Bairro', value: model.neighborhood });
      } else if (sectionName === 'Características Físicas') {
        if (model.height) sections[sectionName].push({ label: 'Altura', value: model.height });
        if (model.weight) sections[sectionName].push({ label: 'Peso', value: model.weight });
        if (model.bust) sections[sectionName].push({ label: 'Busto', value: model.bust });
        if (model.waist) sections[sectionName].push({ label: 'Cintura', value: model.waist });
        if (model.hip) sections[sectionName].push({ label: 'Quadril', value: model.hip });
        if (model.body_type) sections[sectionName].push({ label: 'Manequim', value: model.body_type });
        if (model.eyes) sections[sectionName].push({ label: 'Olhos', value: model.eyes });
        if (model.shoe_size) sections[sectionName].push({ label: 'Pés', value: model.shoe_size });
        if (model.silicone !== null) sections[sectionName].push({ label: 'Silicone', value: model.silicone ? 'Sim' : 'Não' });
      }

      // Add custom fields for this section (exclude system fields to avoid duplicates)
      const systemFields = ['name', 'age', 'city_id', 'neighborhood', 'whatsapp_number', 'height', 'weight', 'bust', 'waist', 'hip', 'body_type', 'eyes', 'shoe_size', 'silicone', 'languages', 'description'];
      
      const fieldsForSection = customFields
        .filter(field => {
          const isActive = field.is_active;
          const isForThisSection = field.section === sectionName;
          const isNotSystemField = !systemFields.includes(field.field_name);
          
          return isActive && isForThisSection && isNotSystemField;
        })
        .sort((a, b) => a.display_order - b.display_order);

      fieldsForSection.forEach(field => {
        let value;
        
        // Check if it's an integrated field or custom field
        const integratedFields = ['olhos', 'tatuagem', 'cabelo', 'etnia', 'nossa_recomendacao'];
        if (integratedFields.includes(field.field_name)) {
          value = (model as any)[field.field_name];
        } else {
          value = (model as any)[field.field_name] || (model as any)[`custom_${field.field_name}`];
        }

        if (value !== null && value !== undefined && value !== '') {
          const formattedValue = formatFieldValue(field, value);
          if (formattedValue) {
            sections[sectionName].push({
              label: field.label,
              value: formattedValue,
              type: field.field_type
            });
          }
        }
      });

      // Remove empty sections
      if (sections[sectionName].length === 0) {
        delete sections[sectionName];
      }
    });

    console.log('✅ Organized sections:', Object.keys(sections));
    return sections;
  };

  const formatFieldValue = (field: any, value: any) => {
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

  const sectionsByData = organizeFieldsBySection();

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 overflow-y-auto pb-20 md:pb-0">
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

            {/* Right side - Model information organized by sections */}
            <div className="space-y-6">
              {/* Message button */}
              <Button onClick={handleMessageClick} className="w-full text-white py-3 bg-blue-500 hover:bg-blue-400">
                <MessageCircle className="h-5 w-5 mr-2" />
                Enviar Mensagem
              </Button>

              {/* Display sections with data in correct order */}
              {Object.entries(sectionsByData).map(([sectionName, fields]) => (
                <div key={sectionName} className="space-y-4">
                  <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
                    {sectionName}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {fields.map((field, index) => (
                      <div key={index}>
                        <span className="text-zinc-400 block">{field.label}</span>
                        <span className="text-zinc-100">
                          {field.type === 'textarea' ? (
                            <p className="leading-relaxed">{field.value}</p>
                          ) : (
                            field.value
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* If no sections have data */}
              {Object.keys(sectionsByData).length === 0 && (
                <div className="text-center text-zinc-400 py-8">
                  <p>Nenhuma informação adicional cadastrada.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelProfile;
