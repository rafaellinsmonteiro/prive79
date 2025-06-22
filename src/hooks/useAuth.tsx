
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing state');
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
          authComplete: false // Reset authComplete when auth state changes
        }));
        
        if (session?.user) {
          // Check if user is admin using the security definer function
          setTimeout(async () => {
            try {
              console.log('Checking admin status for user:', session.user.id);
              const { data, error } = await supabase.rpc('is_admin');
              console.log('Admin check result:', { data, error });
              
              if (error) {
                console.error('Error checking admin status:', error);
                // User is authenticated but not admin - treat as regular user
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
              console.error('Error calling is_admin function:', error);
              // User is authenticated but admin check failed - treat as regular user
              setState(prev => ({ 
                ...prev, 
                isAdmin: false, 
                loading: false, 
                authComplete: true 
              }));
            }
          }, 0);
        } else {
          console.log('No user session, setting as non-admin');
          setState(prev => ({ 
            ...prev, 
            isAdmin: false, 
            loading: false, 
            authComplete: true 
          }));
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', !!session);
      setState(prev => ({ ...prev, session, user: session?.user ?? null }));
    });

    return () => subscription.unsubscribe();
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
    console.log('Signing out user');
    try {
      // Clear state immediately to prevent UI flickering
      setState(prev => ({
        ...prev,
        loading: true
      }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        // Reset loading state if there's an error
        setState(prev => ({
          ...prev,
          loading: false
        }));
        return { error };
      }
      
      console.log('Sign out successful');
      // State will be updated by the auth state change listener
      return { error: null };
    } catch (error) {
      console.error('Sign out exception:', error);
      setState(prev => ({
        ...prev,
        loading: false
      }));
      return { error };
    }
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
  };
};
