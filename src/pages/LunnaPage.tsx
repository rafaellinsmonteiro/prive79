import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LunnaAssistant from '@/components/chat/LunnaAssistant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sparkles, Brain, Zap } from 'lucide-react';
import lunnaVideo from '@/assets/lunna-bg-video.mp4';

const LunnaPage = () => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeakingChange = (speaking: boolean) => {
    setIsSpeaking(speaking);
    if (videoRef.current) {
      if (speaking) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        loop
        muted
        playsInline
        src={lunnaVideo}
      />
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <Brain className="w-16 h-16 text-cyan-400 animate-pulse" />
              <div className="absolute inset-0 w-16 h-16 text-cyan-400 animate-ping opacity-20">
                <Brain className="w-16 h-16" />
              </div>
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              LUNNA AI
            </h1>
            <div className="relative">
              <Zap className="w-16 h-16 text-purple-400 animate-pulse" />
              <div className="absolute inset-0 w-16 h-16 text-purple-400 animate-ping opacity-20">
                <Zap className="w-16 h-16" />
              </div>
            </div>
          </div>
          <p className="text-xl text-cyan-200 max-w-3xl mx-auto font-light tracking-wide">
            SISTEMA DE INTELIGÊNCIA ARTIFICIAL AVANÇADA
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mt-2">
            Assistente virtual com tecnologia de conversação neural
          </p>
        </div>

        {/* Futuristic Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-black/80 backdrop-blur border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-3 text-lg">
                <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center">
                  <Brain className="w-4 h-4" />
                </div>
                CONVERSAÇÃO NEURAL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm leading-relaxed">
                Sistema de processamento de linguagem natural com algoritmos avançados de compreensão contextual
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/80 backdrop-blur border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-3 text-lg">
                <div className="w-8 h-8 rounded-full bg-purple-400/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                SÍNTESE VOCAL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm leading-relaxed">
                Tecnologia ElevenLabs de última geração para reprodução de voz hiper-realista e expressiva
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/80 backdrop-blur border-pink-500/30 hover:border-pink-400/50 transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="text-pink-400 flex items-center gap-3 text-lg">
                <div className="w-8 h-8 rounded-full bg-pink-400/20 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                TEMPO REAL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm leading-relaxed">
                Comunicação instantânea através de conexões WebSocket de alta performance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Assistant Component */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Glowing border effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-2xl blur opacity-20 animate-pulse" />
            <div className="relative bg-black/90 border border-cyan-400/30 rounded-2xl p-8">
              <LunnaAssistant 
                agentId="agent_01jzx4f2x3ed98w1rhycp8sz7n" 
                onSpeakingChange={handleSpeakingChange}
              />
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-12 max-w-2xl mx-auto">
          <Card className="bg-black/80 backdrop-blur border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2 text-lg">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                STATUS DO SISTEMA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="text-gray-400">CONEXÃO:</p>
                  <p className="text-green-400 font-mono">ONLINE</p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-400">IA STATUS:</p>
                  <p className="text-cyan-400 font-mono">{isSpeaking ? 'ATIVA' : 'STANDBY'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LunnaPage;