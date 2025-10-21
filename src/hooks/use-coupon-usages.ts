import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { useAuth } from './use-auth';

interface CouponUsageRecord {
  id: string;
  user_id: string;
  coupon_id: string;
  redeemed_at: string;
  is_used: boolean;
  redemption_code: string;
  
  // Joined data - made optional to handle potential null joins
  coupon: {
    title: string;
    organization_name: string;
  } | null;
}

export const useCouponUsages = () => {
  const { profile, isAuthenticated, isAdmin } = useAuth();
  const [usages, setUsages] = useState<CouponUsageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const organizationName = profile?.organization_name;

  const fetchUsages = async () => {
    if (!isAuthenticated || !isAdmin || !organizationName) {
      setUsages([]);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch all usages for coupons belonging to this organization
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
        showError('Hiba történt a beváltások betöltésekor.');
        console.error('Fetch usages error:', error);
        return;
      }
      
      if (!data) {
        setUsages([]);
        return;
      }

      // Filter data client-side:
      // 1. Ensure coupon data exists (join successful)
      // 2. Ensure coupon belongs to the current organization
      // 3. Ensure redeemed_at exists (critical for UsageCountdown)
      const filteredData = (data as CouponUsageRecord[]).filter(
        (usage) => 
          usage.coupon && 
          usage.coupon.organization_name === organizationName &&
          usage.redeemed_at // Check if redeemed_at is present
      );
      
      setUsages(filteredData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (organizationName) {
      fetchUsages();
    }
    
    // Setup Realtime subscription for new/updated usages
    const channel = supabase
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
          if (organizationName) {
             fetchUsages();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationName, isAuthenticated, isAdmin]);

  return {
    usages,
    isLoading,
    fetchUsages,
    organizationName,
  };
};