import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { showError, showSuccess } from '@/utils/toast';
import { useQuery } from '@tanstack/react-query';
import { MemberRole } from '@/types/organization'; // Import MemberRole

// 🔹 Profile tábla definíció (SZEMÉLYES ADATOK)
export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin' | 'superadmin'; // ADDED superadmin
  // organization_name, logo_url, is_public removed from here
  username: string; // NEW FIELD: Must be present
  last_username_change: string | null; // NEW FIELD: Timestamp
  username_change_count: number; // NEW FIELD: Change count
}

// 🔹 Szervezeti adatok (ÚJ TÁBLA)
export interface OrganizationProfileData {
    id: string; // organizations.id (Unique Organization ID)
    organization_name: string;
    logo_url: string | null;
    is_public: boolean;
    owner_id: string | null; // The user ID of the owner
}

// 🔹 Szervezeti tagság adatok
export interface OrganizationMembership {
    id: string; // organization_members ID
    organization_id: string; // organizations ID
    roles: MemberRole[];
    status: 'pending' | 'accepted';
    
    // Joined organization profile data
    organization_profile: OrganizationProfileData | null;
}

// 🔹 Profil lekérdezése profile táblából
const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url, role, username, last_username_change, username_change_count') // Removed organization fields
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

// 🔹 Összes elfogadott szervezeti tagság lekérdezése
const fetchAllAcceptedMemberships = async (userId: string): Promise<OrganizationMembership[]> => {
    try {
        // Fetch memberships and join the new 'organizations' table
        const { data, error } = await supabase
            .from('organization_members')
            .select(`
                id, organization_id, roles, status,
                organization_profile:organization_id (id, organization_name, logo_url, is_public, owner_id)
            `)
            .eq('user_id', userId)
            .eq('status', 'accepted');
            
        if (error) {
            console.error('Error fetching all accepted memberships:', error);
            return [];
        }
        
        // Filter out memberships where the organization profile join failed
        return (data as OrganizationMembership[]).filter(m => m.organization_profile !== null);
    } catch (e) {
        console.error('Unexpected error during membership fetch:', e);
        return [];
    }
};


// 🔹 Session és Profil adatok lekérdezése
interface AuthData {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    allMemberships: OrganizationMembership[]; // NEW: All accepted memberships
}

const fetchAuthData = async (): Promise<AuthData> => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
        console.error('Supabase getSession error:', sessionError);
        return { session: null, user: null, profile: null, allMemberships: [] };
    }
    
    const user = session?.user || null;
    let profile: Profile | null = null;
    let allMemberships: OrganizationMembership[] = [];
    
    if (user) {
        profile = await fetchProfile(user.id);
        allMemberships = await fetchAllAcceptedMemberships(user.id);
    }
    
    return { session, user, profile, allMemberships };
};


export const useAuth = () => {
  // React Query használata a kezdeti betöltéshez és újrapróbálkozáshoz
  const { data, isLoading, refetch } = useQuery<AuthData>({
    queryKey: ['authSession'],
    queryFn: fetchAuthData,
    staleTime: Infinity, 
    retry: 3, 
    retryDelay: 1000,
  });
  
  // NEW STATE: Aktív tagság ID-je (organizations.id)
  const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(null);
  
  // 🔹 Aktív tagság meghatározása
  const activeMembership = useMemo(() => {
      return data?.allMemberships.find(m => m.organization_id === activeOrganizationId) || null;
  }, [data?.allMemberships, activeOrganizationId]);
  
  // 🔹 Aktív szervezet profiljának meghatározása (az organizations táblából)
  const activeOrganizationProfile = useMemo(() => {
      if (!activeOrganizationId) return null;
      
      const membership = data?.allMemberships.find(m => m.organization_id === activeOrganizationId);
      
      if (membership && membership.organization_profile) {
          return membership.organization_profile;
      }
      
      return null;
  }, [activeOrganizationId, data?.allMemberships]);
  
  // 🔹 Kezdeti aktív szervezet beállítása (első tagság)
  useEffect(() => {
    if (data && !activeOrganizationId && data.allMemberships.length > 0) {
        // Az első elfogadott tagságot állítjuk be aktívnak.
        setActiveOrganizationId(data.allMemberships[0].organization_id);
    }
    // Ha a felhasználó kijelentkezik, vagy a tagságok eltűnnek, töröljük az aktív ID-t
    if (data && data.allMemberships.length === 0 && activeOrganizationId) {
        setActiveOrganizationId(null);
    }
  }, [data, activeOrganizationId]);
  
  // 🔹 Realtime Auth események figyelése
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
      showError('Hiba történt a kijelentkezés során, de a helyi munkamenet törölve lett.');
      console.error('Sign out error:', error);
    }
    
    refetch();
    setActiveOrganizationId(null);
  };
  
  // 🔹 Profil frissítésének kényszerítése (pl. beállítások mentése után)
  const forceProfileRefetch = useCallback(async (userId: string) => {
      // Refetch the main query to update profile and memberships
      await refetch();
  }, [refetch]);
  
  // 🔹 Jogosultság ellenőrzése
  const checkPermission = useCallback((requiredRole: MemberRole): boolean => {
    // 0. Superadmin mindig mindent megtehet
    if (data?.profile?.role === 'superadmin') {
        return true;
    }
    
    // 1. Ellenőrizzük, hogy van-e aktív tagság
    if (!activeMembership) {
        return false;
    }
    
    // 2. Ellenőrizzük, hogy a felhasználó a tulajdonos-e (a tulajdonos minden jogosultsággal rendelkezik)
    if (activeOrganizationProfile?.owner_id === data?.user?.id) {
        return true;
    }
    
    // 3. Delegált tag ellenőrzése
    const roles = activeMembership?.roles;
    if (roles && roles.includes(requiredRole)) {
        return true;
    }
    
    return false;
  }, [data?.profile?.role, activeMembership, activeOrganizationProfile?.owner_id, data?.user?.id]);
  
  // 🔹 Aktív szervezet váltása
  const switchActiveOrganization = useCallback((organizationId: string) => {
      const membership = data?.allMemberships.find(m => m.organization_id === organizationId);
      
      if (membership) {
          setActiveOrganizationId(organizationId);
          
          const orgName = membership.organization_profile?.organization_name || 'Ismeretlen szervezet';
          showSuccess(`Aktív szervezet váltva: ${orgName}`);
      } else {
          // Ha a felhasználó null-t választ (pl. a placeholder), akkor töröljük az aktív ID-t
          setActiveOrganizationId(null);
          if (organizationId !== null) {
              showError('Érvénytelen szervezet azonosító.');
          }
      }
  }, [data?.allMemberships]);


  // 🔹 Visszatérő értékek
  return {
    session: data?.session || null,
    user: data?.user || null,
    profile: data?.profile || null, // User's personal profile
    allMemberships: data?.allMemberships || [], // All accepted memberships
    
    // Active Organization Context (used by admin pages)
    activeOrganizationId,
    activeOrganizationProfile,
    activeMembership,
    
    isLoading: isLoading,
    signOut,
    // isAdmin: true, ha van legalább egy elfogadott tagsága
    isAdmin: (data?.profile?.role === 'admin' || data?.profile?.role === 'superadmin' || (data?.allMemberships && data.allMemberships.length > 0)), 
    isSuperadmin: data?.profile?.role === 'superadmin',
    isAuthenticated: !!data?.user,
    fetchProfile: forceProfileRefetch,
    checkPermission,
    switchActiveOrganization, // NEW
  };
};