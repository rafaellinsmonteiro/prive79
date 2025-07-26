
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Settings, BarChart3, Users, FileText } from 'lucide-react';
import ChatSettings from './ChatSettings';
import ConversationsMonitor from './ConversationsMonitor';
import ChatStats from './ChatStats';
import ChatUsersManager from './ChatUsersManager';
import ChatLogsManager from './ChatLogsManager';

const ChatManager = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-6 w-6" />
        <h2 className="text-xl font-semibold text-white">Gerenciamento de Chat</h2>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="conversations">
            <MessageCircle className="h-4 w-4 mr-2" />
            Conversas
          </TabsTrigger>
          <TabsTrigger value="logs">
            <FileText className="h-4 w-4 mr-2" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="h-4 w-4 mr-2" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <ChatUsersManager />
        </TabsContent>

        <TabsContent value="conversations" className="mt-6">
          <ConversationsMonitor />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <ChatLogsManager />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <ChatStats />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <ChatSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatManager;
