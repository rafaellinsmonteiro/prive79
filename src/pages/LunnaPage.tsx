import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LunnaAssistant from '@/components/chat/LunnaAssistant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sparkles } from 'lucide-react';

const LunnaPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-pink-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Moon className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Lunna AI
            </h1>
            <Sparkles className="w-12 h-12 text-pink-400" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sua assistente virtual pessoal com inteligência artificial conversacional
          </p>
        </div>

        {/* Informações sobre Lunna */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card/50 backdrop-blur border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-purple-400">🎙️ Conversação Natural</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Lunna usa IA avançada para conversar naturalmente em português brasileiro
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-pink-500/20">
            <CardHeader>
              <CardTitle className="text-pink-400">🔊 Voz Realista</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tecnologia ElevenLabs para uma voz suave e expressiva
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-blue-400">⚡ Tempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Respostas instantâneas através de conexão WebSocket
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Componente Principal da Lunna */}
        <div className="max-w-2xl mx-auto">
          <LunnaAssistant agentId="your-agent-id" />
        </div>

        {/* Aviso sobre Configuração */}
        <Card className="mt-8 max-w-2xl mx-auto bg-yellow-500/10 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              ⚙️ Configuração Necessária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Configure um Agent ID no ElevenLabs Conversational AI</p>
              <p>• Substitua "your-agent-id" pelo ID real do seu agente</p>
              <p>• Certifique-se de que sua API Key do ElevenLabs está configurada</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LunnaPage;