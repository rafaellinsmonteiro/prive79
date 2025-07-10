
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
  
  // Reduced logging to prevent console spam
  
  return useQuery({
    queryKey: ['current-user', user?.id],
    queryFn: async (): Promise<CurrentUserData | null> => {
      console.log('useCurrentUser - Query function starting...');
      
      if (!user || !session) {
        console.log('useCurrentUser - No user or session, returning null');
        return null;
      }

      console.log('useCurrentUser - Starting fetch with auth user:', {
        id: user.id,
        email: user.email,
        aud: user.aud,
        role: user.role
      });
      
      // First get the user data - try by user_id first, then by email
      let { data: userData, error: userError } = await supabase
        .from('system_users')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      console.log('useCurrentUser - Query by user_id result:', { userData, userError });

      // If not found by user_id, try by email
      if (!userData && user.email) {
        console.log('useCurrentUser - User not found by user_id, trying by email:', user.email);
        const { data: userByEmail, error: emailError } = await supabase
          .from('system_users')
          .select('*')
          .eq('email', user.email)
          .eq('is_active', true)
          .maybeSingle();
        
        console.log('useCurrentUser - Query by email result:', { userByEmail, emailError });
        
        userData = userByEmail;
        userError = emailError;
      }

      if (userError) {
        console.error('useCurrentUser - Error fetching user data:', userError);
        throw userError;
      }

      // If no user found, create one for the demo user
      if (!userData && user.email === 'cliente@demo.com') {
        console.log('useCurrentUser - Creating demo user in system_users');
        
        // Get the first available plan
        const { data: plans, error: plansError } = await supabase
          .from('plans')
          .select('*')
          .eq('is_active', true)
          .limit(1);
        
        if (plansError) {
          console.error('Error fetching plans:', plansError);
        }

        const planId = plans && plans.length > 0 ? plans[0].id : null;
        
        const { data: newUser, error: createError } = await supabase
          .from('system_users')
          .insert({
            user_id: user.id,
            email: user.email,
            name: user.user_metadata?.name || 'Cliente Demo',
            user_role: 'cliente',
            plan_id: planId,
            is_active: true
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          alert(`Erro ao criar usuário: ${createError.message}`);
        } else {
          console.log('Demo user created successfully:', newUser);
          userData = newUser;
          alert('Usuário demo criado com sucesso!');
        }
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
      } else {
        console.log('useCurrentUser - User has no plan_id:', userData.plan_id);
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
        plan_name: result.plan?.name,
        has_plan: !!result.plan
      });

      return result;
    },
    enabled: !!user && !!session,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useUserPlan = () => {
  const { data: currentUser } = useCurrentUser();
  return currentUser?.plan;
};
