import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { useAuth } from './use-auth';

interface CouponUsageRecord {
  id: string;
  user_id: string;
  coupon_id: string;
  redeemed_at: string; // Added redeemed_at
  is_used: boolean;
  redemption_code: string; // Added redemption_code
  
  // Joined data
  coupon: {
    title: string;
    organization_name: string;
  };
  profile: {
    first_name: string | null;
    last_name: string | null;
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

      // Filter data client-side to ensure only records linked to the admin's organization are shown, 
      // although RLS on 'coupons' should handle most of this.
      const filteredData = (data as CouponUsageRecord[]).filter(
        (usage) => usage.coupon?.organization_name === organizationName
      );
      
      // Fetch user profiles for display (this is complex client-side due to RLS on auth.users/profiles)
      // For simplicity, we will display User ID or rely on the profile data if accessible.
      
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
          // This is safer than trying to merge individual payloads client-side with complex joins
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