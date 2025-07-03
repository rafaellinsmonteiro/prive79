import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, CheckCheck, Play, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';

interface EnhancedMessageItemProps {
  message: Tables<'messages'>;
}

const EnhancedMessageItem = ({ message }: EnhancedMessageItemProps) => {
  const { user } = useAuth();
  
  // A mensagem é "minha" se eu enviei ela
  const isFromCurrentUser = message.sender_id === user?.id;
  
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return <Check className="h-3 w-3 text-zinc-500" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-zinc-500" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const renderMediaContent = () => {
    if (!message.media_url) return null;

    switch (message.message_type) {
      case 'image':
        return (
          <img
            src={message.media_url}
            alt="Imagem enviada"
            className="max-w-xs rounded-lg cursor-pointer"
            onClick={() => window.open(message.media_url!, '_blank')}
          />
        );
      
      case 'video':
        return (
          <div className="relative max-w-xs">
            <video
              src={message.media_url}
              controls
              className="rounded-lg w-full"
              style={{ maxHeight: '300px' }}
            />
          </div>
        );
      
      case 'audio':
        return (
          <div className="flex items-center space-x-2 bg-zinc-800 p-3 rounded-lg max-w-xs">
            <Button variant="ghost" size="sm">
              <Play className="h-4 w-4" />
            </Button>
            <audio src={message.media_url} controls className="flex-1" />
          </div>
        );
      
      case 'file':
        return (
          <div className="flex items-center space-x-2 bg-zinc-800 p-3 rounded-lg max-w-xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(message.media_url!, '_blank')}
            >
              <Download className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <p className="text-sm text-white">{message.file_name}</p>
              <p className="text-xs text-zinc-400">
                {message.file_size ? `${(message.file_size / 1024 / 1024).toFixed(2)} MB` : ''}
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isFromCurrentUser
            ? 'bg-blue-600 text-white'
            : 'bg-zinc-800 text-white'
        }`}
      >
        {/* Media Content */}
        {renderMediaContent()}
        
        {/* Text Content */}
        {message.content && (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
        
        {/* Timestamp and Status */}
        <div className={`flex items-center justify-end space-x-1 mt-2 text-xs ${
          isFromCurrentUser ? 'text-blue-100' : 'text-zinc-400'
        }`}>
          <span>
            {format(new Date(message.created_at), 'HH:mm', { locale: ptBR })}
          </span>
          {isFromCurrentUser && getStatusIcon()}
        </div>
      </div>
    </div>
  );
};

export default EnhancedMessageItem;