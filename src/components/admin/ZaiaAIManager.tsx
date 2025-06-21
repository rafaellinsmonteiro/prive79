
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, MessageSquare, PenTool } from 'lucide-react';
import ZaiaAIChat from './ZaiaAIChat';
import ZaiaContentGenerator from './ZaiaContentGenerator';

const ZaiaAIManager = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Bot className="h-6 w-6" />
        <h2 className="text-xl font-semibold text-white">Zaia AI</h2>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="generator">
            <PenTool className="h-4 w-4 mr-2" />
            Gerador de Conteúdo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <ZaiaAIChat />
        </TabsContent>

        <TabsContent value="generator" className="mt-6">
          <ZaiaContentGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ZaiaAIManager;
