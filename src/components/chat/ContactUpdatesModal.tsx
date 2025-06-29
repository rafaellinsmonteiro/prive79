
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Contact } from '@/hooks/useContactsUpdates';
import { useNavigate } from 'react-router-dom';
import { useCreateConversation } from '@/hooks/useChat';

interface ContactUpdatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  initialUpdateIndex?: number;
}

const ContactUpdatesModal: React.FC<ContactUpdatesModalProps> = ({
  isOpen,
  onClose,
  contact,
  initialUpdateIndex = 0
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialUpdateIndex);
  const navigate = useNavigate();
  const createConversation = useCreateConversation();

  useEffect(() => {
    setCurrentIndex(initialUpdateIndex);
  }, [initialUpdateIndex]);

  if (!contact || !contact.updates.length) return null;

  const currentUpdate = contact.updates[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : contact.updates.length - 1);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev < contact.updates.length - 1 ? prev + 1 : 0);
  };

  const handleOpenChat = async () => {
    try {
      const conversation = await createConversation.mutateAsync(contact.model_id);
      navigate(`/chat?conversation=${conversation.id}`);
      onClose();
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: ptBR 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full h-[80vh] bg-black border-zinc-800 p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <img
              src={contact.model_photo}
              alt={contact.model_name}
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            <div>
              <p className="text-white font-medium text-sm">{contact.model_name}</p>
              <p className="text-zinc-400 text-xs">{formatTime(currentUpdate.created_at)}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Media Content */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
          {currentUpdate.media_type === 'photo' ? (
            <img
              src={currentUpdate.media_url}
              alt="Update"
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          ) : (
            <video
              src={currentUpdate.media_url}
              poster={currentUpdate.thumbnail_url}
              controls
              className="max-w-full max-h-full"
              autoPlay
            />
          )}

          {/* Navigation Arrows */}
          {contact.updates.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/50 bg-black/30"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/50 bg-black/30"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Progress Indicators */}
          {contact.updates.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1">
              {contact.updates.map((_, index) => (
                <div
                  key={index}
                  className={`h-0.5 w-8 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800">
          <Button
            onClick={handleOpenChat}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={createConversation.isPending}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {createConversation.isPending ? 'Abrindo...' : 'Comentar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactUpdatesModal;
