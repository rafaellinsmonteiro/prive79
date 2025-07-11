import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LunnaAssistant from '@/components/chat/LunnaAssistant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sparkles, Brain, Zap, MessageSquare, Mic } from 'lucide-react';
import lunnaVideo from '@/assets/lunna-bg-video.mp4';

const LunnaPage = () => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mode, setMode] = useState<'audio' | 'text'>('audio');
  
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-rose-900/20 relative overflow-hidden">
      {/* Video Background */}
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" loop muted playsInline src={lunnaVideo} />
      
      {/* Elegant overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60 transition-opacity duration-500 ${
        mode === 'text' ? 'opacity-100' : 'opacity-100'
      }`} />
      
      {/* Additional overlay for text mode */}
      <div className={`absolute inset-0 bg-black/50 transition-opacity duration-500 ${
        mode === 'text' ? 'opacity-100' : 'opacity-0'
      }`} />
      
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
            Sua assistente inteligente
          </p>
          
          {/* Mode Toggle */}
          <div className="mt-8 flex items-center justify-center">
            <div className="bg-black/20 backdrop-blur border border-white/10 rounded-full p-1 flex">
              <button
                onClick={() => setMode('audio')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  mode === 'audio'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Mic className="w-4 h-4" />
                Modo Áudio
              </button>
              <button
                onClick={() => setMode('text')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  mode === 'text'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Modo Texto
              </button>
            </div>
          </div>
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
                <LunnaAssistant 
                  agentId="agent_01jzx4f2x3ed98w1rhycp8sz7n" 
                  onSpeakingChange={handleSpeakingChange} 
                  className="bg-transparent border-none shadow-none"
                  mode={mode}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 pb-16 max-w-4xl mx-auto">
          
        </div>
      </div>
    </div>
  );
};

export default LunnaPage;