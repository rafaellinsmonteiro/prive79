import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Plus, UserPlus, MessageSquare, Trash2 } from 'lucide-react';
import { useCreateConversation } from '@/hooks/useChat';
import { useContacts, useAddContact, useDeleteContact } from '@/hooks/useContacts';
import { toast } from '@/hooks/use-toast';

interface ContactsViewProps {
  onStartConversation?: (conversationId: string) => void;
}

const ContactsView: React.FC<ContactsViewProps> = ({ onStartConversation }) => {
  const [isConversationDialogOpen, setIsConversationDialogOpen] = useState(false);
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
  const [modelId, setModelId] = useState('');
  const [contactChatId, setContactChatId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const createConversation = useCreateConversation();
  const { data: contacts = [], isLoading } = useContacts();
  const addContact = useAddContact();
  const deleteContact = useDeleteContact();

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
      console.log('Creating conversation for model ID:', modelId);
      const conversation = await createConversation.mutateAsync(modelId);
      console.log('Conversation created successfully:', conversation);
      
      setIsConversationDialogOpen(false);
      setModelId('');
      
      toast({
        title: "Sucesso",
        description: `Conversa iniciada com ${conversation.models?.name || 'modelo'}!`,
      });

      // Notificar o componente pai para navegar para a conversa
      if (onStartConversation) {
        onStartConversation(conversation.id);
      }
    } catch (error: any) {
      console.error('Erro ao criar conversa:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao iniciar conversa. Verifique o ID do modelo.",
        variant: "destructive",
      });
    }
  };

  const handleAddContact = async () => {
    if (!contactChatId.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um ID de chat válido",
        variant: "destructive",
      });
      return;
    }

    try {
      await addContact.mutateAsync(contactChatId);
      setIsAddContactDialogOpen(false);
      setContactChatId('');
    } catch (error: any) {
      console.error('Erro ao adicionar contato:', error);
    }
  };

  const handleStartConversationWithContact = async (contact: any) => {
    if (contact.is_model && contact.model_id) {
      try {
        const conversation = await createConversation.mutateAsync(contact.model_id);
        
        toast({
          title: "Sucesso",
          description: `Conversa iniciada com ${contact.contact_name}!`,
        });

        if (onStartConversation) {
          onStartConversation(conversation.id);
        }
      } catch (error: any) {
        console.error('Erro ao iniciar conversa:', error);
        toast({
          title: "Erro",
          description: error.message || "Erro ao iniciar conversa",
          variant: "destructive",
        });
      }
    }
  };

  // Filtrar contatos por pesquisa
  const filteredContacts = contacts.filter(contact => 
    contact.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.contact_user_info?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.contact_user_info?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-zinc-950 h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-zinc-800 p-4 bg-zinc-900">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Contatos</h2>
          <div className="flex gap-2">
            {/* Iniciar Nova Conversa */}
            <Dialog open={isConversationDialogOpen} onOpenChange={setIsConversationDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <MessageSquare className="h-5 w-5" />
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
                      onClick={() => setIsConversationDialogOpen(false)}
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
            
            {/* Adicionar Contato */}
            <Dialog open={isAddContactDialogOpen} onOpenChange={setIsAddContactDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <UserPlus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800">
                <DialogHeader>
                  <DialogTitle className="text-white">Adicionar Contato</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">
                      ID do Chat
                    </label>
                    <Input
                      value={contactChatId}
                      onChange={(e) => setContactChatId(e.target.value)}
                      placeholder="Insira o ID do chat..."
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      O ID do chat é usado para identificar e adicionar a pessoa como contato
                    </p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => setIsAddContactDialogOpen(false)}
                      className="text-zinc-400 hover:text-white"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleAddContact}
                      disabled={addContact.isPending}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                      {addContact.isPending ? 'Adicionando...' : 'Adicionar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Pesquisar contatos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 pl-10 rounded-lg h-10 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-zinc-400">
            Carregando contatos...
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-4 text-center text-zinc-400">
            {searchTerm ? 'Nenhum contato encontrado' : 'Nenhum contato adicionado ainda'}
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="p-4 hover:bg-zinc-900/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={contact.contact_photo_url || contact.model_info?.photo_url || '/placeholder.svg'} 
                        alt={contact.contact_name || 'Contato'} 
                      />
                      <AvatarFallback className="bg-zinc-700 text-white">
                        {(contact.contact_name || contact.contact_user_info?.name || 'C').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Status online placeholder - seria implementado com real-time */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-zinc-600 rounded-full border-2 border-zinc-950"></div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">
                      {contact.contact_name || contact.contact_user_info?.name || 'Contato'}
                    </h4>
                    <p className="text-sm text-zinc-400">
                      {contact.is_model ? 'Modelo' : 'Cliente'} 
                      {contact.contact_user_info?.email && ` • ${contact.contact_user_info.email}`}
                    </p>
                    {contact.added_automatically && (
                      <p className="text-xs text-purple-400">Adicionado automaticamente</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {/* Botão de conversar */}
                    {contact.is_model && contact.model_id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartConversationWithContact(contact)}
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                        disabled={createConversation.isPending}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {/* Botão de remover */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteContact.mutate(contact.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      disabled={deleteContact.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsView;