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
      return null;
    }
    return data as Profile;
  };

  // This function handles setting the final state based on session/user/profile data
  const updateAuthState = (session: Session | null, profile: Profile | null) => {
    setAuthState({
      session,
      user: session?.user || null,
      profile,
      isLoading: false,
    });
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    const initialLoad = async () => {
      let session: Session | null = null;
      let profile: Profile | null = null;

      try {
        // 1. Get Session
        const { data: { session: fetchedSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Initial Supabase session fetch failed:", sessionError);
          // If session fetch fails, we proceed with null session/profile
        }
        
        session = fetchedSession;

        // 2. Fetch Profile if session exists
        if (session) {
          profile = await fetchProfile(session.user.id);
        }
        
        if (isMounted) {
          updateAuthState(session, profile);
        }

      } catch (error) {
        console.error("Unexpected error during initial auth load:", error);
        if (isMounted) {
          // If any unexpected error occurs, clear loading state
          updateAuthState(null, null);
        }
      } finally {
        // 3. Ensure timeout is cleared
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      }
    };

    // Set a timeout to force loading state to false after 8 seconds
    timeoutId = setTimeout(() => {
      if (isMounted && authState.isLoading) {
        console.warn("Auth session check timed out. Forcing isLoading=false.");
        // Force state update without waiting for network calls
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    }, 8000); // 8 seconds timeout

    initialLoad();

    // 2. Real-time auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      // Set loading true temporarily for state changes (e.g., sign in/out)
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setAuthState(prev => ({ ...prev, isLoading: true }));
      }
      
      let profile: Profile | null = null;
      if (session) {
        profile = await fetchProfile(session.user.id);
      }
      
      // Update state after profile fetch
      updateAuthState(session, profile);
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