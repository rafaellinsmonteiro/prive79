import React, { useState, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LunnaAssistantProps {
  agentId?: string;
  className?: string;
}

const LunnaAssistant: React.FC<LunnaAssistantProps> = ({ 
  agentId, 
  className = '' 
}) => {
  const [isStarted, setIsStarted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [lastMessage, setLastMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

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
    clientTools: {
      buscar_cidades: async () => {
        console.log('🌙 Lunna está buscando cidades disponíveis');
        try {
          const response = await fetch('https://hhpcrtpevucuucoiodxh.functions.supabase.co/lunna-data-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'buscar_cidades' })
          });
          const result = await response.json();
          return `Cidades do Prive: ${result.data.cidades.map(c => c.nome).join(', ')}`;
        } catch (error) {
          return `Erro ao buscar cidades: ${error.message}`;
        }
      },
      
      buscar_modelos_por_cidade: async (parameters: { cidade_nome: string; limite?: number }) => {
        console.log('🌙 Lunna está buscando modelos por cidade:', parameters);
        try {
          const response = await fetch('https://hhpcrtpevucuucoiodxh.functions.supabase.co/lunna-data-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'buscar_modelos_por_cidade',
              filters: { cidade_nome: parameters.cidade_nome, limit: parameters.limite || 5 }
            })
          });
          const result = await response.json();
          
          if (result.data.modelos.length === 0) {
            return `Não temos acompanhantes cadastradas no Prive em ${parameters.cidade_nome}.`;
          }
          
          const modelos = result.data.modelos.map(m => 
            `${m.nome} (${m.idade} anos, ${m.bairro || 'centro'}, R$ ${m.preco_1h || 'consultar'}/h)`
          ).join(', ');
          
          return `Acompanhantes do Prive em ${parameters.cidade_nome}: ${modelos}`;
        } catch (error) {
          return `Erro ao buscar acompanhantes: ${error.message}`;
        }
      },
      
      buscar_modelos_geral: async (parameters: { limite?: number }) => {
        console.log('🌙 Lunna está buscando modelos gerais:', parameters);
        try {
          const response = await fetch('https://hhpcrtpevucuucoiodxh.functions.supabase.co/lunna-data-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'buscar_modelos',
              filters: { limit: parameters.limite || 5 }
            })
          });
          const result = await response.json();
          
          const modelos = result.data.modelos.map(m => 
            `${m.nome} (${m.idade} anos, ${m.cidade || 'N/A'}, R$ ${m.preco_1h || 'consultar'}/h)`
          ).join(', ');
          
          return `Acompanhantes disponíveis no Prive: ${modelos}`;
        } catch (error) {
          return `Erro ao buscar acompanhantes: ${error.message}`;
        }
      },
      
      estatisticas_prive: async () => {
        console.log('🌙 Lunna está buscando estatísticas do Prive');
        try {
          const response = await fetch('https://hhpcrtpevucuucoiodxh.functions.supabase.co/lunna-data-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'estatisticas_sistema' })
          });
          const result = await response.json();
          
          return `O Prive possui ${result.data.estatisticas.total_modelos} acompanhantes cadastradas em ${result.data.estatisticas.total_cidades} cidades diferentes.`;
        } catch (error) {
          return `Erro ao buscar estatísticas: ${error.message}`;
        }
      }
    },
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
    return () => {
      if (isStarted) {
        endConversation();
      }
    };
  }, []);

  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          🌙 Lunna - Sua Assistente Virtual
        </CardTitle>
        <CardDescription>
          Assistente conversacional com voz natural
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status da Conexão */}
        <div className="flex items-center justify-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            conversation.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-sm text-muted-foreground">
            Status: {conversation.status === 'connected' ? 'Conectada' : 'Desconectada'}
          </span>
        </div>

        {/* Mensagem de Erro */}
        {errorMessage && (
          <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
            <p className="text-sm text-destructive font-medium">
              ⚠️ {errorMessage}
            </p>
          </div>
        )}

        {/* Controles Principais */}
        <div className="flex items-center justify-center gap-4">
          {!isStarted ? (
            <Button 
              onClick={startConversation}
              size="lg"
              disabled={!agentId}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
            >
              <Mic className="w-5 h-5 mr-2" />
              Falar com Lunna
            </Button>
          ) : (
            <Button 
              onClick={endConversation}
              variant="destructive"
              size="lg"
            >
              <MicOff className="w-5 h-5 mr-2" />
              Encerrar Conversa
            </Button>
          )}
        </div>

        {/* Indicador de Fala */}
        {isStarted && (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              {conversation.isSpeaking ? (
                <>
                  <Volume2 className="w-5 h-5 text-purple-500 animate-pulse" />
                  <span className="text-purple-500">Lunna está falando...</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 text-green-500" />
                  <span className="text-green-500">Pode falar, Lunna está ouvindo</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Controle de Volume */}
        {isStarted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Volume</span>
              <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <VolumeX className="w-4 h-4" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="flex-1"
              />
              <Volume2 className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Última Mensagem */}
        {lastMessage && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">
              <strong>Lunna:</strong> {lastMessage}
            </p>
          </div>
        )}

        {/* Instruções */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          {!agentId ? (
            <>
              <p className="text-destructive font-medium">⚠️ Agent ID não configurado</p>
              <p>• Acesse o ElevenLabs e crie um Conversational AI Agent</p>
              <p>• Copie o Agent ID e configure no código</p>
              <p>• Substitua o valor em LunnaPage.tsx</p>
            </>
          ) : (
            <>
              <p>• Clique em "Falar com Lunna" para iniciar</p>
              <p>• Permita acesso ao microfone quando solicitado</p>
              <p>• Fale naturalmente, Lunna entende português</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LunnaAssistant;