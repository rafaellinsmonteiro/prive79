import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageCircle, Sparkles, RotateCcw } from 'lucide-react';
import { useOpenAIChat } from '@/hooks/useOpenAIChat';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ChatInteligentePage = () => {
  const { user } = useAuth();
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="max-w-4xl mx-auto p-4 h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Chat Inteligente</h1>
              <p className="text-muted-foreground text-sm">Encontre a modelo perfeita com IA</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={startNewSession}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Nova Conversa
          </Button>
        </div>

        {/* Chat Container */}
        <Card className="flex-1 flex flex-col bg-card/50 backdrop-blur-sm border-border/50">
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
                      <Avatar className="h-8 w-8 bg-primary/10">
                        <AvatarFallback>
                          <Sparkles className="h-4 w-4 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      
                      {/* Show suggested models if available */}
                      {message.suggestedModels && message.suggestedModels.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border/30">
                          <p className="text-xs font-medium mb-3 opacity-70">Modelos sugeridas:</p>
                          <div className="space-y-3">
                            {message.suggestedModels.slice(0, 3).map((model) => (
                              <div key={model.id} className="flex gap-3 p-3 bg-background/50 rounded-lg border border-border/20">
                                {/* Model Photo */}
                                {model.model_photos && model.model_photos.length > 0 && (
                                  <img 
                                    src={model.model_photos[0].photo_url} 
                                    alt={model.name}
                                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                )}
                                
                                {/* Model Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium">{model.name}</div>
                                  <div className="text-xs opacity-70 space-y-1">
                                    {model.age && <div>• {model.age} anos</div>}
                                    {model.city && <div>• {model.city}</div>}
                                    {model.height && <div>• {model.height}</div>}
                                    {model["1hora"] && <div>• 1h: R$ {model["1hora"]}</div>}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs opacity-50 mt-2">
                        {message.timestamp.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8 bg-muted">
                        <AvatarFallback className="text-xs">
                          {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8 bg-primary/10">
                      <AvatarFallback>
                        <Sparkles className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Quick Questions (only show if no messages yet or just welcome message) */}
            {messages.length <= 1 && (
              <div className="p-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground mb-3">Perguntas rápidas:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-left justify-start h-auto py-2 px-3 text-xs"
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
            <div className="p-4 border-t border-border/50">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua pergunta... ex: 'Procuro uma morena alta disponível hoje'"
                  disabled={isLoading}
                  className="flex-1 bg-background/50"
                />
                <Button 
                  type="submit" 
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                  className="shrink-0"
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