import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { showError, showSuccess } from '@/utils/toast';
import { useQuery } from '@tanstack/react-query';
import { MemberRole } from '@/types/organization'; // Import MemberRole

// 🔹 Profile tábla definíció
export interface Profile {
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
export interface OrganizationMembership {
    id: string; // organization_members ID
    organization_id: string; // profiles ID
    roles: MemberRole[];
    status: 'pending' | 'accepted';
    
    // Joined organization profile data
    organization_profile: {
        organization_name: string;
        logo_url: string | null;
    } | null;
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

// 🔹 Összes elfogadott szervezeti tagság lekérdezése
const fetchAllAcceptedMemberships = async (userId: string): Promise<OrganizationMembership[]> => {
    try {
        const { data, error } = await supabase
            .from('organization_members')
            .select(`
                id, organization_id, roles, status,
                organization_profile:organization_id (organization_name, logo_url)
            `)
            .eq('user_id', userId)
            .eq('status', 'accepted');
            
        if (error) {
            console.error('Error fetching all accepted memberships:', error);
            return [];
        }
        
        return data as OrganizationMembership[];
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
  
  // NEW STATE: Aktív tagság ID-je (profiles.id)
  const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(null);
  
  // 🔹 Aktív tagság meghatározása
  const activeMembership = data?.allMemberships.find(m => m.organization_id === activeOrganizationId) || null;
  
  // 🔹 Aktív szervezet profiljának meghatározása (a profiles táblából)
  const activeOrganizationProfile = activeMembership?.organization_profile || null;
  
  // 🔹 Kezdeti aktív szervezet beállítása (első tagság vagy a fő admin profilja)
  useEffect(() => {
    if (data && !activeOrganizationId) {
        // 1. Próbáljuk meg beállítani a fő admin profilját, ha az létezik és van szervezet neve
        const mainAdminProfile = data.profile?.role === 'admin' && data.profile.organization_name 
            ? data.profile 
            : null;
            
        if (mainAdminProfile) {
            setActiveOrganizationId(mainAdminProfile.id);
        } else if (data.allMemberships.length > 0) {
            // 2. Különben az első elfogadott tagságot állítjuk be aktívnak.
            setActiveOrganizationId(data.allMemberships[0].organization_id);
        }
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
      showError('Hiba történt a kijelentkezés során.');
      console.error('Sign out error:', error);
    } else {
        refetch();
        setActiveOrganizationId(null);
    }
  };
  
  // 🔹 Profil frissítésének kényszerítése (pl. beállítások mentése után)
  const forceProfileRefetch = useCallback(async (userId: string) => {
      refetch();
  }, [refetch]);
  
  // 🔹 Jogosultság ellenőrzése
  const checkPermission = useCallback((requiredRole: MemberRole): boolean => {
    // 1. Fő admin (régi rendszer) - ha a saját profilja aktív, mindent megtehet
    if (data?.profile?.role === 'admin' && data?.profile?.id === activeOrganizationId) {
        return true;
    }
    
    // 2. Delegált tag ellenőrzése
    const roles = activeMembership?.roles;
    if (roles && roles.includes(requiredRole)) {
        return true;
    }
    
    return false;
  }, [data?.profile?.role, data?.profile?.id, activeOrganizationId, activeMembership?.roles]);
  
  // 🔹 Aktív szervezet váltása
  const switchActiveOrganization = useCallback((organizationId: string) => {
      // Check if the organizationId is either the user's own profile ID (if they are admin) 
      // OR if it matches one of their accepted memberships.
      const isOwnAdminProfile = data?.profile?.role === 'admin' && data?.profile?.id === organizationId;
      const isAcceptedMember = data?.allMemberships.some(m => m.organization_id === organizationId);
      
      if (isOwnAdminProfile || isAcceptedMember) {
          setActiveOrganizationId(organizationId);
          
          const orgName = isOwnAdminProfile 
              ? data.profile.organization_name 
              : data?.allMemberships.find(m => m.organization_id === organizationId)?.organization_profile?.organization_name;
              
          showSuccess(`Aktív szervezet váltva: ${orgName || 'Ismeretlen szervezet'}`);
      } else {
          showError('Érvénytelen szervezet azonosító.');
      }
  }, [data?.allMemberships, data?.profile]);


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
    isAdmin: data?.profile?.role === 'admin', // Legacy check for owner status
    isAuthenticated: !!data?.user,
    fetchProfile: forceProfileRefetch,
    checkPermission,
    switchActiveOrganization, // NEW
  };
};