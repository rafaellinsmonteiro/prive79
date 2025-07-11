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
          <LunnaAssistant agentId="agent_01jzx4f2x3ed98w1rhycp8sz7n" />
        </div>

        {/* Instruções de Configuração */}
        <Card className="mt-8 max-w-2xl mx-auto bg-blue-500/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center gap-2">
              📋 Como Configurar a Lunna
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-blue-300">1. Crie um Agent no ElevenLabs:</p>
                <p className="text-muted-foreground">• Acesse o portal ElevenLabs Conversational AI</p>
                <p className="text-muted-foreground">• Crie um novo agente com personalidade da Lunna</p>
              </div>
              <div>
                <p className="font-medium text-blue-300">2. Configure o Agent ID:</p>
                <p className="text-muted-foreground">• Copie o Agent ID gerado</p>
                <p className="text-muted-foreground">• Substitua 'undefined' por seu Agent ID em LunnaPage.tsx</p>
              </div>
              <div>
                <p className="font-medium text-blue-300">3. Teste a Conexão:</p>
                <p className="text-muted-foreground">• Recarregue a página após configurar</p>
                <p className="text-muted-foreground">• Clique em "Falar com Lunna" para testar</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LunnaPage;