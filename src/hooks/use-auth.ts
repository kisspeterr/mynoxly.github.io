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
      // We intentionally skip showing an error here if the user is signing out or if it's a fresh signup
      // showError('Nem sikerült betölteni a felhasználói profilt.');
      return null;
    }
    return data as Profile;
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    const handleSession = async (session: Session | null) => {
      if (!isMounted) return;

      let profile: Profile | null = null;
      let user: User | null = null;

      if (session) {
        user = session.user;
        try {
          profile = await fetchProfile(session.user.id);
        } catch (e) {
          console.error("Error fetching profile:", e);
        }
      }

      setAuthState({
        session,
        user,
        profile,
        isLoading: false,
      });
    };

    // Set a timeout to force loading state to false after 8 seconds
    timeoutId = setTimeout(() => {
      if (isMounted && authState.isLoading) {
        console.warn("Auth session check timed out. Forcing isLoading=false.");
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    }, 8000); // 8 seconds timeout

    // 1. Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await handleSession(session);
    }).catch(error => {
      console.error("Initial Supabase session fetch failed:", error);
      // If fetch fails entirely, ensure loading state is cleared
      if (isMounted) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    }).finally(() => {
      // Ensure timeout is cleared once the initial check is done, regardless of success/failure
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    });

    // 2. Real-time auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Set loading true temporarily for state changes (e.g., sign in/out)
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setAuthState(prev => ({ ...prev, isLoading: true }));
      }
      
      // Wait for session handling to complete and set isLoading to false
      await handleSession(session);
    });

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
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