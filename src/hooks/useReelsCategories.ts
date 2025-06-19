
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ReelsCategory {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export const useReelsCategories = () => {
  return useQuery({
    queryKey: ['reels-categories'],
    queryFn: async (): Promise<ReelsCategory[]> => {
      const { data, error } = await supabase
        .from('reels_categories')
        .select('*')
        .order('display_order');

      if (error) {
        console.error('Erro ao buscar categorias de reels:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useCreateReelsCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (category: Omit<ReelsCategory, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('reels_categories')
        .insert(category)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar categoria de reels:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels-categories'] });
      toast({
        title: "Sucesso",
        description: "Categoria de reels criada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao criar categoria: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateReelsCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...category }: Partial<ReelsCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('reels_categories')
        .update(category)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar categoria de reels:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels-categories'] });
      toast({
        title: "Sucesso",
        description: "Categoria de reels atualizada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar categoria: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteReelsCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reels_categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar categoria de reels:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels-categories'] });
      toast({
        title: "Sucesso",
        description: "Categoria de reels deletada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao deletar categoria: " + error.message,
        variant: "destructive",
      });
    },
  });
};
