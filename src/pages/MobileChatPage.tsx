
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileConversationsList from '@/components/chat/MobileConversationsList';
import MobileChatInterface from '@/components/chat/MobileChatInterface';
import { useConversations } from '@/hooks/useChat';

const MobileChatPage = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showConversation, setShowConversation] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { data: conversations = [] } = useConversations();

  // Check for conversation ID in URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const conversationId = params.get('conversation');
    if (conversationId) {
      setSelectedConversationId(conversationId);
      setShowConversation(true);
    }
  }, [location.search]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowConversation(true);
    navigate(`/chat?conversation=${conversationId}`);
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const getModelPhoto = (conversation: any) => {
    if (conversation?.models?.photos && conversation.models.photos.length > 0) {
      // Try to get the primary photo first
      const primaryPhoto = conversation.models.photos.find((p: any) => p.is_primary);
      if (primaryPhoto) return primaryPhoto.photo_url;
      
      // If no primary photo, get the first one
      return conversation.models.photos[0].photo_url;
    }
    return '/placeholder.svg';
  };

  // Desktop fallback - redirect to original chat page
  if (!isMobile) {
    navigate('/chat');
    return null;
  }

  if (showConversation && selectedConversationId) {
    return (
      <MobileChatInterface 
        conversationId={selectedConversationId}
        modelName={selectedConversation?.models?.name}
        modelPhoto={getModelPhoto(selectedConversation)}
      />
    );
  }

  return (
    <MobileConversationsList
      onSelectConversation={handleSelectConversation}
      selectedConversationId={selectedConversationId || undefined}
    />
  );
};

export default MobileChatPage;
