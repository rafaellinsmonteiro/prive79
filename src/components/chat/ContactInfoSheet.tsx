
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useModel } from '@/hooks/useModels';
import { useModelMedia } from '@/hooks/useModelMedia';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Phone, Video, MessageCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MediaPreviewModal from './MediaPreviewModal';

interface ContactInfoSheetProps {
  isOpen: boolean;
  onClose: () => void;
  modelId?: string;
  modelName?: string;
  modelPhoto?: string;
}

const ContactInfoSheet: React.FC<ContactInfoSheetProps> = ({
  isOpen,
  onClose,
  modelId,
  modelName,
  modelPhoto
}) => {
  const [selectedMedia, setSelectedMedia] = useState<{
    url: string;
    type: 'photo' | 'video';
    fileName?: string;
  } | null>(null);
  
  const { data: model } = useModel(modelId || '');
  const { data: media = [] } = useModelMedia(modelId);
  const { data: currentUser } = useCurrentUser();

  // Filter media based on user's plan permissions
  const filteredMedia = media.filter(item => {
    // If no plan restrictions, show all public media
    if (!item.allowed_plan_ids || item.allowed_plan_ids.length === 0) {
      return item.visibility_type === 'public';
    }
    
    // If user has no plan, only show public media with no restrictions
    if (!currentUser?.plan_id) {
      return item.visibility_type === 'public' && 
             (!item.allowed_plan_ids || item.allowed_plan_ids.length === 0);
    }
    
    // Check if user's plan is in the allowed plans
    return item.allowed_plan_ids.includes(currentUser.plan_id);
  });

  const handleMediaClick = (item: any) => {
    setSelectedMedia({
      url: item.media_url,
      type: item.media_type,
      fileName: item.title || `${item.media_type}_${item.id}`
    });
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full bg-zinc-950 border-zinc-800 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="p-6 border-b border-zinc-800">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <img
                    src={modelPhoto || '/placeholder.svg'}
                    alt={modelName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-zinc-700 shadow-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-zinc-950"></div>
                </div>
                <div className="text-center">
                  <SheetTitle className="text-white text-xl font-semibold">{modelName}</SheetTitle>
                  <p className="text-green-400 text-sm font-medium">Online agora</p>
                </div>
              </div>
            </SheetHeader>

            {/* Action Buttons */}
            <div className="p-6 border-b border-zinc-800">
              <div className="flex justify-center space-x-6">
                <Button variant="ghost" size="lg" className="flex flex-col items-center space-y-2 text-white hover:bg-zinc-800 rounded-xl p-4">
                  <Phone className="h-6 w-6" />
                  <span className="text-xs">Ligar</span>
                </Button>
                <Button variant="ghost" size="lg" className="flex flex-col items-center space-y-2 text-white hover:bg-zinc-800 rounded-xl p-4">
                  <Video className="h-6 w-6" />
                  <span className="text-xs">Vídeo</span>
                </Button>
                <Button variant="ghost" size="lg" className="flex flex-col items-center space-y-2 text-white hover:bg-zinc-800 rounded-xl p-4">
                  <Star className="h-6 w-6" />
                  <span className="text-xs">Favoritar</span>
                </Button>
              </div>
            </div>

            {/* Model Info */}
            {model && (
              <div className="p-6 border-b border-zinc-800">
                <h3 className="text-white font-semibold mb-3">Informações</h3>
                <div className="space-y-2 text-sm">
                  {model.age && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Idade:</span>
                      <span className="text-white">{model.age} anos</span>
                    </div>
                  )}
                  {model.location && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Localização:</span>
                      <span className="text-white">{model.location}</span>
                    </div>
                  )}
                  {model.height && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Altura:</span>
                      <span className="text-white">{model.height}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Media Grid */}
            <div className="flex-1">
              <div className="p-6">
                <h3 className="text-white font-semibold mb-4">Mídia</h3>
                <ScrollArea className="h-full">
                  <div className="grid grid-cols-3 gap-2">
                    {filteredMedia.map((item, index) => (
                      <div 
                        key={item.id} 
                        className="aspect-square relative rounded-lg overflow-hidden bg-zinc-800 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleMediaClick(item)}
                      >
                        {item.media_type === 'photo' ? (
                          <img
                            src={item.media_url}
                            alt={`Media ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            <video
                              src={item.media_url}
                              className="w-full h-full object-cover"
                              poster={item.thumbnail_url}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <div className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                                <div className="w-0 h-0 border-l-[6px] border-l-black border-y-[4px] border-y-transparent ml-0.5"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {filteredMedia.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-zinc-400">
                        {media.length === 0 
                          ? 'Nenhuma mídia disponível' 
                          : 'Nenhuma mídia disponível para seu plano'
                        }
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Media Preview Modal */}
      {selectedMedia && (
        <MediaPreviewModal
          isOpen={!!selectedMedia}
          onClose={() => setSelectedMedia(null)}
          mediaUrl={selectedMedia.url}
          mediaType={selectedMedia.type}
          fileName={selectedMedia.fileName}
        />
      )}
    </>
  );
};

export default ContactInfoSheet;
