import React, { useState } from 'react';
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
  Eye 
} from 'lucide-react';
import { useCreateConversation } from '@/hooks/useChat';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FeedReelsViewProps {
  contacts: Array<{
    model_id: string;
    model_name: string;
    model_photo: string;
    last_conversation_at: string;
    updates: any[];
  }>;
  onLike?: (reelId: string) => void;
  onComment?: (reelId: string) => void;
  onShare?: (reelId: string) => void;
}

const FeedReelsView: React.FC<FeedReelsViewProps> = ({
  contacts,
  onLike,
  onComment,
  onShare
}) => {
  const navigate = useNavigate();
  const createConversation = useCreateConversation();
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set());
  const [mutedVideos, setMutedVideos] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const toggleVideoPlay = (reelId: string) => {
    setPlayingVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reelId)) {
        newSet.delete(reelId);
      } else {
        newSet.add(reelId);
      }
      return newSet;
    });
  };

  const toggleVideoMute = (reelId: string) => {
    setMutedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reelId)) {
        newSet.delete(reelId);
      } else {
        newSet.add(reelId);
      }
      return newSet;
    });
  };

  const handleOpenChat = async (modelId: string) => {
    const currentContact = contacts.find(c => c.model_id === modelId);
    if (!currentContact) return;
    
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('model_id', modelId)
      .eq('user_id', user?.id)
      .eq('is_active', true);

    try {
      const existingConversation = conversations?.[0];

      if (existingConversation) {
        // Se já existe uma conversa, navegar para ela
        navigate(`/v2/chat?conversation=${existingConversation.id}`);
      } else {
        // Se não existe, criar uma nova conversa
        const conversation = await createConversation.mutateAsync(currentContact.model_id);
        navigate(`/v2/chat?conversation=${conversation.id}`);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleViewProfile = (modelId: string) => {
    navigate(`/modelo/${modelId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  // Convert contacts to reels format
  const reels = contacts.map(contact => ({
    id: `contact-${contact.model_id}`,
    model_id: contact.model_id,
    model_name: contact.model_name,
    model_photo: contact.model_photo,
    media_url: contact.model_photo || '/placeholder.svg',
    media_type: 'image' as const,
    caption: `${contact.updates.length} atualizações`,
    likes_count: 0,
    comments_count: 0,
    views_count: 0,
    is_liked: false,
    created_at: contact.last_conversation_at || new Date().toISOString(),
    is_online: false,
  }));

  return (
    <div className="space-y-6">
      {reels.map((reel) => (
        <Card key={reel.id} className="bg-zinc-900 border-zinc-700 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-700">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={reel.model_photo || '/placeholder.svg'}
                  alt={reel.model_name}
                  className="w-10 h-10 rounded-full object-cover cursor-pointer"
                  onClick={() => handleViewProfile(reel.model_id)}
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                {reel.is_online && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900"></div>
                )}
              </div>
              
              <div>
                <button
                  onClick={() => handleViewProfile(reel.model_id)}
                  className="font-semibold text-white hover:text-pink-400 transition-colors"
                >
                  {reel.model_name}
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">
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
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenChat(reel.model_id)}
                className="text-pink-400 hover:text-pink-300 hover:bg-zinc-800"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Media */}
          <div className="relative aspect-[9/16] bg-black overflow-hidden">
            <img
              src={reel.media_url}
              alt="Reel"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>

          {/* Caption and Stats */}
          <CardContent className="p-4">
            {reel.caption && (
              <p className="text-white mb-3 text-sm">{reel.caption}</p>
            )}
            
            {/* Stats */}
            <div className="flex items-center justify-between text-zinc-400 text-sm">
              <div className="flex items-center gap-4">
                {reel.views_count && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{reel.views_count}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{reel.likes_count || 0}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{reel.comments_count || 0}</span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShare?.(reel.id)}
                className="text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 p-1"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>

          {/* Action Buttons */}
          <div className="flex border-t border-zinc-700">
            <Button
              variant="ghost"
              className={`flex-1 py-3 rounded-none ${
                reel.is_liked ? 'text-pink-400' : 'text-zinc-400 hover:text-pink-400'
              }`}
              onClick={() => onLike?.(reel.id)}
            >
              <Heart className={`h-4 w-4 mr-2 ${reel.is_liked ? 'fill-current' : ''}`} />
              Curtir
            </Button>
            
            <Button
              variant="ghost"
              className="flex-1 py-3 rounded-none text-zinc-400 hover:text-zinc-300"
              onClick={() => onComment?.(reel.id)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Comentar
            </Button>
            
            <Button
              variant="ghost"
              className="flex-1 py-3 rounded-none text-zinc-400 hover:text-zinc-300"
              onClick={() => onShare?.(reel.id)}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FeedReelsView;