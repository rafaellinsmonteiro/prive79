
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, CheckCheck, Play, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tables } from '@/integrations/supabase/types';

interface EnhancedMessageItemProps {
  message: Tables<'messages'>;
}

const EnhancedMessageItem = ({ message }: EnhancedMessageItemProps) => {
  const isFromUser = message.sender_type === 'user';
  
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
          <div className="relative max-w-xs rounded-2xl overflow-hidden mb-2">
            <img
              src={message.media_url}
              alt="Imagem enviada"
              className="w-full h-auto cursor-pointer"
              onClick={() => window.open(message.media_url!, '_blank')}
            />
          </div>
        );
      
      case 'video':
        return (
          <div className="relative max-w-xs rounded-2xl overflow-hidden mb-2">
            <video
              src={message.media_url}
              controls
              className="w-full h-auto"
              style={{ maxHeight: '300px' }}
            />
          </div>
        );
      
      case 'audio':
        return (
          <div className="flex items-center space-x-2 bg-zinc-700 p-3 rounded-2xl max-w-xs mb-2">
            <Button variant="ghost" size="sm" className="text-white">
              <Play className="h-4 w-4" />
            </Button>
            <div className="flex-1 h-8 bg-zinc-600 rounded-full relative">
              <div className="absolute left-0 top-0 h-full w-1/3 bg-blue-500 rounded-full"></div>
            </div>
            <span className="text-xs text-zinc-300">0:32</span>
          </div>
        );
      
      case 'file':
        return (
          <div className="flex items-center space-x-2 bg-zinc-700 p-3 rounded-2xl max-w-xs mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(message.media_url!, '_blank')}
              className="text-white"
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
    <div className={`flex ${isFromUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] ${
          isFromUser
            ? 'bg-blue-500 text-white rounded-2xl rounded-br-sm'
            : 'bg-zinc-800 text-white rounded-2xl rounded-bl-sm'
        }`}
      >
        <div className="p-3">
          {/* Media Content */}
          {renderMediaContent()}
          
          {/* Text Content */}
          {message.content && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </p>
          )}
        </div>
        
        {/* Timestamp and Status */}
        <div className={`flex items-center justify-end space-x-1 px-3 pb-2 text-xs ${
          isFromUser ? 'text-blue-100' : 'text-zinc-400'
        }`}>
          <span>
            {format(new Date(message.created_at), 'HH:mm', { locale: ptBR })}
          </span>
          {isFromUser && getStatusIcon()}
        </div>
      </div>
    </div>
  );
};

export default EnhancedMessageItem;
