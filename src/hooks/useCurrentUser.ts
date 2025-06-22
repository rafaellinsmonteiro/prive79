
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
      
      // First get the user data
      const { data: userData, error: userError } = await supabase
        .from('system_users')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (userError) {
        console.error('useCurrentUser - Error fetching user data:', userError);
        throw userError;
      }

      if (!userData) {
        console.log('useCurrentUser - No user data found');
        return null;
      }

      let planData = null;
      if (userData.plan_id) {
        const { data: plan, error: planError } = await supabase
          .from('plans')
          .select('*')
          .eq('id', userData.plan_id)
          .maybeSingle();

        if (planError) {
          console.error('useCurrentUser - Error fetching plan data:', planError);
        } else {
          planData = plan;
        }
      }

      console.log('useCurrentUser - User data:', userData);
      console.log('useCurrentUser - Plan data:', planData);

      return {
        ...userData,
        plan: planData || undefined
      } as CurrentUserData;
    },
    enabled: !!user && !!session,
  });
};

export const useUserPlan = () => {
  const { data: currentUser } = useCurrentUser();
  return currentUser?.plan;
};
