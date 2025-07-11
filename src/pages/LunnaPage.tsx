import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LunnaAssistant from '@/components/chat/LunnaAssistant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sparkles, Brain, Zap } from 'lucide-react';
import lunnaVideo from '@/assets/lunna-bg-video.mp4';
const LunnaPage = () => {
  const {
    user
  } = useAuth();
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
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-rose-900/20 relative overflow-hidden">
      {/* Video Background */}
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" loop muted playsInline src={lunnaVideo} />
      
      {/* Elegant overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
      
      {/* Subtle particle effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="text-center pt-16 pb-12">
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-rose-400/50 to-transparent" />
            <h1 className="text-5xl font-light tracking-[0.2em] text-white">
              LUNNA
            </h1>
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-rose-400/50 to-transparent" />
          </div>
          <p className="text-xl text-gray-300 font-light tracking-wide max-w-lg mx-auto">
            Sua assistente de voz inteligente
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-lg">
            {/* Central Interface */}
            <div className="relative">
              {/* Glow effect behind */}
              <div className="absolute -inset-8 bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-rose-500/20 rounded-full blur-2xl opacity-60" />
              
              {/* Main card */}
              <div className="">
                <LunnaAssistant agentId="agent_01jzx4f2x3ed98w1rhycp8sz7n" onSpeakingChange={handleSpeakingChange} className="bg-transparent border-none shadow-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 pb-16 max-w-4xl mx-auto">
          <div className="group text-center p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Inteligente</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              IA conversacional avançada com compreensão natural
            </p>
          </div>

          <div className="group text-center p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Expressiva</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Voz natural e expressiva powered by ElevenLabs
            </p>
          </div>

          <div className="group text-center p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Instantânea</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Respostas em tempo real via WebSocket
            </p>
          </div>
        </div>
      </div>
    </div>;
};
export default LunnaPage;