
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
      console.log('useCurrentUser - User email:', user.email);
      
      // First get the user data - try by user_id first, then by email
      let { data: userData, error: userError } = await supabase
        .from('system_users')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      // If not found by user_id, try by email
      if (!userData && user.email) {
        console.log('useCurrentUser - User not found by user_id, trying by email:', user.email);
        const { data: userByEmail, error: emailError } = await supabase
          .from('system_users')
          .select('*')
          .eq('email', user.email)
          .eq('is_active', true)
          .maybeSingle();
        
        userData = userByEmail;
        userError = emailError;
      }

      if (userError) {
        console.error('useCurrentUser - Error fetching user data:', userError);
        throw userError;
      }

      if (!userData) {
        console.log('useCurrentUser - No user data found for user_id:', user.id, 'or email:', user.email);
        return null;
      }

      console.log('useCurrentUser - Found user data:', userData);

      let planData = null;
      if (userData.plan_id) {
        console.log('useCurrentUser - Fetching plan data for plan_id:', userData.plan_id);
        const { data: plan, error: planError } = await supabase
          .from('plans')
          .select('*')
          .eq('id', userData.plan_id)
          .maybeSingle();

        if (planError) {
          console.error('useCurrentUser - Error fetching plan data:', planError);
        } else {
          planData = plan;
          console.log('useCurrentUser - Found plan data:', planData);
        }
      }

      const result = {
        ...userData,
        plan: planData || undefined
      } as CurrentUserData;

      console.log('useCurrentUser - Final result:', {
        id: result.id,
        user_id: result.user_id,
        email: result.email,
        user_role: result.user_role,
        plan_id: result.plan_id,
        plan_name: result.plan?.name
      });

      return result;
    },
    enabled: !!user && !!session,
  });
};

export const useUserPlan = () => {
  const { data: currentUser } = useCurrentUser();
  return currentUser?.plan;
};
