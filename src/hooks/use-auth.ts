import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { showError } from '@/utils/toast';

// 🔹 Profile tábla definíció
interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  organization_name: string | null;
  logo_url: string | null;
}

// 🔹 Auth állapot
interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
}

// 🔹 Kezdőérték
const initialAuthState: AuthState = {
  session: null,
  user: null,
  profile: null,
  isLoading: true,
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  // 🔹 Profil lekérdezése profile táblából
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, role, organization_name, logo_url')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        // Ha hiba van, de nem "nincs találat", akkor is null-t adunk vissza, de logoljuk.
        return null;
      }
      return data as Profile;
    } catch (e) {
      console.error('Unexpected error during profile fetch:', e);
      return null;
    }
  };

  // 🔹 Állapot frissítése
  const updateAuthState = (session: Session | null, profile: Profile | null, loading: boolean = false) => {
    setAuthState({
      session,
      user: session?.user || null,
      profile,
      isLoading: loading,
    });
  };

  // ✅ Teljes auth-logika egy useEffect-ben
  useEffect(() => {
    let isMounted = true;

    // 1️⃣ Inicializálás - Session + Profile lekérés
    const initialLoad = async () => {
      let session: Session | null = null;
      let profile: Profile | null = null;
      let errorOccurred = false;
      
      try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        session = sessionData.session;
        
        if (error) {
            console.error('Initial session error:', error);
            errorOccurred = true;
        }

        if (session?.user) {
          // A fetchProfile már kezeli a belső hibákat és null-t ad vissza, ha nem talál profilt.
          profile = await fetchProfile(session.user.id);
        }

      } catch (err) {
        console.error('Initial auth load failed:', err);
        errorOccurred = true;
      } finally {
        // CRITICAL: Always set isLoading to false in the end, regardless of success or failure
        if (isMounted) {
          updateAuthState(session, profile, false);
        }
      }
    };

    initialLoad();

    // 2️⃣ Auth események (login/logout/token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        // Ideiglenesen true-ra állítjuk, amíg a profil betöltődik
        setAuthState((prev) => ({ ...prev, isLoading: true }));

        let profile: Profile | null = null;
        if (session?.user) {
          profile = await fetchProfile(session.user.id);
        }

        // Mindig befejezzük a betöltést
        updateAuthState(session, profile, false);
      }
    );

    // 3️⃣ Ha visszatérsz az oldalra / mobilról → session frissítés
    const handleFocus = async () => {
      if (!isMounted) return;

      // Csak akkor állítjuk true-ra, ha már volt session, különben a felhasználó látja a villanást
      if (authState.user) {
        setAuthState(prev => ({ ...prev, isLoading: true }));
      }

      try {
        const { data: { session }, error } = await supabase.auth.refreshSession();
        if (error) console.error('Session refresh error:', error);

        let profile = null;
        if (session?.user) {
          profile = await fetchProfile(session.user.id);
        }

        if (isMounted) updateAuthState(session, profile, false);
      } catch (err) {
        console.error('Focus refresh error:', err);
        if (isMounted) updateAuthState(null, null, false);
      }
    };

    window.addEventListener('focus', handleFocus);

    // 4️⃣ Takarítás memóriahibák ellen
    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, []); // Dependency array is empty, runs only once on mount

  // 🔹 Kijelentkezés
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError('Hiba történt a kijelentkezés során.');
      console.error('Sign out error:', error);
    }
  };

  // 🔹 Visszatérő értékek
  return {
    ...authState,
    signOut,
    isAdmin: authState.profile?.role === 'admin',
    isAuthenticated: !!authState.user,
    fetchProfile,
  };
};