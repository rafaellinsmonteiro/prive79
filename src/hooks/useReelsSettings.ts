
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ReelsSettings {
  id: string;
  is_enabled: boolean;
  auto_play: boolean;
  show_controls: boolean;
  max_duration: number | null;
  items_per_page: number | null;
  created_at: string;
  updated_at: string;
}

export const useReelsSettings = () => {
  return useQuery({
    queryKey: ['reels-settings'],
    queryFn: async (): Promise<ReelsSettings | null> => {
      const { data, error } = await supabase
        .from('reels_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Erro ao buscar configurações de reels:', error);
        throw error;
      }

      return data;
    },
  });
};

export const useUpdateReelsSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Partial<ReelsSettings>) => {
      const { data, error } = await supabase
        .from('reels_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar configurações de reels:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels-settings'] });
      toast({
        title: "Sucesso",
        description: "Configurações de reels atualizadas com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar configurações: " + error.message,
        variant: "destructive",
      });
    },
  });
};
