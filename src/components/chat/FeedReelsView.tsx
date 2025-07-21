
import React, { useState, useEffect, useRef } from 'react';
import { Contact } from '@/hooks/useContactsUpdates';
import { ChevronLeft, ChevronRight, MessageCircle, User, MapPin, Heart, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useCreateConversation } from '@/hooks/useChat';
import { useIsMobile } from '@/hooks/use-mobile';

interface FeedReelsViewProps {
  contacts: Contact[];
}

const FeedReelsView: React.FC<FeedReelsViewProps> = ({ contacts }) => {
  const [currentContactIndex, setCurrentContactIndex] = useState(0);
  const [currentUpdateIndex, setCurrentUpdateIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const createConversation = useCreateConversation();
  const isMobile = useIsMobile();

  // Filtrar apenas contatos que têm atualizações
  const contactsWithUpdates = contacts.filter(contact => contact.updates.length > 0);

  const currentContact = contactsWithUpdates[currentContactIndex];
  const currentUpdate = currentContact?.updates[currentUpdateIndex];

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentUpdate || currentUpdate.media_type !== 'video') return;

    const handleVideoPlay = () => setIsPlaying(true);
    const handleVideoPause = () => setIsPlaying(false);
    const handleVideoEnded = () => {
      video.currentTime = 0;
      video.play().catch(console.error);
    };

    video.addEventListener('play', handleVideoPlay);
    video.addEventListener('pause', handleVideoPause);
    video.addEventListener('ended', handleVideoEnded);

    // Auto-play vídeo quando ativo
    video.currentTime = 0;
    video.play().catch(console.error);

    return () => {
      video.removeEventListener('play', handleVideoPlay);
      video.removeEventListener('pause', handleVideoPause);
      video.removeEventListener('ended', handleVideoEnded);
    };
  }, [currentContact, currentUpdate]);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    const diff = startY - endY;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
  };

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(console.error);
    }
  };

  const handleOpenChat = async () => {
    if (!currentContact) return;
    
    try {
      const conversation = await createConversation.mutateAsync(currentContact.model_id);
      navigate(`/v2/client/chat?conversation=${conversation.id}`);
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
      <div className="h-[calc(100vh-200px)] flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-zinc-400">Nenhuma atualização disponível</p>
          <p className="text-zinc-500 text-sm mt-2">
            Converse com alguém para ver as atualizações aqui
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`h-[calc(100vh-200px)] bg-black relative snap-start flex items-center justify-center ${
        !isMobile ? 'max-w-md mx-auto' : ''
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Media Content */}
      {currentUpdate.media_type === 'photo' ? (
        <img
          src={currentUpdate.media_url}
          alt="Update"
          className={`absolute inset-0 w-full h-full ${
            isMobile ? 'object-cover' : 'object-contain'
          }`}
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
      ) : (
        <video
          ref={videoRef}
          src={currentUpdate.media_url}
          poster={currentUpdate.thumbnail_url}
          className={`absolute inset-0 w-full h-full ${
            isMobile ? 'object-cover' : 'object-contain'
          }`}
          loop
          muted
          playsInline
          onClick={handleVideoClick}
        />
      )}

      {/* Overlay escuro para melhor legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={currentContact.model_photo}
            alt={currentContact.model_name}
            className="w-10 h-10 rounded-full object-cover border-2 border-white"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <div className="flex-1">
            <p className="text-white font-medium">{currentContact.model_name}</p>
            <p className="text-zinc-300 text-sm">{formatTime(currentUpdate.created_at)}</p>
          </div>
        </div>
        
        {/* Progress bars */}
        <div className="flex gap-1">
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

      {/* Navigation Arrows */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
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

      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
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

      {/* Ações (canto inferior direito) */}
      <div className={`absolute bottom-20 flex flex-col space-y-4 z-10 ${
        isMobile ? 'right-4' : 'right-8'
      }`}>
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white"
        >
          <Heart className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-blue-500/80 hover:bg-blue-500 text-white"
          onClick={handleOpenChat}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white"
        >
          <Share className="w-6 h-6" />
        </Button>
      </div>

      {/* Footer com botão de comentar */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <Button
          onClick={handleOpenChat}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          disabled={createConversation.isPending}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          {createConversation.isPending ? 'Abrindo...' : 'Comentar'}
        </Button>
      </div>

      {/* Indicador de play/pause para vídeos */}
      {!isPlaying && currentUpdate.media_type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1" />
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedReelsView;
