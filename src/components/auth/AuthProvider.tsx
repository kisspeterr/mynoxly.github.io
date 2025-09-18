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
  isSupabaseAvailable: boolean;
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
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(true);

  const testSupabaseConnection = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1);
      return !error;
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
  };

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    if (!isSupabaseAvailable) {
      console.log('Supabase not available, skipping profile fetch');
      return null;
    }

    try {
      console.log('Fetching profile for user:', userId);
      
      const timeoutPromise = new Promise<null>((resolve) => 
        setTimeout(() => {
          console.log('Profile fetch timeout after 3 seconds');
          resolve(null);
        }, 3000)
      );

      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Supabase profile error:', error);
            return null;
          }
          return data as Profile;
        });

      const result = await Promise.race([profilePromise, timeoutPromise]);
      return result;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Test Supabase connection first
        const supabaseAvailable = await testSupabaseConnection();
        if (isMounted) {
          setIsSupabaseAvailable(supabaseAvailable);
        }

        if (!supabaseAvailable) {
          console.warn('Supabase is not available, using local auth state');
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }

        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            console.log('User logged in, fetching profile...');
            const userProfile = await fetchProfile(initialSession.user.id);
            if (isMounted) {
              setProfile(userProfile);
            }
          } else {
            console.log('No user logged in');
            setProfile(null);
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    if (isSupabaseAvailable) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.id);
        if (isMounted) {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          if (newSession?.user) {
            const userProfile = await fetchProfile(newSession.user.id);
            if (isMounted) {
              setProfile(userProfile);
            }
          } else {
            setProfile(null);
          }
          setIsLoading(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [isSupabaseAvailable]);

  const signOut = async () => {
    if (isSupabaseAvailable) {
      await supabase.auth.signOut();
    } else {
      setSession(null);
      setUser(null);
      setProfile(null);
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signOut,
    isSupabaseAvailable,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};