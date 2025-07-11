import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string, voice: string = 'Sarah') => {
    if (!text.trim()) return;

    setIsLoading(true);

    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Generate speech
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice }
      });

      if (error) {
        throw error;
      }

      // Create audio from base64
      const audioData = `data:audio/mpeg;base64,${data.audioContent}`;
      const audio = new Audio(audioData);
      audioRef.current = audio;

      // Set up event listeners
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsPlaying(false);
        audioRef.current = null;
        toast({
          title: "Erro",
          description: "Erro ao reproduzir áudio.",
          variant: "destructive",
        });
      };

      // Play audio
      await audio.play();
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating speech:', error);
      setIsLoading(false);
      toast({
        title: "Erro",
        description: "Erro ao gerar áudio. Tente novamente.",
        variant: "destructive",
      });
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  }, []);

  return {
    speak,
    stop,
    isPlaying,
    isLoading,
  };
};