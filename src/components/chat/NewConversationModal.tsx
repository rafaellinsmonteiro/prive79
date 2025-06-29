
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateConversation } from '@/hooks/useChat';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Copy } from 'lucide-react';
import { useChatUser } from '@/hooks/useChatUsers';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: (conversationId: string) => void;
}

const NewConversationModal = ({ isOpen, onClose, onConversationCreated }: NewConversationModalProps) => {
  const [receiverChatId, setReceiverChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const createConversation = useCreateConversation();
  const { data: chatUser } = useChatUser();
  const { toast } = useToast();

  const handleCreateConversation = async () => {
    if (!receiverChatId.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o ID do chat",
        variant: "destructive",
      });
      return;
    }

    if (receiverChatId === chatUser?.id) {
      toast({
        title: "Erro",
        description: "Você não pode iniciar uma conversa consigo mesmo",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const conversation = await createConversation.mutateAsync(receiverChatId);
      onConversationCreated(conversation.id);
      setReceiverChatId('');
      onClose();
      toast({
        title: "Sucesso",
        description: "Nova conversa criada!",
      });
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar conversa. Verifique se o ID é válido.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyMyId = () => {
    if (chatUser?.id) {
      navigator.clipboard.writeText(chatUser.id);
      toast({
        title: "ID Copiado!",
        description: "Seu ID do chat foi copiado para a área de transferência.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            Nova Conversa
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Insira o ID do chat da pessoa com quem deseja conversar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Meu ID do Chat */}
          <div className="space-y-2 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
            <Label className="text-blue-200 font-medium">Meu ID do Chat</Label>
            <div className="flex items-center gap-2">
              <Input
                value={chatUser?.id || ''}
                readOnly
                className="bg-blue-900/30 border-blue-600 text-blue-100 font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyMyId}
                className="border-blue-600 text-blue-300 hover:bg-blue-800"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-blue-300">
              Compartilhe este ID com outras pessoas para que elas possam iniciar uma conversa com você
            </p>
          </div>

          {/* ID do Destinatário */}
          <div className="space-y-2">
            <Label htmlFor="receiver-id" className="text-white">
              ID do Chat do Destinatário
            </Label>
            <Input
              id="receiver-id"
              placeholder="Cole aqui o ID do chat da pessoa..."
              value={receiverChatId}
              onChange={(e) => setReceiverChatId(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateConversation}
              disabled={loading || !receiverChatId.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Criando...' : 'Iniciar Conversa'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationModal;
