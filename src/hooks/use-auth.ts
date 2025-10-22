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
  isLoading: true, // CRITICAL: Must be true initially
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
        // Ez a hívás a Supabase kliensből azonnal megpróbálja lekérni a sessiont a localStorage-ból.
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

        // Csak a SIGNED_IN/SIGNED_OUT eseményeknél állítjuk be a loadingot, hogy elkerüljük a villogást
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            setAuthState((prev) => ({ ...prev, isLoading: true }));
        }

        let profile: Profile | null = null;
        if (session?.user) {
          profile = await fetchProfile(session.user.id);
        }

        // Mindig befejezzük a betöltést
        updateAuthState(session, profile, false);
      }
    );

    // 3️⃣ Ha visszatérsz az oldalra / mobilról → session frissítés (CSAK HÁTTÉRBEN)
    const handleFocus = async () => {
      if (!isMounted) return;

      // Ha nincs felhasználó, de még tölt (initialLoad), akkor hagyjuk, hogy az initialLoad befejezze.
      if (!authState.user && authState.isLoading) {
          return;
      }
      
      // Ha van felhasználó, NE állítsuk be a loadingot, hogy elkerüljük a villogást.
      
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
        // Frissítjük az állapotot, de isLoading=false-szal.
        if (isMounted) {
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