import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Calendar, Heart, Star, MapPin } from 'lucide-react';
import { useCreateConversation } from '@/hooks/useChat';
import { useNavigate } from 'react-router-dom';

interface ContactUpdatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: {
    id: string;
    model_id: string;
    name: string;
    photo_url?: string;
    last_message_content?: string;
    last_message_at?: string;
    is_online?: boolean;
    age?: number;
    location?: string;
    rating?: number;
    price?: number;
  };
}

const ContactUpdatesModal: React.FC<ContactUpdatesModalProps> = ({
  isOpen,
  onClose,
  contact
}) => {
  const navigate = useNavigate();
  const createConversation = useCreateConversation();

  const handleOpenChat = async () => {
    try {
      const conversation = await createConversation.mutateAsync(contact.model_id);
      navigate(`/v2/chat?conversation=${conversation.id}`);
      onClose();
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleViewProfile = () => {
    navigate(`/modelo/${contact.model_id}`);
    onClose();
  };

  const formatLastMessageTime = (timestamp?: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-white">Informações do Contato</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Foto e Info Principal */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={contact.photo_url || '/placeholder.svg'}
                alt={contact.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              {contact.is_online && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-zinc-900"></div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-white">{contact.name}</h3>
                {contact.is_online && (
                  <Badge className="bg-green-500 text-white border-0 text-xs">
                    Online
                  </Badge>
                )}
              </div>
              
              {contact.age && (
                <p className="text-sm text-zinc-400">{contact.age} anos</p>
              )}
              
              {contact.location && (
                <div className="flex items-center gap-1 text-zinc-400 text-sm">
                  <MapPin className="h-3 w-3" />
                  <span>{contact.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Rating e Preço */}
          <div className="flex items-center justify-between">
            {contact.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-zinc-300">{contact.rating}</span>
              </div>
            )}
            
            {contact.price && (
              <div className="text-pink-400 font-semibold">
                R$ {contact.price}/hora
              </div>
            )}
          </div>

          {/* Última Mensagem */}
          {contact.last_message_content && (
            <div className="bg-zinc-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-400">Última mensagem</span>
                <span className="text-xs text-zinc-500">
                  {formatLastMessageTime(contact.last_message_at)}
                </span>
              </div>
              <p className="text-sm text-zinc-300 truncate">
                {contact.last_message_content}
              </p>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <Button
              onClick={handleOpenChat}
              className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Conversar
            </Button>
            
            <Button
              onClick={handleViewProfile}
              variant="outline"
              className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            >
              Ver Perfil
            </Button>
          </div>

          {/* Botões Secundários */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-zinc-600 text-zinc-400 hover:bg-zinc-800"
            >
              <Heart className="h-4 w-4 mr-1" />
              Favoritar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-zinc-600 text-zinc-400 hover:bg-zinc-800"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Agendar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactUpdatesModal;
