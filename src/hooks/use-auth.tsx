import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { showError } from '@/utils/toast';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  organization_name: string | null;
  logo_url: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<Profile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, role, organization_name, logo_url')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
        console.error('Error fetching profile:', error);
        return null;
      }
      return data as Profile;
    } catch (e) {
      console.error('Unexpected error during profile fetch:', e);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      // 1. Get initial session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error getting initial session:", sessionError);
      }

      if (isMounted) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // 2. Fetch profile if session exists
        if (currentSession?.user) {
          const userProfile = await fetchProfile(currentSession.user.id);
          if (isMounted) setProfile(userProfile);
        }
        
        setIsLoading(false);
      }
    };

    initializeSession();

    // 3. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (isMounted) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          const userProfile = await fetchProfile(newSession.user.id);
          if (isMounted) setProfile(userProfile);
        } else {
          if (isMounted) setProfile(null);
        }
        
        // Set loading to false after any auth change is processed
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError('Hiba történt a kijelentkezés során.');
      console.error('Sign out error:', error);
    }
  };

  const value: AuthContextType = {
    session,
    user,
    profile,
    isLoading,
    signOut,
    fetchProfile,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};