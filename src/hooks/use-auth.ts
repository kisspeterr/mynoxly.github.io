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
  organization_name: string | null; // Added missing field
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

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, role, organization_name') // Fetching all fields
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
  };

  // This function handles setting the final state based on session/user/profile data
  const updateAuthState = (session: Session | null, profile: Profile | null, loading: boolean = false) => {
    setAuthState({
      session,
      user: session?.user || null,
      profile,
      isLoading: loading,
    });
  };

  useEffect(() => {
    let isMounted = true;
    
    const initialLoad = async () => {
      let session: Session | null = null;
      let profile: Profile | null = null;
      let user: User | null = null;

      try {
        // 1. Get Session
        const { data: { session: fetchedSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Initial Supabase session fetch failed:", sessionError);
        }
        
        session = fetchedSession;
        user = session?.user || null;

        // 2. Fetch Profile if session exists
        if (user) {
          profile = await fetchProfile(user.id);
        }
        
        if (isMounted) {
          // Set final state: isAuthenticated, profile loaded, isLoading=false
          updateAuthState(session, profile, false);
        }

      } catch (error) {
        console.error("Unexpected error during initial auth load:", error);
        if (isMounted) {
          // If any unexpected error occurs, clear loading state
          updateAuthState(null, null, false);
        }
      }
    };

    initialLoad();

    // 2. Real-time auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      // Start loading state for state changes (e.g., SIGNED_IN/OUT)
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      let profile: Profile | null = null;
      if (session) {
        profile = await fetchProfile(session.user.id);
      }
      
      // Update state after profile fetch, setting isLoading=false
      updateAuthState(session, profile, false);
    });

    return () => {
      isMounted = false;
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