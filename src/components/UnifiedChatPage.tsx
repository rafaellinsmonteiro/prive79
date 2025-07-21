
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import ConversationsList from '@/components/chat/ConversationsList';
import ChatInterface from '@/components/chat/ChatInterface';
import V2VipModel from '@/components/V2VipModel';
import { V2ClientLayout } from '@/components/V2ClientLayout';
import { useUserType } from '@/hooks/useUserType';
import { useAuth } from '@/contexts/AuthContext';

const UnifiedChatPage = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { user } = useAuth();
  const { getUserType } = useUserType();
  const [userType, setUserType] = React.useState<'admin' | 'modelo' | 'cliente' | null>(null);

  React.useEffect(() => {
    const checkUserType = async () => {
      if (user) {
        const type = await getUserType();
        setUserType(type);
      }
    };
    checkUserType();
  }, [user, getUserType]);

  const chatContent = (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Lista de Conversas */}
      <div className="lg:col-span-1 h-full">
        <ConversationsList
          onSelectConversation={setSelectedConversationId}
          selectedConversationId={selectedConversationId || undefined}
        />
      </div>

      {/* Interface do Chat */}
      <div className="lg:col-span-2 h-full">
        {selectedConversationId ? (
          <ChatInterface conversationId={selectedConversationId} />
        ) : (
          <Card className="bg-card border-border h-full flex items-center justify-center">
            <CardContent>
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Selecione uma conversa
                </h3>
                <p className="text-muted-foreground">
                  Escolha uma conversa da lista para começar a conversar
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  if (!userType) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-100">Carregando...</div>
      </div>
    );
  }

  if (userType === 'modelo') {
    return (
      <V2VipModel 
        title="Conversas"
        subtitle="Gerencie suas conversas e comunicações."
        activeId="chat"
      >
        {chatContent}
      </V2VipModel>
    );
  }

  // Para cliente
  return (
    <V2ClientLayout 
      title="Chat" 
      subtitle="Suas conversas" 
      activeId="chat"
    >
      <div className="p-6">
        {chatContent}
      </div>
    </V2ClientLayout>
  );
};

export default UnifiedChatPage;
