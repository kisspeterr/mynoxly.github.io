import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { showError } from '@/utils/toast';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin'; // Simplified roles
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
}

const initialAuthState: AuthState = {
  session: null,
  user: null,
  profile: null,
  isLoading: true,
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      showError('Nem sikerült betölteni a felhasználói profilt.');
      return null;
    }
    return data as Profile;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      let profile: Profile | null = null;
      let user: User | null = null;

      if (session) {
        user = session.user;
        try {
          // Fetch profile, handling potential errors
          profile = await fetchProfile(session.user.id);
        } catch (e) {
          console.error("Error fetching profile during auth state change:", e);
        }
      }

      // Ensure isLoading is set to false regardless of success/failure
      setAuthState({
        session,
        user,
        profile,
        isLoading: false,
      });
    });

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      let profile: Profile | null = null;
      let user: User | null = null;

      try {
        if (session) {
          user = session.user;
          // Fetch profile, handling potential errors
          profile = await fetchProfile(session.user.id);
        }
      } catch (e) {
        console.error("Error fetching profile during initial session check:", e);
      } finally {
        // Ensure isLoading is set to false regardless of success/failure
        setAuthState({
          session,
          user,
          profile,
          isLoading: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError('Hiba történt a kijelentkezés során.');
      console.error('Sign out error:', error);
    }
  };

  return {
    ...authState,
    signOut,
    isAdmin: authState.profile?.role === 'admin', // Simplified check
    isAuthenticated: !!authState.user,
  };
};