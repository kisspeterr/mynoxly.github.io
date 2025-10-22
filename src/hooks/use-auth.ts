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
      
      try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        session = sessionData.session;
        
        if (error) {
            console.error('Initial session error:', error);
        }

        if (session?.user) {
          profile = await fetchProfile(session.user.id);
        }

      } catch (err) {
        console.error('Initial auth load failed:', err);
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

      // Ha már van felhasználó, ne mutassunk loadert, csak frissítsünk a háttérben.
      // Ha nincs felhasználó, de a session frissítés elindul, akkor is a jelenlegi állapotot tartjuk.
      const userExists = !!authState.user;
      
      // Ha nincs felhasználó, de még tölt (initialLoad), akkor hagyjuk, hogy az initialLoad befejezze.
      if (!userExists && authState.isLoading) {
          return;
      }
      
      // Ha van felhasználó, ideiglenesen beállítjuk a loadingot, hogy a profil frissüljön, de a AuthLoader már nem fogja mutatni, ha a shouldShowLoading logikája helyes.
      // DE: A mobil böngészőben a focus esemény okozza a beragadást. Ezért itt nem állítjuk be a loadingot, csak a végén.
      
      let session: Session | null = authState.session;
      let profile: Profile | null = authState.profile;

      try {
        const { data: refreshData, error } = await supabase.auth.refreshSession();
        session = refreshData.session;
        
        if (error) console.error('Session refresh error:', error);

        if (session?.user) {
          profile = await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Focus refresh error:', err);
      } finally {
        // CRITICAL: Garantáljuk, hogy a betöltés befejeződik, de csak akkor frissítjük az állapotot, ha van változás.
        if (isMounted) {
            // Ha a session frissült, frissítjük az állapotot, de isLoading=false-szal.
            updateAuthState(session, profile, false);
        }
      }
    };

    window.addEventListener('focus', handleFocus);

    // 4️⃣ Takarítás memóriahibák ellen
    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, [authState.user]); // Dependency added: authState.user. Ha a felhasználó bejelentkezik/kijelentkezik, újra kell futtatni a focus listenert.
  
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