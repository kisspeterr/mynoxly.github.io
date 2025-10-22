import { useState, useEffect } from 'react';
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

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean; // Még töltjük a session/profile adatokat
  isReady: boolean;   // Már biztosan tudjuk, mi az auth állapot!
}

const initialAuthState: AuthState = {
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isReady: false,
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

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

  const updateAuthState = (session: Session | null, profile: Profile | null, loading: boolean) => {
    setAuthState({
      session,
      user: session?.user || null,
      profile,
      isLoading: loading,
      isReady: !loading, // Akkor lesz kész az auth állapot, ha már nem töltünk!
    });
  };

  useEffect(() => {
    let isMounted = true;

    const initialLoad = async () => {
      // ⛔ Biztonsági timeout – ha Supabase vagy profil fetch beragad, ne logoljon örökké
      const timeout = setTimeout(() => {
        if (isMounted) {
          console.warn('Auth timeout – forcing isReady = true to avoid freeze');
          updateAuthState(null, null, false);
        }
      }, 1500);

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) console.error('Initial session error:', error);

        let profile: Profile | null = null;
        if (session?.user) {
          profile = await fetchProfile(session.user.id);
        }

        if (isMounted) {
          clearTimeout(timeout);
          updateAuthState(session, profile, false);
        }
      } catch (err) {
        console.error('Initial auth load failed:', err);
        if (isMounted) {
          updateAuthState(null, null, false);
        }
      }
    };

    initialLoad();

    // 🔁 Auth változások (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        setAuthState(prev => ({ ...prev, isLoading: true, isReady: false }));

        let profile: Profile | null = null;
        if (session?.user) {
          profile = await fetchProfile(session.user.id);
        }

        updateAuthState(session, profile, false);
      }
    );

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
    isAuthenticated: !!authState.user,
    isAdmin: authState.profile?.role === 'admin',
    signOut,
    fetchProfile,
  };
};
