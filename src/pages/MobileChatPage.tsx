
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileConversationsList from '@/components/chat/MobileConversationsList';
import MobileChatInterface from '@/components/chat/MobileChatInterface';
import { useConversations, useIsUserModel, getConversationDisplayName, getConversationDisplayPhoto } from '@/hooks/useChat';

const MobileChatPage = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showConversation, setShowConversation] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { data: conversations = [] } = useConversations();
  const { data: isModel = false } = useIsUserModel();

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

  // Get the correct display name and photo based on user type
  const getDisplayName = (conversation: any) => {
    return getConversationDisplayName(conversation, isModel);
  };

  const getDisplayPhoto = (conversation: any) => {
    return getConversationDisplayPhoto(conversation, isModel);
  };

  // Get model ID for contact info (only when user is client)
  const getContactModelId = (conversation: any) => {
    return isModel ? undefined : conversation?.model_id;
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
        modelName={getDisplayName(selectedConversation)}
        modelPhoto={getDisplayPhoto(selectedConversation)}
        modelId={getContactModelId(selectedConversation)}
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
