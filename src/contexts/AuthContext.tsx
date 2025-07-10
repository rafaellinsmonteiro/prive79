import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  authComplete: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
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
    
    console.log('AuthProvider: Initializing auth listener');
    
    // Set up auth state listener - only one instance
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isSubscribed) return;
        
        console.log('AuthProvider: Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('AuthProvider: User signed out or no session');
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
              console.log('AuthProvider: Checking admin status for user:', session.user.id);
              const { data, error } = await supabase.rpc('is_admin');
              
              if (!isSubscribed) return;
              
              if (error) {
                console.error('AuthProvider: Error checking admin status:', error);
                setState(prev => ({ 
                  ...prev, 
                  isAdmin: false, 
                  loading: false, 
                  authComplete: true 
                }));
              } else {
                console.log('AuthProvider: User is admin:', !!data);
                setState(prev => ({ 
                  ...prev, 
                  isAdmin: !!data, 
                  loading: false, 
                  authComplete: true 
                }));
              }
            } catch (error) {
              if (!isSubscribed) return;
              
              console.error('AuthProvider: Error calling is_admin function:', error);
              setState(prev => ({ 
                ...prev, 
                isAdmin: false, 
                loading: false, 
                authComplete: true 
              }));
            }
          }, 200);
        }
      }
    );

    // Check for existing session only once
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isSubscribed) return;
      
      console.log('AuthProvider: Initial session check:', !!session);
      setState(prev => ({ ...prev, session, user: session?.user ?? null }));
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth listener');
      isSubscribed = false;
      clearTimeout(adminCheckDebounce);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider: Attempting sign in for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('AuthProvider: Sign in result:', { success: !!data.user, error: !!error });
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
    console.log('AuthProvider: Starting sign out process');
    
    try {
      console.log('AuthProvider: Attempting to sign out from Supabase');
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('AuthProvider: Supabase sign out error:', error);
        // Force clear state even if Supabase fails
        setState({
          user: null,
          session: null,
          loading: false,
          isAdmin: false,
          authComplete: true,
        });
        return { error: null };
      }
      
      console.log('AuthProvider: Supabase sign out successful');
      return { error: null };
    } catch (error) {
      console.error('AuthProvider: Sign out exception:', error);
      // Force clear everything on exception
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

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}