import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageCircle, Sparkles, RotateCcw, Images } from 'lucide-react';
import { useOpenAIChat } from '@/hooks/useOpenAIChat';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';

const ChatInteligentePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { messages, isLoading, sendMessage, startNewSession } = useOpenAIChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start new session on component mount
  useEffect(() => {
    if (messages.length === 0) {
      startNewSession();
    }
  }, [messages.length, startNewSession]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    await sendMessage(inputValue);
    setInputValue('');
    inputRef.current?.focus();
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={startNewSession}
            className="gap-2 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
            Nova Conversa
          </Button>
        </div>

        {/* Chat Container */}
        <Card className="flex-1 flex flex-col bg-gray-900 border-gray-800">
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
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
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      
                      {/* Show suggested models if available */}
                      {message.suggestedModels && message.suggestedModels.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-600">
                          <p className="text-xs font-medium mb-4 text-purple-300">Modelos sugeridas:</p>
                          <div className="space-y-4">
                            {message.suggestedModels.slice(0, 3).map((model) => (
                              <div key={model.id} className="bg-gray-900 border border-gray-600 rounded-xl overflow-hidden">
                                <div className="flex gap-4 p-4">
                                  {/* Model Photo - Maior */}
                                  {model.model_photos && model.model_photos.length > 0 && (
                                    <div className="relative">
                                      <img 
                                        src={model.model_photos[0].photo_url} 
                                        alt={model.name}
                                        className="w-24 h-32 rounded-lg object-cover flex-shrink-0 cursor-pointer border border-gray-600"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                        onClick={() => navigate(`/modelo/${model.id}`)}
                                      />
                                    </div>
                                  )}
                                  
                                  {/* Model Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-base font-medium text-white mb-2">{model.name}</div>
                                    <div className="text-sm text-gray-300 space-y-1 mb-3">
                                      {model.age && <div>• {model.age} anos</div>}
                                      {model.city && <div>• {model.city}</div>}
                                      {model.height && <div>• {model.height}</div>}
                                      {model["1hora"] && <div>• 1h: R$ {model["1hora"]}</div>}
                                    </div>
                                    
                                    {/* Botão para ver galeria */}
                                    <Button
                                      size="sm"
                                      onClick={() => navigate(`/galeria?modelo=${model.id}`)}
                                      className="bg-purple-600 hover:bg-purple-700 text-white border-0 gap-2"
                                    >
                                      <Images className="h-4 w-4" />
                                      Ver Galeria
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs opacity-50 mt-3 text-gray-400">
                        {message.timestamp.toLocaleTimeString('pt-BR', { 
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
                  placeholder="Digite sua pergunta... ex: 'Procuro uma morena alta disponível hoje'"
                  disabled={isLoading}
                  className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                />
                <Button 
                  type="submit" 
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                  className="shrink-0 bg-purple-600 hover:bg-purple-700 border-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatInteligentePage;