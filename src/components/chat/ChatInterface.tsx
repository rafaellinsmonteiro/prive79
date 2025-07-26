import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Mic, MicOff, Paperclip, MoreVertical, ArrowLeft } from 'lucide-react';
import { useMessages, useSendMessage, useRealtimeMessages, useTypingIndicator, useConversations, useIsUserModel, getConversationDisplayName, getConversationDisplayPhoto } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import MessageItem from './MessageItem';
import MediaUpload from './MediaUpload';
import TypingIndicator from './TypingIndicator';
import ContactInfoSheet from './ContactInfoSheet';

interface ChatInterfaceProps {
  conversationId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversationId }) => {
  const [message, setMessage] = useState('');
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const { data: messages = [], isLoading } = useMessages(conversationId);
  const { data: conversations = [] } = useConversations();
  const { data: isModel = false } = useIsUserModel();
  const sendMessage = useSendMessage();
  const { startTyping, stopTyping } = useTypingIndicator(conversationId);
  const { isRecording, isProcessing, startRecording, stopRecording, cancelRecording } = useVoiceRecorder();
  
  // Enable realtime updates
  useRealtimeMessages(conversationId);

  // Find current conversation
  const currentConversation = conversations.find(c => c.id === conversationId);


  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle voice recording (now handled differently)
  const handleVoiceRecord = async () => {
    if (isRecording) {
      try {
        const transcribedText = await stopRecording();
        if (transcribedText.trim()) {
          setMessage(transcribedText);
        }
      } catch (error) {
        console.error('Error processing voice:', error);
      }
    } else {
      await startRecording();
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;

    const messageContent = message;
    setMessage('');

    try {
      await sendMessage.mutateAsync({
        conversationId,
        content: messageContent,
        messageType: 'text',
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMessage(messageContent);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    if (e.target.value && !message) {
      startTyping.mutate();
    } else if (!e.target.value && message) {
      stopTyping.mutate();
    }
  };


  const handleAudioUpload = async (audioBlob: Blob) => {
    try {
      // Create a URL for the audio blob
      const audioUrl = URL.createObjectURL(audioBlob);
      
      await sendMessage.mutateAsync({
        conversationId,
        messageType: 'audio',
        mediaUrl: audioUrl,
        mediaType: 'audio/webm',
        fileName: `audio_${Date.now()}.webm`,
        fileSize: audioBlob.size,
      });
      
      console.log('Audio message sent successfully');
    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
    }
  };

  const handleMediaUpload = async (mediaData: {
    url: string;
    type: string;
    fileName?: string;
    fileSize?: number;
  }) => {
    try {
      await sendMessage.mutateAsync({
        conversationId,
        messageType: mediaData.type.startsWith('image/') ? 'image' : 
                    mediaData.type.startsWith('video/') ? 'video' : 
                    mediaData.type.startsWith('audio/') ? 'audio' : 'file',
        mediaUrl: mediaData.url,
        mediaType: mediaData.type,
        fileName: mediaData.fileName,
        fileSize: mediaData.fileSize,
      });
      setShowMediaUpload(false);
    } catch (error) {
      console.error('Erro ao enviar mídia:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-950 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Carregando conversa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 h-full flex flex-col">
      {/* Header dark melhorado */}
      <div className="border-b border-zinc-800 py-3 bg-zinc-900">
        <div className="flex items-center px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => window.history.back()}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg mr-3"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <button
            onClick={() => setShowContactInfo(true)}
            className="flex items-center space-x-3 hover:bg-zinc-800 rounded-lg p-2 transition-all duration-200 group flex-1"
          >
            <div className="relative">
              <img
                src={getConversationDisplayPhoto(currentConversation, isModel)}
                alt={getConversationDisplayName(currentConversation, isModel)}
                className="w-10 h-10 rounded-full object-cover border-2 border-zinc-600 group-hover:border-purple-500/50 transition-colors"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900"></div>
            </div>
            <div>
              <h3 className="text-white font-semibold group-hover:text-purple-400 transition-colors">
                {getConversationDisplayName(currentConversation, isModel)}
              </h3>
              <p className="text-xs text-green-400 font-medium">● Online agora</p>
            </div>
          </button>

          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages Area dark */}
        <ScrollArea className="flex-1 p-4 bg-zinc-950" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}
            <TypingIndicator conversationId={conversationId} />
          </div>
        </ScrollArea>

        {/* Media Upload dark */}
        {showMediaUpload && (
          <div className="border-t border-zinc-800 p-4 bg-zinc-900 sm:pb-4 pb-20">
            <MediaUpload
              onUpload={handleMediaUpload}
              onCancel={() => setShowMediaUpload(false)}
            />
          </div>
        )}

        {/* Input Area dark melhorada */}
        <div className="bg-zinc-900 px-4 py-4 border-t border-zinc-800 sm:pb-4 pb-20">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMediaUpload(!showMediaUpload)}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg flex-shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Mensagem..."
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 rounded-lg pr-4 py-2 h-10 focus:border-purple-500 transition-all duration-200"
                disabled={isRecording}
              />
            </div>
            
            {/* Audio/Send Button dark */}
            {message.trim() ? (
              <Button
                onClick={handleSendMessage}
                disabled={sendMessage.isPending}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full w-10 h-10 p-0 flex-shrink-0 transition-all duration-200"
              >
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleVoiceRecord}
                disabled={sendMessage.isPending}
                className={`rounded-full w-10 h-10 p-0 flex-shrink-0 transition-all duration-200 ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse text-white' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                }`}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
          </div>
          
          {isRecording && (
            <div className="mt-2 flex items-center justify-center">
              <div className="flex items-center space-x-2 text-red-400">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Gravando áudio...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Info Sheet */}
      <ContactInfoSheet
        isOpen={showContactInfo}
        onClose={() => setShowContactInfo(false)}
        modelId={currentConversation?.model_id || undefined}
        modelName={getConversationDisplayName(currentConversation, isModel)}
        modelPhoto={getConversationDisplayPhoto(currentConversation, isModel)}
      />
    </div>
  );
};

export default ChatInterface;
