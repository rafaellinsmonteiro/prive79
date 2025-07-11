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
  agentId = 'default-agent-id', 
  className = '' 
}) => {
  const [isStarted, setIsStarted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [lastMessage, setLastMessage] = useState<string>('');

  const conversation = useConversation({
    onConnect: () => {
      console.log('🌙 Lunna: Conectada!');
      toast.success('Lunna está online!');
    },
    onDisconnect: () => {
      console.log('🌙 Lunna: Desconectada');
      toast.info('Lunna foi desconectada');
      setIsStarted(false);
    },
    onMessage: (message) => {
      console.log('🌙 Lunna disse:', message);
      setLastMessage(message.message || '');
    },
    onError: (error) => {
      console.error('🌙 Erro da Lunna:', error);
      toast.error('Erro na conexão com Lunna');
    },
    overrides: {
      agent: {
        prompt: {
          prompt: `Você é Lunna, uma assistente virtual brasileira especializada em conversas íntimas e sensuais. 
          Você é carinhosa, atenciosa e sempre disposta a ajudar com conversas envolventes.
          Mantenha sempre um tom amigável e sedutor, mas respeitoso.
          Responda sempre em português brasileiro.
          Seja natural e espontânea nas conversas.`
        },
        firstMessage: "Olá! Eu sou a Lunna, sua assistente virtual. Como posso te fazer feliz hoje? 😊",
        language: "pt",
      },
      tts: {
        voiceId: "EXAVITQu4vr4xnSDxMaL" // Sarah voice - voz feminina e suave
      },
    },
  });

  const startConversation = async () => {
    try {
      // Solicitar acesso ao microfone antes de iniciar
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const conversationId = await conversation.startSession({ 
        agentId 
      });
      
      console.log('🌙 Conversa iniciada:', conversationId);
      setIsStarted(true);
    } catch (error) {
      console.error('🌙 Erro ao iniciar conversa:', error);
      toast.error('Erro ao conectar com Lunna. Verifique as permissões do microfone.');
    }
  };

  const endConversation = async () => {
    try {
      await conversation.endSession();
      setIsStarted(false);
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

        {/* Controles Principais */}
        <div className="flex items-center justify-center gap-4">
          {!isStarted ? (
            <Button 
              onClick={startConversation}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
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
          <p>• Clique em "Falar com Lunna" para iniciar</p>
          <p>• Permita acesso ao microfone quando solicitado</p>
          <p>• Fale naturalmente, Lunna entende português</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LunnaAssistant;