
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
        modelPhoto={selectedConversation?.models?.avatar_url}
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
