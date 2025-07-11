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
    <div className={`relative ${className}`}>
      {/* Modern minimalist interface */}
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
              conversation.status === 'connected' 
                ? 'bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]' 
                : 'bg-rose-400 shadow-[0_0_20px_rgba(251,113,133,0.6)]'
            }`} />
            <span className="text-lg font-light text-white tracking-wider">
              {conversation.status === 'connected' ? 'Conectada' : 'Offline'}
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

        {/* Main Action */}
        <div className="text-center">
          {!isStarted ? (
            <button 
              onClick={startConversation}
              disabled={!agentId}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-rose-500 to-pink-600 rounded-full shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
            >
              <Mic className="w-6 h-6 mr-3 group-hover:animate-pulse" />
              Conversar com Lunna
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </button>
          ) : (
            <button 
              onClick={endConversation}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-gray-600 to-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <MicOff className="w-6 h-6 mr-3 group-hover:animate-pulse" />
              Encerrar
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </button>
          )}
        </div>

        {/* Voice Activity */}
        {isStarted && (
          <div className="text-center space-y-6">
            {/* Status indicator */}
            <div className="flex items-center justify-center gap-4">
              {conversation.isSpeaking ? (
                <>
                  <div className="relative">
                    <Volume2 className="w-8 h-8 text-purple-400" />
                    <div className="absolute -inset-2 rounded-full bg-purple-400/20 animate-ping" />
                  </div>
                  <span className="text-purple-300 text-lg font-light">
                    Lunna está falando
                  </span>
                </>
              ) : (
                <>
                  <div className="relative">
                    <Mic className="w-8 h-8 text-emerald-400" />
                    <div className="absolute -inset-2 rounded-full bg-emerald-400/20 animate-pulse" />
                  </div>
                  <span className="text-emerald-300 text-lg font-light">
                    Pode falar
                  </span>
                </>
              )}
            </div>

            {/* Audio visualization */}
            <div className="flex items-center justify-center gap-1 h-8">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 bg-gradient-to-t from-rose-400 to-pink-500 rounded-full transition-all duration-200 ${
                    conversation.isSpeaking 
                      ? `h-${[2, 4, 6, 8, 6, 4, 8, 6, 4, 2, 4, 6][i]} animate-pulse` 
                      : 'h-2'
                  }`}
                  style={{
                    animationDelay: `${i * 100}ms`
                  }}
                />
              ))}
            </div>

            {/* Volume Control */}
            <div className="max-w-xs mx-auto space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Volume</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <VolumeX className="w-4 h-4 text-gray-400" />
                <div className="flex-1 relative h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-200"
                    style={{ width: `${volume * 100}%` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <Volume2 className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        )}

        {/* Last Message */}
        {lastMessage && (
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4">
            <p className="text-gray-200 text-sm leading-relaxed">
              <span className="text-rose-400 font-medium">Lunna:</span> {lastMessage}
            </p>
          </div>
        )}

        {/* Instructions */}
        {!agentId && (
          <div className="text-center space-y-2">
            <p className="text-rose-400 text-sm font-medium">Agent ID não configurado</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Configure um Agent ID do ElevenLabs</p>
              <p>para ativar a assistente de voz</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LunnaAssistant;