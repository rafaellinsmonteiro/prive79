import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useConversation } from '@11labs/react';
import { useLunnaTools } from '@/hooks/useLunnaTools';
import { useUserType } from '@/hooks/useUserType';
import { useOpenAIChat } from '@/hooks/useOpenAIChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Volume2, VolumeX, Loader2, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

interface LunnaAssistantProps {
  agentId?: string;
  className?: string;
  onSpeakingChange?: (isSpeaking: boolean) => void;
  mode?: 'audio' | 'text';
}

const LunnaAssistant: React.FC<LunnaAssistantProps> = ({
  agentId,
  className = '',
  onSpeakingChange,
  mode = 'audio'
}) => {
  console.log('🌙 LunnaAssistant: mode =', mode);
  
  const [isStarted, setIsStarted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [lastMessage, setLastMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [textInput, setTextInput] = useState('');
  const [sharedMessages, setSharedMessages] = useState<any[]>([]);
  const [userType, setUserType] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get tools and user type
  const { tools: availableTools, loading: toolsLoading } = useLunnaTools();
  const { getUserType } = useUserType();

  // Load user type on mount
  useEffect(() => {
    const loadUserType = async () => {
      const type = await getUserType();
      setUserType(type);
    };
    loadUserType();
  }, [getUserType]);

  // Text chat tools with handlers
  const clientToolsWithHandlers = useMemo(() => {
    if (!availableTools || toolsLoading || !userType) {
      return [];
    }

    return availableTools.filter(tool => {
      if (!tool.is_active) return false;
      return tool.allowed_user_types?.includes(userType);
    }).map(tool => ({
      ...tool,
      handler: async (parameters: any) => {
        console.log(`🌙 Text mode executing: ${tool.label}`, parameters);
        try {
          const response = await fetch('https://hhpcrtpevucuucoiodxh.functions.supabase.co/lunna-data-access', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              action: tool.function_name,
              filters: parameters || {}
            })
          });
          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.error || `Erro HTTP ${response.status}`);
          }

          // Format compact results (50% shorter)
          switch (tool.function_name) {
            case 'buscar_cidades':
              const cidades = result.data.cidades.slice(0, 5).map(c => c.nome);
              return `${cidades.join(', ')}${result.data.cidades.length > 5 ? ` (+${result.data.cidades.length - 5} mais)` : ''}`;
            case 'buscar_modelos_por_cidade':
              if (result.data.modelos.length === 0) {
                return `Nenhuma acompanhante em ${parameters.cidade_nome}.`;
              }
              const modelosCidade = result.data.modelos.slice(0, 3).map(m => `${m.nome} (${m.idade}a, R$${m.preco_1h || '?'}/h)`);
              return `${modelosCidade.join(', ')}${result.data.modelos.length > 3 ? ` (+${result.data.modelos.length - 3})` : ''}`;
            case 'buscar_modelos':
            case 'buscar_modelos_geral':
              const modelos = result.data.modelos.slice(0, 3).map(m => {
                const foto = m.fotos && m.fotos.length > 0 ? ` 📸` : '';
                return `${m.nome} (${m.idade}a, ${m.cidade}, R$${m.preco_1h || '?'}/h)${foto}`;
              });
              return `${modelos.join(', ')}${result.data.modelos.length > 3 ? ` (+${result.data.modelos.length - 3})` : ''}`;
            case 'estatisticas_prive':
            case 'estatisticas_sistema':
              return `${result.data.estatisticas.total_modelos} acompanhantes em ${result.data.estatisticas.total_cidades} cidades.`;
            case 'salvar_preferencias_usuario':
              return `Preferências salvas. ${result.data.usuario.interaction_count} interações.`;
            case 'buscar_preferencias_usuario':
              if (!result.data.existe) return `Novo usuário.`;
              const user = result.data.usuario;
              const prefs = [
                user.preferred_cities?.length > 0 ? `Cidades: ${user.preferred_cities.slice(0, 2).join(', ')}` : null,
                user.preferred_age_range ? `Idade: ${user.preferred_age_range}` : null,
                user.preferred_price_range ? `Preço: ${user.preferred_price_range}` : null
              ].filter(Boolean);
              return `${user.user_name || 'Usuário'} (${user.interaction_count}x)${prefs.length ? ': ' + prefs.join(', ') : ''}`;
            default:
              return JSON.stringify(result.data).substring(0, 100) + '...';
          }
        } catch (error) {
          console.error(`🌙 Erro na ferramenta ${tool.function_name}:`, error);
          return `Erro ao executar ${tool.label}: ${error.message}`;
        }
      }
    }));
  }, [availableTools, toolsLoading, userType]);

  // Text chat hook with tools and shared memory
  const { messages, isLoading: textLoading, sendMessage, clearMessages } = useOpenAIChat({
    tools: clientToolsWithHandlers,
    sharedMessages,
    onMessagesUpdate: setSharedMessages
  });

  // Initialize welcome message for text mode
  useEffect(() => {
    if (mode === 'text' && messages.length === 0 && sharedMessages.length === 0) {
      const welcomeMessage = {
        role: 'assistant' as const,
        content: 'Olá! Sou a Lunna, sua assistente inteligente do Prive. Como posso ajudá-lo hoje?',
        timestamp: new Date().toISOString()
      };
      setSharedMessages([welcomeMessage]);
    }
  }, [mode, messages.length, sharedMessages.length]);

  // Audio mode tools
  const clientTools = useMemo(() => {
    if (!availableTools || toolsLoading || !userType) {
      console.log('🌙 Ferramentas não disponíveis ainda:', {
        availableTools: !!availableTools,
        toolsLoading,
        userType
      });
      return {};
    }
    console.log('🌙 Gerando ferramentas para tipo de usuário:', userType);
    console.log('🌙 Ferramentas disponíveis:', availableTools.length);
    const tools: Record<string, (parameters: any) => Promise<string>> = {};
    
    availableTools.filter(tool => {
      // Filtrar por ativação
      if (!tool.is_active) return false;

      // Filtrar por tipo de usuário
      const hasPermission = tool.allowed_user_types?.includes(userType);
      console.log('🌙 Ferramenta:', tool.name, 'Permitida para', userType, ':', hasPermission);
      return hasPermission;
    }).forEach(tool => {
      tools[tool.function_name] = async (parameters: any) => {
        console.log(`🌙 Audio mode executing: ${tool.label}`, parameters);
        
        // Add tool execution to shared memory
        const toolMessage = {
          role: 'assistant' as const,
          content: `Executando: ${tool.label}...`,
          timestamp: new Date().toISOString()
        };
        setSharedMessages(prev => [...prev, toolMessage]);
        
        try {
          const response = await fetch('https://hhpcrtpevucuucoiodxh.functions.supabase.co/lunna-data-access', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              action: tool.function_name,
              filters: parameters || {}
            })
          });
          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.error || `Erro HTTP ${response.status}`);
          }

          // Formatação específica por tipo de ferramenta
          let formattedResult = '';
          switch (tool.function_name) {
            case 'buscar_cidades':
              formattedResult = `Cidades do Prive: ${result.data.cidades.map(c => c.nome).join(', ')}`;
              break;
            case 'buscar_modelos_por_cidade':
              if (result.data.modelos.length === 0) {
                formattedResult = `Não temos acompanhantes cadastradas no Prive em ${parameters.cidade_nome}.`;
              } else {
                const modelosCidade = result.data.modelos.map(m => `${m.nome} (${m.idade} anos, ${m.bairro || 'centro'}, R$ ${m.preco_1h || 'consultar'}/h)`).join(', ');
                formattedResult = `Acompanhantes do Prive em ${parameters.cidade_nome}: ${modelosCidade}`;
              }
              break;
            case 'buscar_modelos':
            case 'buscar_modelos_geral':
              const modelos = result.data.modelos.map(m => `${m.nome} (${m.idade} anos, ${m.cidade || 'N/A'}, R$ ${m.preco_1h || 'consultar'}/h)`).join(', ');
              formattedResult = `Acompanhantes disponíveis no Prive: ${modelos}`;
              break;
            case 'estatisticas_prive':
            case 'estatisticas_sistema':
              formattedResult = `O Prive possui ${result.data.estatisticas.total_modelos} acompanhantes cadastradas em ${result.data.estatisticas.total_cidades} cidades diferentes.`;
              break;
            case 'salvar_preferencias_usuario':
              formattedResult = `Preferências salvas com sucesso para o usuário ${parameters.user_name || parameters.user_session_id}. Total de interações: ${result.data.usuario.interaction_count}`;
              break;
            case 'buscar_preferencias_usuario':
              if (!result.data.existe) {
                formattedResult = `Usuário novo no sistema. Não há preferências salvas ainda.`;
              } else {
                const user = result.data.usuario;
                let resumo = `Usuário ${user.user_name || user.user_session_id} - ${user.interaction_count} interações. `;
                if (user.preferred_cities?.length > 0) {
                  resumo += `Cidades preferidas: ${user.preferred_cities.join(', ')}. `;
                }
                if (user.preferred_age_range) {
                  resumo += `Faixa etária: ${user.preferred_age_range}. `;
                }
                if (user.preferred_price_range) {
                  resumo += `Faixa de preço: ${user.preferred_price_range}. `;
                }
                if (user.preferred_services?.length > 0) {
                  resumo += `Serviços de interesse: ${user.preferred_services.join(', ')}. `;
                }
                if (user.notes) {
                  resumo += `Observações: ${user.notes}`;
                }
                formattedResult = resumo.trim();
              }
              break;
            default:
              formattedResult = JSON.stringify(result.data);
          }
          
          // Add result to shared memory
          const resultMessage = {
            role: 'assistant' as const,
            content: formattedResult,
            timestamp: new Date().toISOString()
          };
          setSharedMessages(prev => [...prev.slice(0, -1), resultMessage]); // Replace the "executing" message
          
          return formattedResult;
        } catch (error) {
          console.error(`🌙 Erro na ferramenta ${tool.function_name}:`, error);
          const errorResult = `Erro ao executar ${tool.label}: ${error.message}`;
          
          // Add error to shared memory
          const errorMessage = {
            role: 'assistant' as const,
            content: errorResult,
            timestamp: new Date().toISOString()
          };
          setSharedMessages(prev => [...prev.slice(0, -1), errorMessage]); // Replace the "executing" message
          
          return errorResult;
        }
      };
    });
    return tools;
  }, [availableTools, toolsLoading, userType]);
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('🌙 Lunna: Conectada!');
      console.log('🌙 Status da conexão:', conversation.status);
      toast.success('Lunna está online!');
    },
    onDisconnect: () => {
      console.log('🌙 Lunna: Desconectada');
      console.log('🌙 Status da conexão após desconexão:', conversation.status);
      toast.info('Lunna foi desconectada');
      setIsStarted(false);
    },
    onMessage: message => {
      console.log('🌙 Lunna disse:', message);
      setLastMessage(message.message || '');
      
      // Add audio message to shared memory
      if (message.message) {
        const audioMessage = {
          role: 'assistant' as const,
          content: message.message,
          timestamp: new Date().toISOString()
        };
        setSharedMessages(prev => [...prev, audioMessage]);
      }
    },
    onError: error => {
      console.error('🌙 Erro da Lunna:', error);
      console.log('🌙 Tipo do erro:', typeof error);
      console.log('🌙 Propriedades do erro:', Object.keys(error || {}));
      const errorStr = String(error);
      if (errorStr.includes('does not exist')) {
        setErrorMessage('Agent ID não configurado. Configure um agent ID válido do ElevenLabs.');
        toast.error('Agent ID inválido. Verifique a configuração.');
      } else {
        setErrorMessage('Erro na conexão com Lunna');
        toast.error('Erro na conexão com Lunna');
      }
    },
    clientTools
  });

  const startConversation = async () => {
    if (!agentId) {
      toast.error('Agent ID não configurado. Consulte as instruções abaixo.');
      setErrorMessage('Agent ID é obrigatório para iniciar a conversa com Lunna.');
      return;
    }
    try {
      console.log('🌙 Iniciando conversa com Agent ID:', agentId);
      setErrorMessage('');

      // Solicitar acesso ao microfone antes de iniciar
      console.log('🌙 Solicitando acesso ao microfone...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      console.log('🌙 Microfone autorizado:', !!stream);
      console.log('🌙 Iniciando sessão com ElevenLabs...');
      const conversationId = await conversation.startSession({
        agentId
      });
      console.log('🌙 Conversa iniciada:', conversationId);
      console.log('🌙 Status da conexão após startSession:', conversation.status);
      setIsStarted(true);

      // Aguardar um pouco para ver se a conexão se mantém
      setTimeout(() => {
        console.log('🌙 Status da conexão após 2s:', conversation.status);
      }, 2000);
    } catch (error: any) {
      console.error('🌙 Erro ao iniciar conversa:', error);
      console.log('🌙 Nome do erro:', error.name);
      console.log('🌙 Mensagem do erro:', error.message);
      console.log('🌙 Stack do erro:', error.stack);
      const errorStr = String(error);
      if (errorStr.includes('does not exist')) {
        setErrorMessage('O Agent ID fornecido não existe no ElevenLabs.');
        toast.error('Agent ID inválido. Verifique a configuração.');
      } else if (errorStr.includes('Permission denied')) {
        setErrorMessage('Acesso ao microfone negado. Permita o acesso e tente novamente.');
        toast.error('Permissão do microfone necessária.');
      } else {
        setErrorMessage('Erro ao conectar. Verifique as permissões do microfone e sua conexão.');
        toast.error('Erro ao conectar com Lunna. Verifique as permissões do microfone.');
      }
    }
  };

  const endConversation = async () => {
    try {
      await conversation.endSession();
      setIsStarted(false);
      setErrorMessage('');
    } catch (error) {
      console.error('🌙 Erro ao encerrar conversa:', error);
    }
  };

  const handleVolumeChange = async (newVolume: number) => {
    setVolume(newVolume);
    try {
      await conversation.setVolume({
        volume: newVolume
      });
    } catch (error) {
      console.error('🌙 Erro ao ajustar volume:', error);
    }
  };

  // Monitor speaking state and notify parent
  useEffect(() => {
    if (onSpeakingChange) {
      onSpeakingChange(conversation.isSpeaking || false);
    }
  }, [conversation.isSpeaking, onSpeakingChange]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (isStarted) {
        endConversation();
      }
    };
  }, []);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && !textLoading) {
      // Add user message to shared memory for audio mode too
      const userMessage = {
        role: 'user' as const,
        content: textInput,
        timestamp: new Date().toISOString()
      };
      setSharedMessages(prev => [...prev, userMessage]);
      
      sendMessage(textInput);
      setTextInput('');
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Modern minimalist interface */}
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
              mode === 'text' || conversation.status === 'connected' 
                ? 'bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]' 
                : 'bg-rose-400 shadow-[0_0_20px_rgba(251,113,133,0.6)]'
            }`} />
            <span className="text-lg font-light text-white tracking-wider">
              {mode === 'text' || conversation.status === 'connected' ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Error Display */}
          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-6">
              <p className="text-rose-300 text-sm font-medium">
                {errorMessage}
              </p>
            </div>
          )}
        </div>

        {mode === 'text' ? (
          /* Text Chat Mode */
          <div className="space-y-4">
            {/* Messages */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {messages.map((message, index) => {
                  const isUser = message.role === 'user';
                  const content = message.content || '';
                  
                  // Detect if content contains URLs for images
                  const imageUrlMatch = content.match(/https?:\/\/.*\.(jpg|jpeg|png|gif|webp)/i);
                  const hasImage = !!imageUrlMatch;
                  
                  // Split content into lines for better formatting
                  const lines = content.split('\n').filter(line => line.trim());
                  
                  return (
                    <div
                      key={index}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl transition-all ${
                          isUser
                            ? 'bg-primary text-white'
                            : 'bg-white/10 text-white border border-white/20'
                        }`}
                      >
                        {hasImage && (
                          <div className="mb-2">
                            <img 
                              src={imageUrlMatch[0]} 
                              alt="Imagem compartilhada"
                              className="rounded-lg max-w-full h-auto"
                              loading="lazy"
                            />
                          </div>
                        )}
                        
                        {lines.length > 1 ? (
                          <div className="space-y-1">
                            {lines.map((line, lineIndex) => (
                              <p key={lineIndex} className="text-sm leading-relaxed">
                                {line}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {content.replace(imageUrlMatch?.[0] || '', '').trim()}
                          </p>
                        )}
                        
                        <div className={`text-xs mt-1 opacity-60 ${isUser ? 'text-right' : 'text-left'}`}>
                          {new Date(message.timestamp).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {textLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 text-white border border-white/20 p-3 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Pensando...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Text Input */}
            <form onSubmit={handleTextSubmit} className="flex gap-3">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/60"
                disabled={textLoading}
              />
              <Button
                type="submit"
                disabled={!textInput.trim() || textLoading}
                className="bg-primary hover:bg-primary/80 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        ) : (
          /* Audio Mode */
          <div className="space-y-8">
            {/* Status Display */}
            <div className="text-center">
              {conversation.isSpeaking && (
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/20 backdrop-blur-xl border border-primary/30 rounded-2xl">
                  <Volume2 className="w-5 h-5 text-primary animate-pulse" />
                  <span className="text-primary font-medium">Lunna está falando...</span>
                </div>
              )}
              
              {lastMessage && (
                <div className="mt-4 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <p className="text-white/80 text-sm italic">
                    "{lastMessage}"
                  </p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-6">
              {!isStarted ? (
                <Button
                  onClick={startConversation}
                  disabled={toolsLoading}
                  className="bg-primary hover:bg-primary/80 text-white px-8 py-6 rounded-2xl text-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50"
                >
                  {toolsLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Carregando ferramentas...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mic className="w-5 h-5" />
                      Falar com Lunna
                    </div>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={endConversation}
                  variant="destructive"
                  className="px-8 py-6 rounded-2xl text-lg font-medium transition-all duration-300 hover:scale-105"
                >
                  <MicOff className="w-5 h-5 mr-2" />
                  Encerrar Conversa
                </Button>
              )}

              {/* Volume Control */}
              {isStarted && (
                <div className="flex items-center gap-4 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <VolumeX className="w-4 h-4 text-white/60" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-24 accent-primary"
                  />
                  <Volume2 className="w-4 h-4 text-white/60" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Configuration Section */}
        {!agentId && (
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Configuração do ElevenLabs
              </CardTitle>
              <CardDescription className="text-white/70">
                Para usar a Lunna, você precisa configurar um Agent ID do ElevenLabs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-white font-medium">Como configurar:</h4>
                <ol className="text-white/70 text-sm space-y-1 list-decimal list-inside">
                  <li>Acesse <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ElevenLabs.io</a></li>
                  <li>Crie ou faça login em sua conta</li>
                  <li>Vá para a seção "Conversational AI" e crie um novo agente</li>
                  <li>Copie o Agent ID gerado</li>
                  <li>Cole o Agent ID nas configurações da página Lunna</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LunnaAssistant;