import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, LogOut, User, Settings } from 'lucide-react';
import ConversationsList from './ConversationsList';
import ChatInterface from './ChatInterface';

export default function ChatAppLayout() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="h-screen bg-zinc-950 text-white flex flex-col overflow-hidden">
      {/* Header dark melhorado */}
      <header className="border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-white">Prive Chat</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Card do usuário */}
            <div className="hidden sm:flex items-center gap-3 bg-zinc-800/50 rounded-full px-3 py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-zinc-700 text-white text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white truncate max-w-32">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                </span>
                <span className="text-xs text-zinc-400">Online</span>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Chat principal */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Lista de conversas - design dark melhorado */}
        <div className={`
          w-full sm:w-80 bg-zinc-900 border-r border-zinc-800 flex-shrink-0 flex flex-col
          ${selectedConversationId ? 'hidden sm:flex' : 'flex'}
        `}>
          {/* Card do usuário mobile */}
          <div className="sm:hidden p-4 border-b border-zinc-800">
            <div className="flex items-center gap-3 bg-zinc-800/50 rounded-lg p-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-zinc-700 text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-green-400">● Online</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-zinc-400 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <ConversationsList
              onSelectConversation={setSelectedConversationId}
              selectedConversationId={selectedConversationId || undefined}
            />
          </div>
        </div>

        {/* Interface do chat - design dark melhorado */}
        <div className={`
          flex-1 min-w-0 bg-zinc-950
          ${selectedConversationId ? 'block' : 'hidden sm:block'}
        `}>
          {selectedConversationId ? (
            <div className="h-full flex flex-col">
              {/* Botão voltar no mobile */}
              <div className="sm:hidden border-b border-zinc-800 p-3 bg-zinc-900">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedConversationId(null)}
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  ← Voltar
                </Button>
              </div>
              
              <div className="flex-1 bg-zinc-950">
                <ChatInterface conversationId={selectedConversationId} />
              </div>
            </div>
          ) : (
            <div className="h-full bg-zinc-950 flex items-center justify-center">
              <div className="text-center space-y-6 p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto">
                  <MessageSquare className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Bem-vindo ao Prive Chat
                  </h3>
                  <p className="text-zinc-400">
                    Selecione uma conversa para começar a conversar
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}