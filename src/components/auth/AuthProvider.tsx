"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    console.log('🔐 Starting auth initialization - IMMEDIATE MODE');

    // Set IMMEDIATE timeout - don't wait for Supabase
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.log('⏰ IMMEDIATE timeout - Supabase not responding, setting loading false');
        setIsLoading(false);
      }
    }, 1000); // Only 1 second!

    const initializeAuth = async () => {
      try {
        console.log('📋 Getting session (non-blocking)...');
        
        // Use Promise.race to prevent hanging
        const sessionPromise = Promise.race([
          supabase.auth.getSession(),
          new Promise<null>((resolve) => 
            setTimeout(() => resolve(null), 2000)
          )
        ]);

        const result = await sessionPromise;
        
        if (!isMounted) return;

        if (result && !result.error) {
          console.log('✅ Session retrieved:', result.data.session?.user?.email);
          setSession(result.data.session);
          setUser(result.data.session?.user ?? null);
        } else {
          console.log('ℹ️ No session found or timeout');
        }
        
        setIsLoading(false);
        clearTimeout(timeoutId);
      } catch (error) {
        console.error('💥 Auth init error:', error);
        if (isMounted) {
          setIsLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes but don't wait for them
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('🔄 Auth state change detected:', event);
      if (isMounted) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};