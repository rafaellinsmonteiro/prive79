
import React, { useState, useEffect, useRef } from 'react';
import { Contact } from '@/hooks/useContactsUpdates';
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useCreateConversation } from '@/hooks/useChat';

interface FeedReelsViewProps {
  contacts: Contact[];
}

const FeedReelsView: React.FC<FeedReelsViewProps> = ({ contacts }) => {
  const [currentContactIndex, setCurrentContactIndex] = useState(0);
  const [currentUpdateIndex, setCurrentUpdateIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const createConversation = useCreateConversation();

  // Filtrar apenas contatos que têm atualizações
  const contactsWithUpdates = contacts.filter(contact => contact.updates.length > 0);

  const currentContact = contactsWithUpdates[currentContactIndex];
  const currentUpdate = currentContact?.updates[currentUpdateIndex];

  const handleNext = () => {
    if (!currentContact) return;
    
    if (currentUpdateIndex < currentContact.updates.length - 1) {
      setCurrentUpdateIndex(prev => prev + 1);
    } else if (currentContactIndex < contactsWithUpdates.length - 1) {
      setCurrentContactIndex(prev => prev + 1);
      setCurrentUpdateIndex(0);
    }
  };

  const handlePrevious = () => {
    if (!currentContact) return;
    
    if (currentUpdateIndex > 0) {
      setCurrentUpdateIndex(prev => prev - 1);
    } else if (currentContactIndex > 0) {
      setCurrentContactIndex(prev => prev - 1);
      const prevContact = contactsWithUpdates[currentContactIndex - 1];
      setCurrentUpdateIndex(prevContact.updates.length - 1);
    }
  };

  const handleOpenChat = async () => {
    if (!currentContact) return;
    
    try {
      const conversation = await createConversation.mutateAsync(currentContact.model_id);
      navigate(`/chat?conversation=${conversation.id}`);
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

  if (!currentContact || !currentUpdate) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <p className="text-zinc-400">Nenhuma atualização disponível</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-[calc(100vh-200px)] bg-black relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <img
            src={currentContact.model_photo}
            alt={currentContact.model_name}
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <div>
            <p className="text-white font-medium">{currentContact.model_name}</p>
            <p className="text-zinc-300 text-sm">{formatTime(currentUpdate.created_at)}</p>
          </div>
        </div>
        
        {/* Progress bars */}
        <div className="flex gap-1 mt-3">
          {currentContact.updates.map((_, index) => (
            <div
              key={index}
              className={`h-0.5 flex-1 rounded-full transition-colors ${
                index === currentUpdateIndex ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Media Content */}
      <div className="h-full flex items-center justify-center">
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
      </div>

      {/* Navigation */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevious}
          className="text-white hover:bg-black/50 bg-black/30"
          disabled={currentContactIndex === 0 && currentUpdateIndex === 0}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="text-white hover:bg-black/50 bg-black/30"
          disabled={
            currentContactIndex === contactsWithUpdates.length - 1 && 
            currentUpdateIndex === currentContact.updates.length - 1
          }
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <Button
          onClick={handleOpenChat}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          disabled={createConversation.isPending}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          {createConversation.isPending ? 'Abrindo...' : 'Comentar'}
        </Button>
      </div>
    </div>
  );
};

export default FeedReelsView;
