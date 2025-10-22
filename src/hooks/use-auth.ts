import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { showError } from '@/utils/toast';

// Profile tábla típusa
interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  organization_name: string | null;
  logo_url: string | null;
}

// Auth állapot szerkezete
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

  // Profil lekérdezése
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, role, organization_name, logo_url')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data as Profile;
    } catch (e) {
      console.error('Unexpected error during profile fetch:', e);
      return null;
    }
  };

  // Auth állapot setter
  const updateAuthState = (session: Session | null, profile: Profile | null, loading = false) => {
    setAuthState({
      session,
      user: session?.user || null,
      profile,
      isLoading: loading,
    });
  };

  useEffect(() => {
    let isMounted = true;

    // ✅ 1. Initial session + profil betöltés timeouthoz védve
    const initialLoad = async () => {
      const timeout = setTimeout(() => {
        if (isMounted) {
          console.warn('Auth initialLoad timeout → forcing isLoading=false');
          updateAuthState(null, null, false);
        }
      }, 1000); // 1mp után akkor is leáll, ha Supabase / fetch leakadt

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) console.error('Initial session error:', error);

        let profile: Profile | null = null;
        if (session?.user) {
          try {
            profile = await fetchProfile(session.user.id);
          } catch (e) {
            console.error('Profile fetch error:', e);
          }
        }

        if (isMounted) {
          clearTimeout(timeout);
          updateAuthState(session, profile, false);
        }
      } catch (err) {
        console.error('Initial auth load failed:', err);
        if (isMounted) {
          clearTimeout(timeout);
          updateAuthState(null, null, false);
        }
      }
    };

    initialLoad();

    // ✅ 2. Auth változás (signin, signout, tokenrefresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;

        setAuthState(prev => ({ ...prev, isLoading: true }));

        let profile: Profile | null = null;
        if (session?.user) {
          profile = await fetchProfile(session.user.id);
        }

        updateAuthState(session, profile, false);
      }
    );

    // ✅ 3. Tab/window visszatérés → session frissítés
    const handleFocus = async () => {
      if (!isMounted) return;
      setAuthState(prev => ({ ...prev, isLoading: true }));

      try {
        const { data: { session }, error } = await supabase.auth.refreshSession();
        if (error) console.error('Session refresh error:', error);

        let profile: Profile | null = null;
        if (session?.user) {
          profile = await fetchProfile(session.user.id);
        }

        if (isMounted) {
          updateAuthState(session, profile, false);
        }
      } catch (err) {
        console.error('Focus refresh error:', err);
        if (isMounted) updateAuthState(null, null, false);
      }
    };

    window.addEventListener('focus', handleFocus);

    // ✅ 4. Cleanup → események leiratkozása
    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // ✅ Kijelentkezés
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
    isAdmin: authState.profile?.role === 'admin',
    isAuthenticated: !!authState.user,
    fetchProfile,
  };
};

const initialAuthState = {
  session: null,
  user: null,
  profile: null,
  isLoading: true,      // auth+profile töltése
  isReady: false        // minden kész → session + profile betöltve
};
