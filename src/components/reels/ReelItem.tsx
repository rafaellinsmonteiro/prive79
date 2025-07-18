import { useState, useRef, useEffect } from "react";
import { Model } from "@/hooks/useModels";
import { useModelMedia } from "@/hooks/useModelMedia";
import { ReelsSettings } from "@/hooks/useReelsSettings";
import { Heart, MessageCircle, Share, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useConversations, useCreateConversation } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";

interface ReelItemProps {
  model: Model;
  isActive: boolean;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  settings?: ReelsSettings | null;
  isMobile: boolean;
}

const ReelItem = ({ model, isActive, onSwipeUp, onSwipeDown, settings, isMobile }: ReelItemProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startY, setStartY] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: conversations = [] } = useConversations();
  const createConversation = useCreateConversation();
  const { data: mediaItems = [] } = useModelMedia(model.id);

  // Pegar apenas vídeos para exibir nos reels
  const videoItem = mediaItems.find(item => item.media_type === 'video');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoPlay = () => {
      console.log('Video started playing');
      setIsPlaying(true);
    };

    const handleVideoPause = () => {
      console.log('Video paused');
      setIsPlaying(false);
    };

    const handleVideoEnded = () => {
      console.log('Video ended, restarting...');
      video.currentTime = 0;
      // Sempre tentar reproduzir quando ativo, independente das configurações
      if (isActive) {
        video.play().catch(console.error);
      }
    };

    video.addEventListener('play', handleVideoPlay);
    video.addEventListener('pause', handleVideoPause);
    video.addEventListener('ended', handleVideoEnded);

    // Controle de reprodução baseado no estado ativo - usar autoplay por padrão se settings for null/undefined
    const shouldAutoPlay = settings?.auto_play !== false; // Default para true se settings for null/undefined
    
    if (isActive && shouldAutoPlay && videoItem) {
      console.log('Starting video for active reel (autoplay:', shouldAutoPlay, ')');
      video.currentTime = 0;
      video.play().then(() => {
        console.log('Video play successful');
      }).catch((error) => {
        console.error('Video play failed:', error);
        // Tentar novamente após um pequeno delay
        setTimeout(() => {
          video.play().catch(console.error);
        }, 100);
      });
    } else if (!isActive) {
      console.log('Pausing video for inactive reel');
      video.pause();
      setIsPlaying(false);
    }

    return () => {
      video.removeEventListener('play', handleVideoPlay);
      video.removeEventListener('pause', handleVideoPause);
      video.removeEventListener('ended', handleVideoEnded);
    };
  }, [isActive, settings?.auto_play, videoItem]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    const diff = startY - endY;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        onSwipeUp();
      } else {
        onSwipeDown();
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

  const handleProfileClick = () => {
    navigate(`/modelo/${model.id}`);
  };

  const handleMessageClick = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // Procurar por uma conversa existente com esta modelo
      const existingConversation = conversations.find(
        conversation => conversation.model_id === model.id
      );

      if (existingConversation) {
        // Se já existe uma conversa, navegar para ela
        navigate(`/chat?conversation=${existingConversation.id}`);
      } else {
        // Se não existe, criar uma nova conversa
        const conversation = await createConversation.mutateAsync(model.id);
        navigate(`/chat?conversation=${conversation.id}`);
      }
    } catch (error) {
      console.error('Erro ao acessar conversa:', error);
      // Fallback: navegar para chat geral
      navigate('/chat');
    }
  };

  return (
    <div 
      className={`relative h-screen w-full snap-start bg-black flex items-center justify-center ${
        !isMobile ? 'max-w-md mx-auto' : ''
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Apenas vídeos nos reels */}
      {videoItem ? (
        <video
          ref={videoRef}
          src={videoItem.media_url}
          className={`absolute inset-0 w-full h-full ${
            isMobile ? 'object-cover' : 'object-contain'
          }`}
          loop
          muted
          playsInline
          preload={isActive ? "auto" : "none"}
          controls={settings?.show_controls}
          onClick={!settings?.show_controls ? handleVideoClick : undefined}
          poster={videoItem.thumbnail_url}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gray-800 flex items-center justify-center">
          <User className="w-24 h-24 text-gray-400" />
          <p className="text-white mt-4">Nenhum vídeo disponível</p>
        </div>
      )}

      {/* Overlay escuro para melhor legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

      {/* Informações da modelo (canto inferior esquerdo) */}
      <div className={`absolute bottom-20 text-white z-10 ${
        isMobile ? 'left-4' : 'left-8'
      }`}>
        <h2 className="text-2xl font-bold mb-2">{model.name}</h2>
        <p className="text-lg mb-1">{model.age} anos</p>
        {model.neighborhood && (
          <div className="flex items-center mb-2">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-sm">{model.neighborhood}</span>
          </div>
        )}
        {model.description && (
          <p className="text-sm opacity-90 max-w-xs line-clamp-2">{model.description}</p>
        )}
      </div>

      {/* Ações (canto inferior direito) */}
      <div className={`absolute bottom-20 flex flex-col space-y-4 z-10 ${
        isMobile ? 'right-4' : 'right-14'
      }`}>
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white"
          onClick={handleProfileClick}
        >
          <User className="w-6 h-6" />
        </Button>

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
          onClick={handleMessageClick}
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

      {/* Indicador de play/pause */}
      {!isPlaying && videoItem && !settings?.show_controls && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReelItem;
