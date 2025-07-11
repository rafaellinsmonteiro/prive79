import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useUserType = () => {
  const { user, isAdmin } = useAuth();

  const getUserType = async (): Promise<'admin' | 'modelo' | 'cliente' | null> => {
    if (!user) return null;
    
    if (isAdmin) return 'admin';
    
    try {
      // Verificar se é modelo
      const { data: modelProfile } = await supabase
        .from('model_profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
      
      if (modelProfile) return 'modelo';
      
      // Se não é admin nem modelo, é cliente
      return 'cliente';
    } catch (error) {
      console.error('Erro ao verificar tipo de usuário:', error);
      return 'cliente';
    }
  };

  return { getUserType };
};