import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { useAuth } from './use-auth';

interface CouponUsageRecord {
  id: string;
  user_id: string;
  redeemed_at: string | null; // Allow null for safety
  is_used: boolean;
  redemption_code: string;
  
  // Joined data
  coupon: {
    title: string;
    organization_name: string;
  } | null;
  
  // NEW: Joined Profile data
  profile: {
    username: string;
  } | null;
}

// Helper to fetch user profiles (username, email, first_name, last_name) securely via RPC
const fetchUserProfilesByIds = async (userIds: string[]): Promise<Record<string, { username: string, first_name: string | null, last_name: string | null }>> => {
    if (userIds.length === 0) return {};
    
    const { data: usersData, error } = await supabase.rpc('get_user_profiles_by_ids', { user_ids: userIds });
    
    if (error) {
        console.error('Error fetching user profiles via RPC:', error);
        return {};
    }
    
    return (usersData || []).reduce((acc, user) => {
        acc[user.id] = {
            username: user.username,
            first_name: user.first_name || null,
            last_name: user.last_name || null,
        };
        return acc;
    }, {} as Record<string, { username: string, first_name: string | null, last_name: string | null }>);
};


export const useCouponUsages = () => {
  const { activeOrganizationProfile, isAuthenticated, checkPermission } = useAuth();
  const [usages, setUsages] = useState<CouponUsageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const organizationName = activeOrganizationProfile?.organization_name;

  const fetchUsages = async () => {
    if (!isAuthenticated || !organizationName) {
      setUsages([]);
      setIsLoading(false);
      return;
    }
    
    // Check if the user has any permission to view usages
    if (!checkPermission('viewer') && !checkPermission('redemption_agent') && !checkPermission('coupon_manager') && !checkPermission('event_manager')) {
        setUsages([]);
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    try {
      // 1. Fetch usages without joining the user profile (to avoid RLS conflict)
      const { data, error } = await supabase
        .from('coupon_usages')
        .select(`
          id,
          user_id,
          redeemed_at,
          is_used,
          redemption_code,
          coupon:coupon_id (title, organization_name)
        `)
        .order('redeemed_at', { ascending: false });

      if (error) {
        showError('Hiba történt a beváltások betöltésekor. Ellenőrizd a szervezet nevét a profilban.');
        console.error('Fetch usages error:', error);
        return;
      }
      
      if (!data) {
        setUsages([]);
        return;
      }

      // Client-side filtering based on the joined organization name
      const rawUsages = (data as Omit<CouponUsageRecord, 'profile'>[]).filter(
        (usage) => 
          usage.coupon && 
          usage.coupon.organization_name === organizationName && // <-- EXPLICIT FILTER
          typeof usage.redeemed_at === 'string'
      );
      
      // 2. Collect unique user IDs
      const userIds = Array.from(new Set(rawUsages.map(u => u.user_id)));
      
      // 3. Fetch usernames securely using RPC
      let usernameMap: Record<string, string> = {};
      if (userIds.length > 0) {
          const { data: usersData } = await supabase.rpc('get_user_profiles_by_ids', { user_ids: userIds });
          usernameMap = (usersData || []).reduce((acc, user) => {
              acc[user.id] = user.username;
              return acc;
          }, {} as Record<string, string>);
      }
      
      // 4. Combine data
      const processedUsages: CouponUsageRecord[] = rawUsages.map(usage => ({
          ...usage,
          profile: usernameMap[usage.user_id] ? { username: usernameMap[usage.user_id] } : null,
      }));
      
      setUsages(processedUsages);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (organizationName) {
      fetchUsages();
    } else if (!isLoading && isAuthenticated) {
        setUsages([]);
        setIsLoading(false);
    }
    
    // Setup Realtime subscription for new/updated usages
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    if (organizationName) {
        channel = supabase
          .channel('coupon_usages_admin_feed')
          .on(
            'postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'coupon_usages',
            },
            (payload) => {
              // Refetch all data to ensure consistency and correct filtering/sorting
              fetchUsages();
            }
          )
          .subscribe();
    }


    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [organizationName, isAuthenticated]);

  return {
    usages,
    isLoading,
    fetchUsages,
    organizationName,
  };
};