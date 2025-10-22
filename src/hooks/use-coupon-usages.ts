import { useState, useEffect, useCallback } from 'react';
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
  const { profile, isAuthenticated, isAdmin } = useAuth();
  const [usages, setUsages] = useState<CouponUsageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const organizationName = profile?.organization_name;

  const fetchUsages = useCallback(async () => {
    if (!isAuthenticated || !isAdmin || !organizationName) {
      setUsages([]);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Fetch all coupon IDs belonging to the current organization
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

      // 2. Fetch usages filtered by these coupon IDs
      // RLS should already handle this, but we add client-side filtering for robustness.
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
        .in('coupon_id', couponIds) // CRITICAL: Filter by organization's coupon IDs
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

      // 3. Final processing (ensuring redeemed_at is present for countdown)
      const filteredData = (data as CouponUsageRecord[]).filter(
        (usage) => 
          usage.coupon && 
          typeof usage.redeemed_at === 'string'
      );
      
      setUsages(filteredData);
    } finally {
      setIsLoading(false);
    }
  }, [organizationName, isAuthenticated, isAdmin]);

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
  }, [organizationName, isAuthenticated, isAdmin, fetchUsages]);

  return {
    usages,
    isLoading,
    fetchUsages,
    organizationName,
  };
};