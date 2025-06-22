
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface CurrentUserData {
  id: string;
  user_id: string;
  email: string;
  name?: string;
  phone?: string;
  user_role: 'admin' | 'modelo' | 'cliente';
  plan_id?: string;
  is_active: boolean;
  plan?: {
    id: string;
    name: string;
    price: number;
    description?: string;
  };
}

export const useCurrentUser = () => {
  const { user, session } = useAuth();
  
  return useQuery({
    queryKey: ['current-user', user?.id],
    queryFn: async (): Promise<CurrentUserData | null> => {
      if (!user || !session) {
        console.log('useCurrentUser - No user or session');
        return null;
      }

      console.log('useCurrentUser - Fetching user data for:', user.id);
      
      const { data, error } = await supabase
        .from('system_users')
        .select(`
          *,
          plans (
            id,
            name,
            price,
            description
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('useCurrentUser - Error fetching user data:', error);
        throw error;
      }

      if (!data) {
        console.log('useCurrentUser - No user data found');
        return null;
      }

      console.log('useCurrentUser - User data:', data);

      return {
        ...data,
        plan: data.plans || undefined
      } as CurrentUserData;
    },
    enabled: !!user && !!session,
  });
};

export const useUserPlan = () => {
  const { data: currentUser } = useCurrentUser();
  return currentUser?.plan;
};
