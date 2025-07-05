import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClientOptions = () => {
  return useQuery({
    queryKey: ['client-options'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('model_profiles')
        .select('model_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!profile) throw new Error('Perfil de modelo não encontrado');

      const { data, error } = await supabase
        .from('clients')
        .select('id, name, phone')
        .eq('model_id', profile.model_id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
  });
};

export const useServiceOptions = () => {
  return useQuery({
    queryKey: ['service-options'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('model_profiles')
        .select('model_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!profile) throw new Error('Perfil de modelo não encontrado');

      const { data, error } = await supabase
        .from('services')
        .select('id, name, price, duration')
        .eq('model_id', profile.model_id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
  });
};