import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageCircle, Sparkles, RotateCcw, Images, Mic, MicOff, Volume2, VolumeX, Square } from 'lucide-react';
import { useOpenAIChat } from '@/hooks/useOpenAIChat';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

const ChatInteligentePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { messages, isLoading, sendMessage, clearMessages } = useOpenAIChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Voice functionality
  const { isRecording, isProcessing, startRecording, stopRecording, cancelRecording } = useVoiceRecorder();
  const { speak, stop: stopSpeech, isPlaying, isLoading: isSpeechLoading } = useTextToSpeech();
  const [voiceMode, setVoiceMode] = useState(false);

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    await sendMessage(inputValue);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleVoiceRecording = async () => {
    if (isRecording) {
      try {
        const transcribedText = await stopRecording();
        if (transcribedText.trim()) {
          setInputValue(transcribedText);
          // Auto-send if voice mode is enabled
          if (voiceMode) {
            await sendMessage(transcribedText);
          }
        }
      } catch (error) {
        console.error('Error processing voice:', error);
      }
    } else {
      await startRecording();
    }
  };

  const handleSpeakLastMessage = () => {
    const lastAssistantMessage = messages
      .filter(msg => msg.role === 'assistant')
      .pop();
    
    if (lastAssistantMessage && lastAssistantMessage.content) {
      if (isPlaying) {
        stopSpeech();
      } else {
        speak(lastAssistantMessage.content);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const quickQuestions = [
    "Procuro uma loira alta disponível hoje",
    "Modelos na zona norte de São Paulo",
    "Acompanhante para jantar romântico",
    "Disponível para pernoite no final de semana"
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto p-4 h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-full border border-purple-500/30">
              <Sparkles className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Chat Inteligente</h1>
              <p className="text-gray-400 text-sm">Encontre a modelo perfeita com IA</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVoiceMode(!voiceMode)}
              className={`gap-2 border-gray-700 hover:bg-gray-700 hover:text-white ${
                voiceMode 
                  ? 'bg-purple-600 border-purple-500 text-white' 
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              <Mic className="h-4 w-4" />
              Modo Voz
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearMessages}
              className="gap-2 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
              Nova Conversa
            </Button>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="flex-1 flex flex-col bg-gray-900 border-gray-800">
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={messages.indexOf(message)}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8 bg-purple-500/20 border border-purple-500/30">
                        <AvatarFallback>
                          <Sparkles className="h-4 w-4 text-purple-400" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white ml-auto'
                          : 'bg-gray-800 text-gray-100 border border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed flex-1">
                          {message.content}
                        </div>
                        {message.role === 'assistant' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSpeakLastMessage}
                            disabled={isSpeechLoading}
                            className="p-1 h-auto text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                          >
                            {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          </Button>
                        )}
                      </div>
                      
                       {/* Show suggested models if available */}
                       {false && ( // Temporarily disabled for new message format
                         <div className="mt-4 pt-4 border-t border-gray-600">
                           <p className="text-xs font-medium mb-4 text-purple-300">Modelos sugeridas:</p>
                           <div className="space-y-4">
                             {/* Models would be rendered here */}
                           </div>
                         </div>
                       )}
                      
                      <div className="text-xs opacity-50 mt-3 text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8 bg-gray-700 border border-gray-600">
                        <AvatarFallback className="text-xs text-gray-300">
                          {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8 bg-purple-500/20 border border-purple-500/30">
                      <AvatarFallback>
                        <Sparkles className="h-4 w-4 text-purple-400" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Quick Questions (only show if no messages yet or just welcome message) */}
            {messages.length <= 1 && (
              <div className="p-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-3">Perguntas rápidas:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-left justify-start h-auto py-2 px-3 text-xs bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => sendMessage(question)}
                      disabled={isLoading}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-700">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    voiceMode 
                      ? "Use o botão de voz ou digite sua pergunta..." 
                      : "Digite sua pergunta... ex: 'Procuro uma morena alta disponível hoje'"
                  }
                  disabled={isLoading || isRecording}
                  className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                />
                
                {/* Voice Recording Button */}
                <Button
                  type="button"
                  onClick={handleVoiceRecording}
                  disabled={isLoading || isProcessing}
                  size="icon"
                  className={`shrink-0 border-0 ${
                    isRecording 
                      ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {isRecording ? (
                    <Square className="h-4 w-4" />
                  ) : isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>

                <Button 
                  type="submit" 
                  disabled={!inputValue.trim() || isLoading || isRecording}
                  size="icon"
                  className="shrink-0 bg-purple-600 hover:bg-purple-700 border-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              
              {/* Voice Recording Status */}
              {(isRecording || isProcessing) && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                  {isRecording && (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      Gravando... (clique no botão para parar)
                    </>
                  )}
                  {isProcessing && (
                    <>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                      Processando áudio...
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatInteligentePage;