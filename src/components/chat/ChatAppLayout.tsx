import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, LogOut, User } from 'lucide-react';
import ConversationsList from './ConversationsList';
import ChatInterface from './ChatInterface';

export default function ChatAppLayout() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header minimalista */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">Prive Chat</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Chat principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Lista de conversas - desktop sempre visível, mobile condicional */}
        <div className={`
          w-full sm:w-80 bg-card border-r border-border flex-shrink-0
          ${selectedConversationId ? 'hidden sm:block' : 'block'}
        `}>
          <ConversationsList
            onSelectConversation={setSelectedConversationId}
            selectedConversationId={selectedConversationId || undefined}
          />
        </div>

        {/* Interface do chat */}
        <div className={`
          flex-1 min-w-0
          ${selectedConversationId ? 'block' : 'hidden sm:block'}
        `}>
          {selectedConversationId ? (
            <div className="h-full flex flex-col">
              {/* Botão voltar no mobile */}
              <div className="sm:hidden border-b border-border p-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedConversationId(null)}
                  className="text-muted-foreground"
                >
                  ← Voltar
                </Button>
              </div>
              
              <div className="flex-1">
                <ChatInterface conversationId={selectedConversationId} />
              </div>
            </div>
          ) : (
            <Card className="h-full bg-card/50 flex items-center justify-center">
              <CardContent>
                <div className="text-center space-y-4">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Bem-vindo ao Prive Chat
                    </h3>
                    <p className="text-muted-foreground">
                      Selecione uma conversa para começar a conversar
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}