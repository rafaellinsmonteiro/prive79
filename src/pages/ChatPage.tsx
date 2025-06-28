
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ConversationsList from '@/components/chat/ConversationsList';
import ChatInterface from '@/components/chat/ChatInterface';
import { MessageCircle } from 'lucide-react';

const ChatPage = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="h-6 w-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Chat</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Conversas */}
          <div className="lg:col-span-1">
            <ConversationsList
              onSelectConversation={setSelectedConversationId}
              selectedConversationId={selectedConversationId || undefined}
            />
          </div>

          {/* Interface do Chat */}
          <div className="lg:col-span-2">
            {selectedConversationId ? (
              <ChatInterface conversationId={selectedConversationId} />
            ) : (
              <Card className="bg-zinc-900 border-zinc-700 h-[600px] flex items-center justify-center">
                <CardContent>
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      Selecione uma conversa
                    </h3>
                    <p className="text-zinc-400">
                      Escolha uma conversa da lista para começar a conversar
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
