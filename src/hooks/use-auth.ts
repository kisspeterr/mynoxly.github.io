import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { showError } from '@/utils/toast';
import { useQuery } from '@tanstack/react-query';

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

// 🔹 Session és Profil adatok lekérdezése
interface AuthData {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
}

const fetchAuthData = async (): Promise<AuthData> => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
        console.error('Supabase getSession error:', sessionError);
        // Ha a session hiba, akkor nincs felhasználó
        return { session: null, user: null, profile: null };
    }
    
    const user = session?.user || null;
    let profile: Profile | null = null;
    
    if (user) {
        profile = await fetchProfile(user.id);
    }
    
    return { session, user, profile };
};


export const useAuth = () => {
  // React Query használata a kezdeti betöltéshez és újrapróbálkozáshoz
  const { data, isLoading, refetch } = useQuery<AuthData>({
    queryKey: ['authSession'],
    queryFn: fetchAuthData,
    staleTime: Infinity, // A session adatok csak auth eseményre frissülnek
    retry: 3, // 3 újrapróbálkozás hiba esetén
    retryDelay: 1000,
  });
  
  // 🔹 Realtime Auth események figyelése
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Ha bejelentkezés, kijelentkezés vagy token frissítés történik, 
        // kényszerítjük a React Query cache frissítését.
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
            // A refetch hívás automatikusan beállítja az isLoading állapotot true-ra, 
            // majd frissíti az adatokat.
            refetch();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [refetch]);
  
  // 🔹 Kijelentkezés
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError('Hiba történt a kijelentkezés során.');
      console.error('Sign out error:', error);
    } else {
        // Kézi cache invalidálás kijelentkezés után
        refetch();
    }
  };
  
  // 🔹 Profil frissítésének kényszerítése (pl. beállítások mentése után)
  const forceProfileRefetch = useCallback(async (userId: string) => {
      // Kézzel frissítjük a profilt, majd frissítjük a query cache-t
      const newProfile = await fetchProfile(userId);
      
      // Mivel a queryKey 'authSession', a refetch frissíti az összes adatot.
      // A legegyszerűbb, ha csak refetch-et hívunk, de ha azonnali frissítés kell, 
      // akkor a queryClient.setQueryData-t kellene használni.
      // Maradunk a refetch-nél, ami a legbiztonságosabb.
      refetch();
  }, [refetch]);


  // 🔹 Visszatérő értékek
  return {
    session: data?.session || null,
    user: data?.user || null,
    profile: data?.profile || null,
    isLoading: isLoading,
    signOut,
    isAdmin: data?.profile?.role === 'admin',
    isAuthenticated: !!data?.user,
    fetchProfile: forceProfileRefetch, // Exportáljuk a kényszerített frissítést
  };
};