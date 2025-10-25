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
        // Nem dobunk hibát, csak null-t adunk vissza
        return null;
      }
      return data as Profile;
    } catch (e) {
      console.error('Unexpected error during profile fetch:', e);
      return null;
    }
  };

  // 🔹 Állapot frissítése (segédfüggvény)
  const updateAuthState = async (session: Session | null) => {
    let user = session?.user || null;
    let profile: Profile | null = null;

    if (user) {
      // 1. Profil betöltése, ha van felhasználó
      profile = await fetchProfile(user.id);
    }

    // 2. Állapot frissítése - MINDIG befejeződik
    setAuthState({
      session: session,
      user: user,
      profile: profile,
      isLoading: false, // CRITICAL: It MUST be false here.
    });
  };

  // ✅ Teljes auth-logika egy useEffect-ben
  useEffect(() => {
    let isMounted = true;

    // 1️⃣ Kezdeti betöltés
    const initialLoad = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (isMounted) {
            // Frissítjük az állapotot a session és a profil adatokkal
            await updateAuthState(sessionData.session);
        }

      } catch (err) {
        console.error('Initial auth load failed:', err);
        if (isMounted) {
            // Hiba esetén is be kell fejezni a betöltést
            setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      }
    };

    initialLoad();

    // 2️⃣ Auth események (login/logout/token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        // Ha bejelentkezés vagy token frissítés történik, ideiglenesen beállítjuk a betöltést true-ra,
        // hogy a UI ne villanjon fel a régi adatokkal, amíg az új profil be nem töltődik.
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
            setAuthState(prev => ({ ...prev, isLoading: true }));
        }
        
        // Frissítjük az állapotot az új sessionnel és a hozzá tartozó profillal
        await updateAuthState(session);
      }
    );

    // 3️⃣ Takarítás memóriahibák ellen
    return () => {
      isMounted = false;
      subscription.unsubscribe();
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