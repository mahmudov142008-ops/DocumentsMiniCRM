import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { clearCrmUserData } from '../utils/cacheManager';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: string | null; requiresEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // 0. Process email confirmation / PKCE / OTP callbacks from URL.
    // Returns true if a session was successfully established from the callback URL.
    const processAuthCallback = async (): Promise<boolean> => {
      if (typeof window === 'undefined') return false;

      const searchParams = new URLSearchParams(window.location.search);
      const hashStr = window.location.hash.startsWith('#')
        ? window.location.hash.substring(1)
        : window.location.hash;
      const hashParams = new URLSearchParams(hashStr);

      const tokenHash = searchParams.get('token_hash') || hashParams.get('token_hash');
      const otpType = (searchParams.get('type') || hashParams.get('type')) as 'signup' | 'email' | 'recovery' | null;
      const code = searchParams.get('code') || hashParams.get('code');
      const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');

      if (errorDescription) {
        console.warn('Supabase Auth redirect error:', errorDescription);
        return false;
      } else if (tokenHash && otpType) {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType as any,
          });
          if (!error && data?.session) {
            setSession(data.session);
            setUser(data.session.user);
            // Clear auth params from URL, navigate to dashboard
            window.history.replaceState(null, '', window.location.pathname + '#dashboard');
            setLoading(false);
            return true;
          }
        } catch (err) {
          console.error('Error verifying email OTP:', err);
        }
        return false;
      } else if (code) {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && data?.session) {
            setSession(data.session);
            setUser(data.session.user);
            // Clear auth params from URL, navigate to dashboard
            window.history.replaceState(null, '', window.location.pathname + '#dashboard');
            setLoading(false);
            return true;
          }
        } catch (err) {
          console.error('Error exchanging code for session:', err);
        }
        return false;
      }

      return false;
    };

    // 1. Process callback; only fall back to getSession() if the callback did NOT
    //    already establish a session. This prevents the getSession() call from
    //    racing with the PKCE/OTP exchange and overwriting the new session with null.
    processAuthCallback().then((callbackEstablishedSession) => {
      if (callbackEstablishedSession) {
        // Session already set by processAuthCallback — nothing more to do here.
        return;
      }
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }).catch((err) => {
        console.error('Error checking initial session:', err);
        setLoading(false);
      });
    });

    // 2. Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        clearCrmUserData();
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase credentials are not configured. Please check your .env file.' };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during sign in';
      return { error: message };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ error: string | null; requiresEmailConfirmation?: boolean }> => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase credentials are not configured. Please check your .env file.' };
    }

    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/`
      : 'https://documents-mini-crm.vercel.app/';

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName?.trim() || '',
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      // If user is returned but session is null, email confirmation is active in Supabase
      const requiresEmailConfirmation = Boolean(data.user && !data.session);

      return { error: null, requiresEmailConfirmation };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during sign up';
      return { error: message };
    }
  };

  const signOut = async (): Promise<void> => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error signing out:', err);
      }
    }
    clearCrmUserData();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
