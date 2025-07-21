import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  MoreHorizontal,
  Eye,
  Bookmark
} from 'lucide-react';
import { useCreateConversation } from '@/hooks/useChat';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ReelItemProps {
  reel: {
    id: string;
    model_id: string;
    model_name: string;
    model_photo?: string;
    media_url: string;
    media_type: 'video' | 'image';
    caption?: string;
    likes_count?: number;
    comments_count?: number;
    views_count?: number;
    is_liked?: boolean;
    created_at: string;
    is_online?: boolean;
    duration?: number;
  };
  onLike?: (reelId: string) => void;
  onComment?: (reelId: string) => void;
  onShare?: (reelId: string) => void;
  onSave?: (reelId: string) => void;
  isActive?: boolean;
}

const ReelItem: React.FC<ReelItemProps> = ({
  reel,
  onLike,
  onComment,
  onShare,
  onSave,
  isActive = false
}) => {
  const navigate = useNavigate();
  const createConversation = useCreateConversation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const { user } = useAuth();

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleOpenChat = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('model_id', reel.model_id)
      .eq('user_id', user?.id)
      .eq('is_active', true);

    try {
      const existingConversation = conversations?.[0];

      if (existingConversation) {
        // Se já existe uma conversa, navegar para ela
        navigate(`/v2/chat?conversation=${existingConversation.id}`);
      } else {
        // Se não existe, criar uma nova conversa
        const conversation = await createConversation.mutateAsync(reel.model_id);
        navigate(`/v2/chat?conversation=${conversation.id}`);
      }
    } catch (error) {
      console.error('Erro ao acessar conversa:', error);
      // Fallback: navegar para chat geral
      navigate('/v2/chat');
    }
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/modelo/${reel.model_id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <Card 
      className="bg-zinc-900 border-zinc-700 overflow-hidden relative h-full"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={reel.model_photo || '/placeholder.svg'}
                alt={reel.model_name}
                className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-white"
                onClick={handleViewProfile}
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              {reel.is_online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            
            <div>
              <button
                onClick={handleViewProfile}
                className="font-semibold text-white hover:text-pink-400 transition-colors text-sm"
              >
                {reel.model_name}
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-300">
                  {formatDate(reel.created_at)}
                </span>
                {reel.is_online && (
                  <Badge className="bg-green-500 text-white border-0 text-xs px-2 py-0.5">
                    Online
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:text-pink-400 hover:bg-black/20"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Media */}
      <div className="relative aspect-[9/16] bg-black overflow-hidden">
        {reel.media_type === 'video' ? (
          <>
            <video
              ref={videoRef}
              src={reel.media_url}
              className="w-full h-full object-cover cursor-pointer"
              loop
              muted={isMuted}
              autoPlay={isActive}
              onClick={handleVideoClick}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={(e) => {
                console.error('Video error:', e);
              }}
            />
            
            {/* Video Controls */}
            {(showControls || !isPlaying) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleVideoClick}
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full p-4 opacity-80 hover:opacity-100"
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8" />
                  ) : (
                    <Play className="h-8 w-8" />
                  )}
                </Button>
              </div>
            )}
            
            {/* Mute Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="absolute top-20 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </>
        ) : (
          <img
            src={reel.media_url}
            alt="Reel"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        )}
      </div>

      {/* Side Actions */}
      <div className="absolute right-4 bottom-20 z-10 flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLike?.(reel.id)}
          className={`rounded-full p-3 bg-black/50 hover:bg-black/70 ${
            reel.is_liked ? 'text-pink-400' : 'text-white'
          }`}
        >
          <Heart className={`h-6 w-6 ${reel.is_liked ? 'fill-current' : ''}`} />
        </Button>
        <span className="text-white text-xs text-center">
          {reel.likes_count ? formatNumber(reel.likes_count) : 0}
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenChat}
          className="rounded-full p-3 bg-black/50 hover:bg-black/70 text-white hover:text-pink-400"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
        <span className="text-white text-xs text-center">
          {reel.comments_count ? formatNumber(reel.comments_count) : 0}
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onShare?.(reel.id)}
          className="rounded-full p-3 bg-black/50 hover:bg-black/70 text-white"
        >
          <Share2 className="h-6 w-6" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSave?.(reel.id)}
          className="rounded-full p-3 bg-black/50 hover:bg-black/70 text-white"
        >
          <Bookmark className="h-6 w-6" />
        </Button>
      </div>

      {/* Caption and Stats */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/80 to-transparent">
        {reel.caption && (
          <p className="text-white mb-2 text-sm line-clamp-2">{reel.caption}</p>
        )}
        
        {/* Bottom Stats */}
        <div className="flex items-center justify-between text-zinc-300 text-xs">
          {reel.views_count && (
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{formatNumber(reel.views_count)} visualizações</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ReelItem;
