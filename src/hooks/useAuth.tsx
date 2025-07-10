
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  authComplete: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAdmin: false,
    authComplete: false,
  });

  useEffect(() => {
    let isSubscribed = true;
    let adminCheckDebounce: NodeJS.Timeout;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isSubscribed) return;
        
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('User signed out or no session, clearing state');
          setState({
            user: null,
            session: null,
            loading: false,
            isAdmin: false,
            authComplete: true,
          });
          return;
        }
        
        setState(prev => ({ 
          ...prev, 
          session, 
          user: session?.user ?? null,
          loading: true,
          authComplete: false
        }));
        
        if (session?.user) {
          // Debounce admin check to prevent multiple calls
          clearTimeout(adminCheckDebounce);
          adminCheckDebounce = setTimeout(async () => {
            if (!isSubscribed) return;
            
            try {
              console.log('Checking admin status for user:', session.user.id);
              const { data, error } = await supabase.rpc('is_admin');
              console.log('Admin check result:', { data, error });
              
              if (!isSubscribed) return;
              
              if (error) {
                console.error('Error checking admin status:', error);
                setState(prev => ({ 
                  ...prev, 
                  isAdmin: false, 
                  loading: false, 
                  authComplete: true 
                }));
              } else {
                console.log('User is admin:', !!data);
                setState(prev => ({ 
                  ...prev, 
                  isAdmin: !!data, 
                  loading: false, 
                  authComplete: true 
                }));
              }
            } catch (error) {
              if (!isSubscribed) return;
              
              console.error('Error calling is_admin function:', error);
              setState(prev => ({ 
                ...prev, 
                isAdmin: false, 
                loading: false, 
                authComplete: true 
              }));
            }
          }, 100); // 100ms debounce
        }
      }
    );

    // Check for existing session only once
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isSubscribed) return;
      
      console.log('Initial session check:', !!session);
      setState(prev => ({ ...prev, session, user: session?.user ?? null }));
    });

    return () => {
      isSubscribed = false;
      clearTimeout(adminCheckDebounce);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('Sign in result:', { success: !!data.user, error: !!error });
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { data, error };
  };

  const signOut = async () => {
    console.log('Starting sign out process');
    
    try {
      // Try to sign out from Supabase FIRST
      console.log('Attempting to sign out from Supabase');
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Supabase sign out error:', error);
        // Force clear local storage and state even if Supabase fails
        localStorage.removeItem('sb-hhpcrtpevucuucoiodxh-auth-token');
        setState({
          user: null,
          session: null,
          loading: false,
          isAdmin: false,
          authComplete: true,
        });
        return { error: null }; // Return success to UI
      }
      
      console.log('Supabase sign out successful');
      // State will be cleared by onAuthStateChange listener
      return { error: null };
    } catch (error) {
      console.error('Sign out exception:', error);
      // Force clear everything on exception
      localStorage.removeItem('sb-hhpcrtpevucuucoiodxh-auth-token');
      setState({
        user: null,
        session: null,
        loading: false,
        isAdmin: false,
        authComplete: true,
      });
      return { error: null };
    }
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
  };
};
