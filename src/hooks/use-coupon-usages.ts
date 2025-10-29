import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CouponUsage, CouponUsageWithDetails } from '@/types/coupons';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from './use-auth';
import { useCoupons } from './use-coupons'; // Dependency to get coupon IDs

export const useCouponUsages = () => {
  const { activeOrganizationProfile, isAuthenticated, checkPermission } = useAuth();
  const { coupons, isLoading: isLoadingCoupons, fetchCoupons } = useCoupons();
  
  const [usages, setUsages] = useState<CouponUsageWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const organizationName = activeOrganizationProfile?.organization_name;
  
  // Determine if the user has ANY permission to view usages
  const hasPermission = checkPermission('viewer') || checkPermission('redemption_agent') || checkPermission('coupon_manager');

  // Get IDs of coupons belonging to the active organization
  const organizationCouponIds = coupons.map(c => c.id);

  const fetchUsages = useCallback(async () => {
    if (!isAuthenticated || !organizationName || !hasPermission || organizationCouponIds.length === 0) {
      setUsages([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Fetch usages that belong to the organization's coupons
      const { data, error } = await supabase
        .from('coupon_usages')
        .select(`
          *,
          coupons (title, organization_name),
          profiles (username, first_name, last_name)
        `)
        .in('coupon_id', organizationCouponIds) // Filter by organization's coupon IDs
        .order('redeemed_at', { ascending: false });

      if (error) {
        showError('Hiba történt a beváltások betöltésekor.');
        console.error('Fetch usages error:', error);
        return;
      }

      setUsages(data as CouponUsageWithDetails[]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, organizationName, hasPermission, organizationCouponIds]);

  useEffect(() => {
    // First, ensure coupons are loaded for the current organization
    if (organizationName) {
        fetchCoupons();
    }
  }, [organizationName, fetchCoupons]);
  
  useEffect(() => {
    // Then, fetch usages once coupon IDs are available
    if (organizationName && organizationCouponIds.length > 0) {
      fetchUsages();
    } else if (organizationName && !isLoadingCoupons) {
        // If organization is active but has no coupons, clear usages
        setUsages([]);
    } else if (!organizationName) {
        setUsages([]);
    }
    
    // --- Realtime Subscription ---
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    if (organizationName && hasPermission) {
        // We subscribe to all usage changes, and rely on fetchUsages to filter by coupon_id
        channel = supabase
          .channel(`usages_admin_feed_${organizationName}`)
          .on(
            'postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'coupon_usages',
            },
            (payload) => {
              // Refetch all data on any change to ensure consistency
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
    
  }, [organizationName, hasPermission, organizationCouponIds.length, fetchUsages, isLoadingCoupons]);

  const finalizeRedemption = async (usageId: string) => {
    if (!organizationName || !checkPermission('coupon_manager')) {
      showError('Nincs jogosultságod a beváltás véglegesítéséhez.');
      return { success: false };
    }
    
    setIsRedeeming(true);
    try {
      // Call the stored procedure to finalize redemption
      const { data, error } = await supabase.rpc('finalize_coupon_redemption', { usage_id_in: usageId });

      if (error) {
        showError(`Hiba a beváltás véglegesítésekor: ${error.message}`);
        console.error('Finalize redemption error:', error);
        return { success: false };
      }

      showSuccess('Beváltás sikeresen véglegesítve!');
      // Realtime or refetch will update the list
      fetchUsages(); 
      return { success: true };
    } finally {
      setIsRedeeming(false);
    }
  };

  return {
    usages,
    isLoading: isLoading || isLoadingCoupons,
    isRedeeming,
    fetchUsages,
    finalizeRedemption,
    organizationName,
    hasPermission,
  };
};