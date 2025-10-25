import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { showError } from '@/utils/toast';
import { useQuery } from '@tanstack/react-query';
import { MemberRole } from '@/types/organization'; // Import MemberRole

// 🔹 Profile tábla definíció
interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  organization_name: string | null;
  logo_url: string | null;
  is_public: boolean | null;
  username: string; // NEW FIELD: Must be present
  last_username_change: string | null; // NEW FIELD: Timestamp
  username_change_count: number; // NEW FIELD: Change count
}

// 🔹 Szervezeti tagság adatok
interface OrganizationMembership {
    organization_id: string;
    roles: MemberRole[];
    status: 'pending' | 'accepted';
}

// 🔹 Profil lekérdezése profile táblából
const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url, role, organization_name, logo_url, is_public, username, last_username_change, username_change_count') // Include new fields
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

// 🔹 Szervezeti tagság lekérdezése
const fetchMembership = async (userId: string): Promise<OrganizationMembership | null> => {
    try {
        // Csak az elfogadott tagságot keressük
        const { data, error } = await supabase
            .from('organization_members')
            .select('organization_id, roles, status')
            .eq('user_id', userId)
            .eq('status', 'accepted')
            .single();
            
        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching membership:', error);
            return null;
        }
        
        return data as OrganizationMembership;
    } catch (e) {
        console.error('Unexpected error during membership fetch:', e);
        return null;
    }
};


// 🔹 Session és Profil adatok lekérdezése
interface AuthData {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    membership: OrganizationMembership | null; // NEW
}

const fetchAuthData = async (): Promise<AuthData> => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
        console.error('Supabase getSession error:', sessionError);
        return { session: null, user: null, profile: null, membership: null };
    }
    
    const user = session?.user || null;
    let profile: Profile | null = null;
    let membership: OrganizationMembership | null = null;
    
    if (user) {
        profile = await fetchProfile(user.id);
        
        // Ha a felhasználó nem fő admin, lekérdezzük a tagságát is
        if (profile?.role !== 'admin') {
            membership = await fetchMembership(user.id);
        }
    }
    
    return { session, user, profile, membership };
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
        refetch();
    }
  };
  
  // 🔹 Profil frissítésének kényszerítése (pl. beállítások mentése után)
  const forceProfileRefetch = useCallback(async (userId: string) => {
      refetch();
  }, [refetch]);
  
  // 🔹 Jogosultság ellenőrzése
  const checkPermission = useCallback((requiredRole: MemberRole): boolean => {
    // 1. Fő admin mindig mindent megtehet
    if (data?.profile?.role === 'admin') {
        return true;
    }
    
    // 2. Delegált tag ellenőrzése
    const roles = data?.membership?.roles;
    if (roles && roles.includes(requiredRole)) {
        return true;
    }
    
    return false;
  }, [data?.profile?.role, data?.membership?.roles]);


  // 🔹 Visszatérő értékek
  return {
    session: data?.session || null,
    user: data?.user || null,
    profile: data?.profile || null,
    membership: data?.membership || null, // NEW
    isLoading: isLoading,
    signOut,
    isAdmin: data?.profile?.role === 'admin',
    isAuthenticated: !!data?.user,
    fetchProfile: forceProfileRefetch,
    checkPermission, // NEW
  };
};