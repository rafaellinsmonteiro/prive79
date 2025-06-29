
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileConversationsList from '@/components/chat/MobileConversationsList';
import MobileChatInterface from '@/components/chat/MobileChatInterface';
import { useConversations } from '@/hooks/useChat';
import { useChatUser } from '@/hooks/useChatUsers';

const MobileChatPage = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showConversation, setShowConversation] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { data: conversations = [] } = useConversations();
  const { data: chatUser } = useChatUser();

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

  const handleBackToList = () => {
    setShowConversation(false);
    setSelectedConversationId(null);
    navigate('/chat');
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const getOtherParticipant = (conversation: any) => {
    if (!chatUser) return null;
    
    if (conversation.sender_chat_user?.id === chatUser.id) {
      return conversation.receiver_chat_user;
    } else {
      return conversation.sender_chat_user;
    }
  };

  // Desktop fallback - redirect to original chat page
  if (!isMobile) {
    navigate('/chat');
    return null;
  }

  if (showConversation && selectedConversationId) {
    const otherParticipant = selectedConversation ? getOtherParticipant(selectedConversation) : null;
    
    return (
      <MobileChatInterface 
        conversationId={selectedConversationId}
        modelName={otherParticipant?.chat_display_name || 'Chat'}
        modelPhoto={undefined}
        modelId={undefined}
        onBack={handleBackToList}
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
