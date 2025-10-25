import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { useAuth } from './use-auth';

interface CouponUsageRecord {
  id: string;
  user_id: string;
  coupon_id: string;
  redeemed_at: string | null; // Allow null for safety
  is_used: boolean;
  redemption_code: string;
  
  // Joined data - made optional to handle potential null joins
  coupon: {
    title: string;
    organization_name: string;
  } | null;
}

export const useCouponUsages = () => {
  const { user, profile, isAuthenticated, isAdmin } = useAuth();
  const [usages, setUsages] = useState<CouponUsageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const organizationName = profile?.organization_name;

  const fetchUsages = async () => {
    if (!isAuthenticated || !isAdmin || !organizationName) {
      setUsages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch all usages. RLS policy ensures only usages related to the admin's organization's coupons are returned.
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

      // CRITICAL: Ensure redeemed_at is present and is a string (not null) for UsageCountdown
      // We rely on RLS for filtering, but ensure data integrity for the component.
      const filteredData = (data as CouponUsageRecord[]).filter(
        (usage) => 
          usage.coupon && 
          typeof usage.redeemed_at === 'string'
      );
      
      setUsages(filteredData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (organizationName) {
      fetchUsages();
    } else if (!isLoading && isAuthenticated && isAdmin) {
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
  }, [organizationName, isAuthenticated, isAdmin]);

  return {
    usages,
    isLoading,
    fetchUsages,
    organizationName,
  };
};