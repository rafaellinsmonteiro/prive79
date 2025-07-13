import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCurrentModel = () => {
  return useQuery({
    queryKey: ['current-model'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Usuário não está logado');
      }

      console.log('🔍 Buscando model profile para user:', user.user.id);

      const { data: modelProfile, error } = await supabase
        .from('model_profiles')
        .select('model_id, is_active, models(id, name)')
        .eq('user_id', user.user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar model profile:', error);
        throw error;
      }

      if (!modelProfile) {
        console.log('⚠️ Nenhum model profile encontrado');
        return null;
      }

      console.log('✅ Model profile encontrado:', modelProfile);
      return modelProfile;
    },
    retry: false,
  });
};