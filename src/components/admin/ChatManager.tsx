
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Settings, BarChart3 } from 'lucide-react';
import ChatSettings from './ChatSettings';
import ConversationsMonitor from './ConversationsMonitor';
import ChatStats from './ChatStats';

const ChatManager = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-6 w-6" />
        <h2 className="text-xl font-semibold text-white">Gerenciamento de Chat</h2>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="conversations">
            <MessageCircle className="h-4 w-4 mr-2" />
            Conversas
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="h-4 w-4 mr-2" />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-6">
          <ChatSettings />
        </TabsContent>

        <TabsContent value="conversations" className="mt-6">
          <ConversationsMonitor />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <ChatStats />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatManager;
