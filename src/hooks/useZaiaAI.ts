
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ZaiaAIRequest {
  message: string;
  context?: string;
  type?: 'chat' | 'analysis' | 'generation';
}

export interface ZaiaAIResponse {
  response: string;
  success: boolean;
  error?: string;
}

export const useZaiaAI = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (request: ZaiaAIRequest): Promise<ZaiaAIResponse> => {
      const { data, error } = await supabase.functions.invoke('zaia-ai', {
        body: request
      });

      if (error) {
        console.error('Erro ao chamar Zaia AI:', error);
        throw error;
      }

      return data;
    },
    onError: (error: any) => {
      console.error('Error in useZaiaAI:', error);
      toast({
        title: "Erro",
        description: "Erro ao comunicar com Zaia AI: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useZaiaContentGeneration = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ prompt, type }: { prompt: string; type: string }): Promise<ZaiaAIResponse> => {
      const { data, error } = await supabase.functions.invoke('zaia-ai', {
        body: {
          message: prompt,
          type: 'generation',
          context: `Generate ${type} content`
        }
      });

      if (error) {
        console.error('Erro ao gerar conteúdo com Zaia AI:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Conteúdo gerado com sucesso!",
      });
    },
    onError: (error: any) => {
      console.error('Error in useZaiaContentGeneration:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar conteúdo: " + error.message,
        variant: "destructive",
      });
    },
  });
};
