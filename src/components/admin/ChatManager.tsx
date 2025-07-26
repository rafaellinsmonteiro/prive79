
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
    <div>
      {/* Tabs Navigation */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-zinc-900 border-zinc-800 mb-6">
          <TabsTrigger 
            value="users" 
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
          >
              <Users className="h-4 w-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger 
              value="conversations"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Conversas
            </TabsTrigger>
            <TabsTrigger 
              value="logs"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
            >
              <FileText className="h-4 w-4 mr-2" />
              Logs
            </TabsTrigger>
            <TabsTrigger 
              value="stats"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="users" className="mt-0">
            <ChatUsersManager />
          </TabsContent>

          <TabsContent value="conversations" className="mt-0">
            <ConversationsMonitor />
          </TabsContent>

          <TabsContent value="logs" className="mt-0">
            <ChatLogsManager />
          </TabsContent>

          <TabsContent value="stats" className="mt-0">
            <ChatStats />
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <ChatSettings />
          </TabsContent>
        </Tabs>
    </div>
  );
};

export default ChatManager;
