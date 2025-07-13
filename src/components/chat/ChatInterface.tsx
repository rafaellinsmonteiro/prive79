import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Mic, MicOff, Phone, Video, Paperclip, MoreVertical } from 'lucide-react';
import { useMessages, useSendMessage, useRealtimeMessages, useTypingIndicator, useConversations } from '@/hooks/useChat';
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
  const sendMessage = useSendMessage();
  const { startTyping, stopTyping } = useTypingIndicator(conversationId);
  const { isRecording, isProcessing, startRecording, stopRecording, cancelRecording } = useVoiceRecorder();
  
  // Enable realtime updates
  useRealtimeMessages(conversationId);

  // Find current conversation
  const currentConversation = conversations.find(c => c.id === conversationId);

  const getModelPhoto = (conversation: any) => {
    if (conversation?.models?.photos && conversation.models.photos.length > 0) {
      const primaryPhoto = conversation.models.photos.find((p: any) => p.is_primary);
      if (primaryPhoto) return primaryPhoto.photo_url;
      return conversation.models.photos[0].photo_url;
    }
    return '/placeholder.svg';
  };

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
      <Card className="bg-card border-border h-[600px] flex items-center justify-center shadow-lg">
        <CardContent>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando conversa...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border h-[600px] flex flex-col shadow-lg">
      {/* Header with Model Photo */}
      <CardHeader className="border-b border-border py-3 bg-gradient-to-r from-accent/5 to-accent/10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowContactInfo(true)}
            className="flex items-center space-x-3 hover:bg-accent rounded-xl p-2 transition-all duration-200 group"
          >
            <div className="relative">
              <img
                src={getModelPhoto(currentConversation)}
                alt={currentConversation?.models?.name || 'Model'}
                className="w-10 h-10 rounded-full object-cover border-2 border-border shadow-md group-hover:border-primary/50 transition-colors"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card shadow-sm"></div>
            </div>
            <div>
              <h3 className="text-foreground font-semibold group-hover:text-primary transition-colors">
                {currentConversation?.models?.name || 'Chat'}
              </h3>
              <p className="text-xs text-green-500 font-medium">Online agora</p>
            </div>
          </button>

          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all duration-200">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all duration-200">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all duration-200">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-background/50 to-accent/5" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}
            <TypingIndicator conversationId={conversationId} />
          </div>
        </ScrollArea>

        {/* Media Upload */}
        {showMediaUpload && (
          <div className="border-t border-border p-4 bg-accent/20">
            <MediaUpload
              onUpload={handleMediaUpload}
              onCancel={() => setShowMediaUpload(false)}
            />
          </div>
        )}

        {/* Input Area with Audio Button */}
        <div className="bg-card/80 backdrop-blur-sm px-4 py-4 border-t border-border">
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMediaUpload(!showMediaUpload)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl flex-shrink-0 transition-all duration-200"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Mensagem..."
                className="bg-accent/50 border-border text-foreground placeholder:text-muted-foreground rounded-xl pr-4 py-2 h-10 focus:border-primary transition-all duration-200"
                disabled={isRecording}
              />
            </div>
            
            {/* Audio/Send Button - WhatsApp Style */}
            {message.trim() ? (
              <Button
                onClick={handleSendMessage}
                disabled={sendMessage.isPending}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-full w-10 h-10 p-0 flex-shrink-0 shadow-[0_4px_20px_hsl(var(--primary))_/_0.3] transition-all duration-200"
              >
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleVoiceRecord}
                disabled={sendMessage.isPending}
                className={`rounded-full w-10 h-10 p-0 flex-shrink-0 shadow-lg transition-all duration-200 ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse text-white' 
                    : 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-[0_4px_20px_hsl(var(--primary))_/_0.3]'
                }`}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
          </div>
          
          {isRecording && (
            <div className="mt-2 flex items-center justify-center">
              <div className="flex items-center space-x-2 text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Gravando áudio...</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Contact Info Sheet */}
      <ContactInfoSheet
        isOpen={showContactInfo}
        onClose={() => setShowContactInfo(false)}
        modelId={currentConversation?.model_id || undefined}
        modelName={currentConversation?.models?.name}
        modelPhoto={getModelPhoto(currentConversation)}
      />
    </Card>
  );
};

export default ChatInterface;
