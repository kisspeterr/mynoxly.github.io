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

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // Use a shorter timeout and more aggressive error handling
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
            // If there's an error, try to create a default profile
            return createDefaultProfile(userId);
          }
          return data as Profile;
        });

      const result = await Promise.race([profilePromise, timeoutPromise]);
      return result;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const createDefaultProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('Creating default profile for user:', userId);
      
      // Get user email from auth table
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData?.user?.email || 'unknown@example.com';
      
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userEmail,
          first_name: null,
          last_name: null,
          role: 'user',
          display_name: null,
          avatar_url: null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating default profile:', error);
        return null;
      }

      console.log('Default profile created:', newProfile);
      return newProfile as Profile;
    } catch (error) {
      console.error('Error in createDefaultProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // First get session quickly
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
          
          // Always set loading to false after 5 seconds max
          setTimeout(() => {
            if (isMounted) {
              setIsLoading(false);
            }
          }, 5000);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
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
        
        // Always set loading to false
        if (isMounted) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
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