import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LunnaTool {
  id: string;
  name: string;
  label: string;
  description?: string;
  function_name: string;
  is_active: boolean;
  parameters?: any;
  allowed_user_types?: string[];
  display_order: number;
  category?: string;
  created_at: string;
  updated_at: string;
}

export const useLunnaTools = () => {
  const [tools, setTools] = useState<LunnaTool[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTools = async () => {
    try {
      const { data, error } = await supabase
        .from('lunna_tools')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Erro ao buscar ferramentas:', error);
      toast.error('Erro ao carregar ferramentas');
    } finally {
      setLoading(false);
    }
  };

  const createTool = async (toolData: Omit<LunnaTool, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('lunna_tools')
        .insert(toolData)
        .select()
        .single();

      if (error) throw error;
      
      setTools(prev => [...prev, data].sort((a, b) => a.display_order - b.display_order));
      return data;
    } catch (error) {
      console.error('Erro ao criar ferramenta:', error);
      throw error;
    }
  };

  const updateTool = async (id: string, toolData: Partial<LunnaTool>) => {
    try {
      const { data, error } = await supabase
        .from('lunna_tools')
        .update(toolData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTools(prev => 
        prev.map(tool => tool.id === id ? data : tool)
          .sort((a, b) => a.display_order - b.display_order)
      );
      return data;
    } catch (error) {
      console.error('Erro ao atualizar ferramenta:', error);
      throw error;
    }
  };

  const deleteTool = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lunna_tools')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTools(prev => prev.filter(tool => tool.id !== id));
    } catch (error) {
      console.error('Erro ao deletar ferramenta:', error);
      throw error;
    }
  };

  const reorderTool = async (id: string, direction: 'up' | 'down') => {
    try {
      const currentTool = tools.find(tool => tool.id === id);
      if (!currentTool) return;

      const currentIndex = tools.findIndex(tool => tool.id === id);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (newIndex < 0 || newIndex >= tools.length) return;

      const targetTool = tools[newIndex];
      
      // Trocar as ordens
      await Promise.all([
        supabase
          .from('lunna_tools')
          .update({ display_order: targetTool.display_order })
          .eq('id', currentTool.id),
        supabase
          .from('lunna_tools')
          .update({ display_order: currentTool.display_order })
          .eq('id', targetTool.id)
      ]);

      // Recarregar a lista
      await fetchTools();
    } catch (error) {
      console.error('Erro ao reordenar ferramenta:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  return {
    tools,
    loading,
    createTool,
    updateTool,
    deleteTool,
    reorderTool,
    refetch: fetchTools
  };
};