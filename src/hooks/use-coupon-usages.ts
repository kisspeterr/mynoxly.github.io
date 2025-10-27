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
  const { activeOrganizationProfile, activeOrganizationId, isAuthenticated, checkPermission } = useAuth();
  const [usages, setUsages] = useState<CouponUsageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const organizationName = activeOrganizationProfile?.organization_name;

  const fetchUsages = async () => {
    if (!isAuthenticated || !organizationName || !activeOrganizationId) {
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
      // 1. Get all coupon IDs belonging to the active organization
      const { data: couponIdsData, error: couponIdError } = await supabase
        .from('coupons')
        .select('id')
        .eq('organization_name', organizationName);
        
      if (couponIdError) {
        showError('Hiba történt a kupon ID-k betöltésekor.');
        console.error('Fetch coupon IDs error:', couponIdError);
        return;
      }
      
      const couponIds = couponIdsData.map(c => c.id);
      
      if (couponIds.length === 0) {
          setUsages([]);
          return;
      }

      // 2. Fetch usage records filtered by the retrieved coupon IDs
      // NOTE: We still need to join the coupon title/org_name for display/filtering, 
      // but the primary filter is now on coupon_id.
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
        .in('coupon_id', couponIds) // <-- EFFICIENT FILTER
        .order('redeemed_at', { ascending: false });

      if (error) {
        showError('Hiba történt a beváltások betöltésekor.');
        console.error('Fetch usages error:', error);
        return;
      }
      
      if (!data) {
        setUsages([]);
        return;
      }

      // We still perform a final check to ensure data integrity, although the coupon_id filter should be sufficient.
      const rawUsages = (data as Omit<CouponUsageRecord, 'profile'>[]).filter(
        (usage) => 
          usage.coupon && 
          usage.coupon.organization_name === organizationName && 
          typeof usage.redeemed_at === 'string'
      );
      
      // 3. Collect unique user IDs and fetch usernames securely
      const userIds = Array.from(new Set(rawUsages.map(u => u.user_id)));
      
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
    if (activeOrganizationId) {
      fetchUsages();
    } else if (!isLoading && isAuthenticated) {
        setUsages([]);
        setIsLoading(false);
    }
    
    // Setup Realtime subscription for new/updated usages
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    if (activeOrganizationId) {
        channel = supabase
          .channel(`coupon_usages_admin_feed_${activeOrganizationId}`)
          .on(
            'postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'coupon_usages',
              // NOTE: We cannot filter by coupon_id here in Realtime, so we rely on the refetch.
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
  }, [activeOrganizationId, isAuthenticated]); // Watch the ID instead of the object

  return {
    usages,
    isLoading,
    fetchUsages,
    organizationName,
  };
};