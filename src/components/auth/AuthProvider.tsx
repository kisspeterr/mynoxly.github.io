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
    let subscription: any = null;

    console.log('🚀 Starting auth initialization...');

    // Immediate timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.log('⏰ Auth initialization timeout reached');
        setIsLoading(false);
      }
    }, 5000);

    const initializeAuth = async () => {
      try {
        console.log('🔍 Getting initial session...');
        
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session error:', error);
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }

        console.log('✅ Session retrieved:', initialSession?.user?.id);

        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            console.log('👤 User found, fetching profile...');
            // Fetch profile but don't wait for it
            fetchProfile(initialSession.user.id).then(profileData => {
              if (isMounted && profileData) {
                setProfile(profileData);
              }
            }).catch(err => {
              console.error('❌ Profile fetch error:', err);
            });
          }
          
          setIsLoading(false);
          clearTimeout(timeoutId);
        }
      } catch (error) {
        console.error('💥 Auth initialization error:', error);
        if (isMounted) {
          setIsLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    subscription = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('🔄 Auth state changed:', event);
      
      if (!isMounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (newSession?.user) {
        fetchProfile(newSession.user.id).then(profileData => {
          if (isMounted && profileData) {
            setProfile(profileData);
          }
        });
      } else {
        setProfile(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (subscription?.subscription) {
        subscription.subscription.unsubscribe();
      }
    };
  }, []);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('📋 Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Profile fetch error:', error);
        return null;
      }

      console.log('✅ Profile fetched successfully');
      return data as Profile;
    } catch (error) {
      console.error('💥 Profile fetch exception:', error);
      return null;
    }
  };

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