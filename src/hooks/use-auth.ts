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

    // 1️⃣ Inicializálás - Session lekérés (gyorsan)
    const initialLoad = async () => {
      let session: Session | null = null;
      
      try {
        // 1. Próbáljuk meg lekérni a sessiont a kliensből (localStorage/sessionStorage)
        const { data: sessionData, error } = await supabase.auth.getSession();
        session = sessionData.session;
        
        if (error) {
            console.error('Initial session error:', error);
        }

      } catch (err) {
        console.error('Initial auth load failed:', err);
      } finally {
        if (isMounted) {
            // 2. Gyorsan beállítjuk az állapotot isLoading=false-ra, még profil nélkül
            updateAuthState(session, null, false);
            
            // 3. Ha van session, aszinkron módon betöltjük a profilt
            if (session?.user) {
                fetchProfile(session.user.id).then(profile => {
                    if (isMounted && profile) {
                        // Frissítjük az állapotot a profillal, de már nem állítjuk be a loadert
                        setAuthState(prev => ({
                            ...prev,
                            profile: profile,
                            // isLoading már false
                        }));
                    }
                });
            }
        }
      }
    };

    initialLoad();

    // 2️⃣ Auth események (login/logout/token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        // Ha bejelentkezés vagy kijelentkezés történik, ideiglenesen mutassuk a loadert
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