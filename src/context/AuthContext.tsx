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
  confirmEmail: (tokenHash: string, type: string) => Promise<{ error: string | null }>;
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

    // 1. Get the current session once on mount.
    //    The Supabase JS v2 client automatically handles PKCE code exchange and
    //    implicit-flow token fragments on its own when the page loads.
    //    We do NOT manually call exchangeCodeForSession() or verifyOtp() here —
    //    that would race with the client's own handler and consume the token twice.
    //    Instead, onAuthStateChange below receives SIGNED_IN with the resulting session.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((err) => {
      console.error('Error checking initial session:', err);
      setLoading(false);
    });

    // 2. Listen to all auth state changes — including SIGNED_IN after email confirmation.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_OUT') {
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

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          // emailRedirectTo is not used with the custom TokenHash template approach —
          // the template links directly to the app's /confirm screen.
          data: {
            full_name: fullName?.trim() || '',
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      // If user is returned but session is null, email confirmation is required
      const requiresEmailConfirmation = Boolean(data.user && !data.session);

      return { error: null, requiresEmailConfirmation };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during sign up';
      return { error: message };
    }
  };

  /**
   * confirmEmail — called by EmailConfirmPage when the user clicks "Confirm & Continue".
   * Verifies the token_hash from the confirmation URL. On success, onAuthStateChange
   * fires with SIGNED_IN and the session is automatically set.
   */
  const confirmEmail = async (
    tokenHash: string,
    type: string
  ): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured.' };
    }

    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as 'signup' | 'email' | 'recovery',
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during verification';
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
        confirmEmail,
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
