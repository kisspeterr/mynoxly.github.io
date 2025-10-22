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
  logo_url: string | null; // Added new field
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
        .select('id, first_name, last_name, avatar_url, role, organization_name, logo_url') // Fetching all fields including logo_url
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
  try {
    // 1️⃣ Session lekérése Supabase-től (storage-ből/jwt-ből)
    const { data: { session: fetchedSession }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Initial Supabase session fetch failed:", sessionError);
    }

    let profile: Profile | null = null;

    // 2️⃣ Ha be van jelentkezve → profil lekérése
    if (fetchedSession?.user) {
      profile = await fetchProfile(fetchedSession.user.id);
    }

    // 3️⃣ A legfontosabb rész: akár van user, akár nincs → állítsuk le a loadingot
    if (isMounted) {
      updateAuthState(fetchedSession, profile, false); // isLoading = false
    }

  } catch (error) {
    console.error("Unexpected error during initial auth load:", error);
    if (isMounted) {
      // Hiba esetén is zárjuk le a loading állapotot
      updateAuthState(null, null, false);
    }
    

    initialLoad();

    // 2. Real-time auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      // Start loading state for state changes (e.g., SIGNED_IN/OUT, TOKEN_REFRESHED)
      // We only set loading true if we expect a profile fetch or a significant change
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        setAuthState(prev => ({ ...prev, isLoading: true }));
      }
      
      let profile: Profile | null = null;
      if (session) {
        profile = await fetchProfile(session.user.id);
      }
      
      // Update state after profile fetch, setting isLoading=false
      updateAuthState(session, profile, false);
    });
    
    // 3. Handle focus event for session refresh (Crucial for mobile/tab switching)
    const handleFocus = async () => {
        if (!isMounted) return;
        
        // Set loading state immediately to prevent UI flicker/hanging
        setAuthState(prev => ({ ...prev, isLoading: true }));
        
        try {
            // Explicitly refresh the session
            const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
            
            let profile: Profile | null = null;
            if (refreshedSession) {
                profile = await fetchProfile(refreshedSession.user.id);
            }
            
            if (isMounted) {
                // Update state with the refreshed session and profile
                updateAuthState(refreshedSession, profile, false);
            }
            
            if (refreshError) {
                console.error("Session refresh error on focus:", refreshError);
            }
        } catch (error) {
            console.error("Unexpected error during focus refresh:", error);
            if (isMounted) {
                // Ensure loading state is cleared even on error
                updateAuthState(null, null, false);
            }
        }
    };

    window.addEventListener('focus', handleFocus);


    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
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
    fetchProfile, // Export fetchProfile for manual refresh after update
  };
};