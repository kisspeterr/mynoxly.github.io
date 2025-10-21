import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { useAuth } from './use-auth';

interface BaseCouponUsageRecord {
  id: string;
  user_id: string;
  coupon_id: string;
  redeemed_at: string | null;
  is_used: boolean;
  redemption_code: string;
  
  coupon: {
    title: string;
    organization_name: string;
  } | null;
}

// New type guaranteeing valid redeemed_at
export interface ValidCouponUsageRecord extends Omit<BaseCouponUsageRecord, 'redeemed_at'> {
  redeemed_at: string;
}

export const useCouponUsages = () => {
  const { profile, isAuthenticated, isAdmin } = useAuth();
  const [usages, setUsages] = useState<ValidCouponUsageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const organizationName = profile?.organization_name;

  const fetchUsages = async () => {
    if (!isAuthenticated || !isAdmin || !organizationName) {
      setUsages([]);
      return;
    }

    setIsLoading(true);
    try {
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
      // 3. CRITICAL: Ensure redeemed_at is a valid date string
      const filteredData = (data as BaseCouponUsageRecord[]).filter(
        (usage): usage is ValidCouponUsageRecord => 
          usage.coupon !== null && 
          usage.coupon.organization_name === organizationName &&
          typeof usage.redeemed_at === 'string' &&
          !isNaN(new Date(usage.redeemed_at).getTime())
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