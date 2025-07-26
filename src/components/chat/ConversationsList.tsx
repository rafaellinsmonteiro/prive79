
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, Plus, Search, MoreVertical, MessageSquare } from 'lucide-react';
import { useConversations, useCreateConversation, useIsUserModel, getConversationDisplayName, getConversationDisplayPhoto } from '@/hooks/useChat';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

interface ConversationsListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

const ConversationsList = ({ onSelectConversation, selectedConversationId }: ConversationsListProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [modelId, setModelId] = useState('');
  const { data: conversations = [] } = useConversations();
  const { data: isModel = false } = useIsUserModel();
  const createConversation = useCreateConversation();

  const handleCreateConversation = async () => {
    if (!modelId.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um ID de modelo válido",
        variant: "destructive",
      });
      return;
    }

    try {
      const conversation = await createConversation.mutateAsync(modelId);
      setIsDialogOpen(false);
      setModelId('');
      onSelectConversation(conversation.id);
      
      toast({
        title: "Sucesso", 
        description: "Conversa iniciada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      toast({
        title: "Erro",
        description: "Erro ao iniciar conversa. Verifique o ID do modelo.",
        variant: "destructive",
      });
    }
  };

  const getLastMessageDisplay = (conversation: any) => {
    if (!conversation.last_message_content) {
      return 'Inicie uma conversa...';
    }
    return conversation.last_message_content;
  };

  return (
    <div className="bg-zinc-900 h-full flex flex-col">
      <div className="border-b border-zinc-800 p-4 bg-zinc-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-white">Conversas</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Pesquisar conversas..."
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 pl-10 rounded-lg h-10 focus:border-purple-500 transition-all duration-200"
          />
        </div>
      </div>

      <div className="p-0 flex-1 overflow-hidden">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <div className="bg-zinc-800/50 rounded-2xl p-6 mb-4">
              <MessageCircle className="h-12 w-12 text-zinc-400 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Nenhuma conversa</h3>
            <p className="text-zinc-400 text-center mb-6 text-sm">
              Comece uma nova conversa com suas modelos favoritas
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg px-6 py-2 transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Conversa
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800">
                <DialogHeader>
                  <DialogTitle className="text-white">Iniciar Nova Conversa</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">
                      ID do Modelo
                    </label>
                    <Input
                      value={modelId}
                      onChange={(e) => setModelId(e.target.value)}
                      placeholder="Insira o ID do modelo..."
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => setIsDialogOpen(false)}
                      className="text-zinc-400 hover:text-white"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCreateConversation}
                      disabled={createConversation.isPending}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      {createConversation.isPending ? 'Criando...' : 'Iniciar Conversa'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="relative overflow-y-auto h-full">
            <div className="divide-y divide-zinc-800">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full p-4 flex items-center space-x-3 hover:bg-zinc-800/50 transition-all duration-200 group ${
                    selectedConversationId === conversation.id ? 'bg-zinc-800 border-r-2 border-purple-500' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={getConversationDisplayPhoto(conversation, isModel)}
                      alt={getConversationDisplayName(conversation, isModel)}
                      className="w-12 h-12 rounded-full object-cover border-2 border-zinc-700 group-hover:border-purple-500/50 transition-colors"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-900"></div>
                  </div>
                  
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-semibold truncate group-hover:text-purple-400 transition-colors">
                        {getConversationDisplayName(conversation, isModel)}
                      </h4>
                      <span className="text-xs text-zinc-400 ml-2 flex-shrink-0">
                        {conversation.last_message_at &&
                          format(new Date(conversation.last_message_at), 'HH:mm', {
                            locale: ptBR,
                          })}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 truncate">
                      {getLastMessageDisplay(conversation)}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Botão flutuante para nova conversa */}
            <div className="absolute bottom-4 right-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full w-14 h-14 shadow-lg">
                    <Plus className="h-6 w-6" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-white">Iniciar Nova Conversa</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-zinc-400 mb-2 block">
                        ID do Modelo
                      </label>
                      <Input
                        value={modelId}
                        onChange={(e) => setModelId(e.target.value)}
                        placeholder="Insira o ID do modelo..."
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        onClick={() => setIsDialogOpen(false)}
                        className="text-zinc-400 hover:text-white"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCreateConversation}
                        disabled={createConversation.isPending}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      >
                        {createConversation.isPending ? 'Criando...' : 'Iniciar Conversa'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsList;
