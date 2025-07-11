import React, { useState, useEffect, useMemo } from 'react';
import { useConversation } from '@11labs/react';
import { useLunnaTools } from '@/hooks/useLunnaTools';
import { useUserType } from '@/hooks/useUserType';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LunnaAssistantProps {
  agentId?: string;
  className?: string;
  onSpeakingChange?: (isSpeaking: boolean) => void;
}

const LunnaAssistant: React.FC<LunnaAssistantProps> = ({ 
  agentId, 
  className = '',
  onSpeakingChange 
}) => {
  const [isStarted, setIsStarted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [lastMessage, setLastMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { tools: availableTools, loading: toolsLoading } = useLunnaTools();
  const { getUserType } = useUserType();
  const [userType, setUserType] = useState<string | null>(null);

  // Gerar ferramentas dinamicamente baseadas no tipo de usuário
  const clientTools = useMemo(() => {
    if (!availableTools || toolsLoading || !userType) {
      console.log('🌙 Ferramentas não disponíveis ainda:', { availableTools: !!availableTools, toolsLoading, userType });
      return {};
    }

    console.log('🌙 Gerando ferramentas para tipo de usuário:', userType);
    console.log('🌙 Ferramentas disponíveis:', availableTools.length);

    const tools: Record<string, (parameters: any) => Promise<string>> = {};
    
    availableTools
      .filter(tool => {
        // Filtrar por ativação
        if (!tool.is_active) return false;
        
        // Filtrar por tipo de usuário
        const hasPermission = tool.allowed_user_types?.includes(userType);
        console.log('🌙 Ferramenta:', tool.name, 'Permitida para', userType, ':', hasPermission);
        return hasPermission;
      })
      .forEach(tool => {
        tools[tool.function_name] = async (parameters: any) => {
          console.log(`🌙 Lunna está executando: ${tool.label}`, parameters);
          
          try {
            const response = await fetch('https://hhpcrtpevucuucoiodxh.functions.supabase.co/lunna-data-access', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
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
            switch (tool.function_name) {
              case 'buscar_cidades':
                return `Cidades do Prive: ${result.data.cidades.map(c => c.nome).join(', ')}`;
              
              case 'buscar_modelos_por_cidade':
                if (result.data.modelos.length === 0) {
                  return `Não temos acompanhantes cadastradas no Prive em ${parameters.cidade_nome}.`;
                }
                const modelosCidade = result.data.modelos.map(m => 
                  `${m.nome} (${m.idade} anos, ${m.bairro || 'centro'}, R$ ${m.preco_1h || 'consultar'}/h)`
                ).join(', ');
                return `Acompanhantes do Prive em ${parameters.cidade_nome}: ${modelosCidade}`;
              
              case 'buscar_modelos':
              case 'buscar_modelos_geral':
                const modelos = result.data.modelos.map(m => 
                  `${m.nome} (${m.idade} anos, ${m.cidade || 'N/A'}, R$ ${m.preco_1h || 'consultar'}/h)`
                ).join(', ');
                return `Acompanhantes disponíveis no Prive: ${modelos}`;
              
              case 'estatisticas_prive':
              case 'estatisticas_sistema':
                return `O Prive possui ${result.data.estatisticas.total_modelos} acompanhantes cadastradas em ${result.data.estatisticas.total_cidades} cidades diferentes.`;
              
              case 'salvar_preferencias_usuario':
                return `Preferências salvas com sucesso para o usuário ${parameters.user_name || parameters.user_session_id}. Total de interações: ${result.data.usuario.interaction_count}`;
              
              case 'buscar_preferencias_usuario':
                if (!result.data.existe) {
                  return `Usuário novo no sistema. Não há preferências salvas ainda.`;
                }
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
                return resumo.trim();
              
              default:
                return JSON.stringify(result.data);
            }
            
          } catch (error) {
            console.error(`🌙 Erro na ferramenta ${tool.function_name}:`, error);
            return `Erro ao executar ${tool.label}: ${error.message}`;
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
    onMessage: (message) => {
      console.log('🌙 Lunna disse:', message);
      console.log('🌙 Tipo da mensagem:', typeof message);
      console.log('🌙 Estrutura da mensagem:', Object.keys(message || {}));
      setLastMessage(message.message || '');
    },
    onError: (error) => {
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
      await conversation.setVolume({ volume: newVolume });
    } catch (error) {
      console.error('🌙 Erro ao ajustar volume:', error);
    }
  };

  useEffect(() => {
    const loadUserType = async () => {
      const type = await getUserType();
      setUserType(type);
    };
    
    loadUserType();
  }, [getUserType]);

  // Monitor speaking state and notify parent
  useEffect(() => {
    if (onSpeakingChange) {
      onSpeakingChange(conversation.isSpeaking || false);
    }
  }, [conversation.isSpeaking, onSpeakingChange]);

  useEffect(() => {
    return () => {
      if (isStarted) {
        endConversation();
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* Central console interface */}
      <div className="bg-black/90 border border-cyan-400/30 rounded-xl p-6 backdrop-blur">
        {/* Header with holographic title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-mono text-cyan-400 mb-2 tracking-wider">
            LUNNA NEURAL INTERFACE
          </h2>
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent mb-4" />
          
          {/* Connection Status */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`w-3 h-3 rounded-full ${
              conversation.status === 'connected' ? 'bg-green-400 shadow-[0_0_10px_#4ade80]' : 'bg-red-400 shadow-[0_0_10px_#f87171]'
            } animate-pulse`} />
            <span className="text-sm font-mono text-gray-300">
              NEURAL_LINK: {conversation.status === 'connected' ? 'ESTABLISHED' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg mb-6">
            <p className="text-red-400 font-mono text-sm">
              ERROR: {errorMessage}
            </p>
          </div>
        )}

        {/* Main Control Panel */}
        <div className="flex flex-col items-center gap-6">
          {/* Primary Action Button */}
          {!isStarted ? (
            <Button 
              onClick={startConversation}
              size="lg"
              disabled={!agentId}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 border border-cyan-400/50 px-8 py-6 text-lg font-mono tracking-wide shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-300"
            >
              <Mic className="w-6 h-6 mr-3" />
              INICIAR INTERFACE NEURAL
            </Button>
          ) : (
            <Button 
              onClick={endConversation}
              size="lg"
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 border border-red-400/50 px-8 py-6 text-lg font-mono tracking-wide shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all duration-300"
            >
              <MicOff className="w-6 h-6 mr-3" />
              DESCONECTAR
            </Button>
          )}

          {/* Voice Activity Indicator */}
          {isStarted && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                {conversation.isSpeaking ? (
                  <>
                    <div className="relative">
                      <Volume2 className="w-8 h-8 text-purple-400 animate-pulse" />
                      <div className="absolute inset-0 w-8 h-8 text-purple-400 animate-ping opacity-20">
                        <Volume2 className="w-8 h-8" />
                      </div>
                    </div>
                    <span className="text-purple-400 font-mono text-lg tracking-wide">
                      LUNNA_TRANSMITTING...
                    </span>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <Mic className="w-8 h-8 text-green-400 animate-pulse" />
                      <div className="absolute inset-0 w-8 h-8 text-green-400 animate-ping opacity-20">
                        <Mic className="w-8 h-8" />
                      </div>
                    </div>
                    <span className="text-green-400 font-mono text-lg tracking-wide">
                      AUDIO_INPUT_ACTIVE
                    </span>
                  </>
                )}
              </div>
              
              {/* Visual waveform simulation */}
              <div className="flex items-center justify-center gap-1">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 bg-cyan-400 rounded-full transition-all duration-200 ${
                      conversation.isSpeaking 
                        ? `h-${Math.floor(Math.random() * 8) + 2} animate-pulse` 
                        : 'h-1'
                    }`}
                    style={{
                      animationDelay: `${i * 50}ms`
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Volume Control */}
          {isStarted && (
            <div className="w-full max-w-sm space-y-3">
              <div className="flex items-center justify-between text-sm font-mono text-gray-400">
                <span>AUDIO_LEVEL</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <VolumeX className="w-4 h-4 text-gray-400" />
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div 
                    className="absolute top-0 left-0 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg pointer-events-none"
                    style={{ width: `${volume * 100}%` }}
                  />
                </div>
                <Volume2 className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          )}

          {/* Last Message Display */}
          {lastMessage && (
            <div className="w-full bg-gray-900/50 border border-cyan-400/20 p-4 rounded-lg">
              <div className="text-xs font-mono text-cyan-400 mb-2">LAST_TRANSMISSION:</div>
              <p className="text-gray-200 font-mono text-sm leading-relaxed">
                {lastMessage}
              </p>
            </div>
          )}
        </div>

        {/* System Instructions */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="text-xs font-mono text-gray-500 text-center space-y-1">
            {!agentId ? (
              <>
                <p className="text-red-400 font-bold">NEURAL_AGENT_ID: NOT_CONFIGURED</p>
                <p>• CONFIGURE_ELEVENLABS_AGENT</p>
                <p>• EXTRACT_AGENT_ID</p>
                <p>• UPDATE_SYSTEM_PARAMETERS</p>
              </>
            ) : (
              <>
                <p>• ACTIVATE_NEURAL_INTERFACE</p>
                <p>• GRANT_MICROPHONE_ACCESS</p>
                <p>• INITIATE_VOICE_PROTOCOL</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LunnaAssistant;