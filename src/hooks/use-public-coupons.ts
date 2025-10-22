import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from './use-auth';
import { generateRedemptionCode } from '@/utils/code-generator';
import { Coupon } from '@/types/coupons';

// Define a type for coupon usage records
interface CouponUsage {
  id: string;
  coupon_id: string;
  is_used: boolean;
}

// Extend Coupon type to include organization profile data
interface PublicCoupon extends Coupon {
  logo_url: string | null; // Simplified: logo_url directly on coupon object
}

export const usePublicCoupons = () => {
  const { user, isAuthenticated } = useAuth();
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [allUsages, setAllUsages] = useState<CouponUsage[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  // Helper to fetch organization logos
  const fetchOrganizationLogos = async (organizationNames: string[]) => {
    if (organizationNames.length === 0) return {};
    
    const { data, error } = await supabase
      .from('profiles')
      .select('organization_name, logo_url')
      .in('organization_name', organizationNames);

    if (error) {
      console.error('Error fetching organization logos:', error);
      return {};
    }

    return data.reduce((acc, profile) => {
      if (profile.organization_name) {
        acc[profile.organization_name] = profile.logo_url;
      }
      return acc;
    }, {} as Record<string, string | null>);
  };

  // Fetches all coupons and the current user's finalized usages
  const fetchCouponsAndUsages = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch all coupons (without join)
      const { data: couponData, error: couponError } = await supabase
        .from('coupons')
        .select(`*`)
        .order('created_at', { ascending: false });

      if (couponError) {
        showError('Hiba történt a kuponok betöltésekor.');
        console.error('Fetch public coupons error:', couponError);
        setCoupons([]);
        return;
      }
      
      const rawCoupons = couponData as Coupon[];
      const organizationNames = Array.from(new Set(rawCoupons.map(c => c.organization_name)));
      
      // 2. Fetch organization logos separately
      const logoMap = await fetchOrganizationLogos(organizationNames);
      
      const couponsWithLogos: PublicCoupon[] = rawCoupons.map(coupon => ({
        ...coupon,
        logo_url: logoMap[coupon.organization_name] || null,
      }));
      
      setCoupons(couponsWithLogos);

      // 3. Fetch current user's ALL usages if authenticated
      if (isAuthenticated && user) {
        const { data: usageData, error: usageError } = await supabase
          .from('coupon_usages')
          .select('id, coupon_id, is_used')
          .eq('user_id', user.id);

        if (usageError) {
          console.error('Fetch user usages error:', usageError);
        } else {
          setAllUsages(usageData as CouponUsage[]);
        }
      } else {
        setAllUsages([]);
      }

    } finally {
      setIsLoading(false);
    }
  };

  // Function to manually refresh usages (called after successful redemption or modal close)
  const refreshUsages = async () => {
    if (isAuthenticated && user) {
      const { data: usageData, error: usageError } = await supabase
        .from('coupon_usages')
        .select('id, coupon_id, is_used')
        .eq('user_id', user.id);

      if (!usageError) {
        setAllUsages(usageData as CouponUsage[]);
      }
    }
  };

  useEffect(() => {
    fetchCouponsAndUsages();
    
    // Setup Realtime subscription for user's own coupon usages
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    if (isAuthenticated && user) {
      channel = supabase
        .channel(`user_usages_${user.id}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'coupon_usages',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            refreshUsages();
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [isAuthenticated, user?.id]);

  const isCouponUsedUp = (couponId: string, maxUses: number): boolean => {
    if (maxUses === 0) return false;
    
    const count = allUsages.filter(u => u.coupon_id === couponId && u.is_used).length;
    return count >= maxUses;
  };
  
  const isCouponPending = (couponId: string): boolean => {
    return allUsages.some(u => u.coupon_id === couponId && u.is_used === false);
  };
  
  const deletePendingUsage = async (usageId: string) => {
    if (!isAuthenticated || !user) return { success: false };
    
    try {
      const { error } = await supabase
        .from('coupon_usages')
        .delete()
        .eq('id', usageId)
        .eq('is_used', false);

      if (error) {
        console.error('Error deleting pending usage:', error);
        return { success: false };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Unexpected error during pending usage deletion:', error);
      return { success: false };
    }
  };


  const redeemCoupon = async (coupon: Coupon): Promise<{ success: boolean, usageId?: string, redemptionCode?: string }> => {
    if (!isAuthenticated || !user) {
      showError('Kérjük, jelentkezz be a kupon beváltásához.');
      return { success: false };
    }
    
    if (isCouponPending(coupon.id)) {
        showError('Már generáltál egy beváltási kódot ehhez a kuponhoz. Kérjük, használd azt.');
        return { success: false };
    }

    const { count, error: countError } = await supabase
      .from('coupon_usages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('coupon_id', coupon.id)
      .eq('is_used', true);

    if (countError) {
      showError('Hiba történt a beváltási korlát ellenőrzésekor.');
      console.error('Real-time usage check error:', countError);
      return { success: false };
    }

    if (coupon.max_uses_per_user !== 0 && count !== null && count >= coupon.max_uses_per_user) {
      showError(`Ezt a kupont már beváltottad ${coupon.max_uses_per_user} alkalommal.`);
      return { success: false };
    }
    
    let redemptionCode: string;
    let codeIsUnique = false;
    let attempts = 0;
    
    do {
      redemptionCode = generateRedemptionCode();
      const { count: codeCount } = await supabase
        .from('coupon_usages')
        .select('id', { count: 'exact', head: true })
        .eq('redemption_code', redemptionCode);
      
      if (codeCount === 0) {
        codeIsUnique = true;
      }
      attempts++;
    } while (!codeIsUnique && attempts < 5);

    if (!codeIsUnique) {
      showError('Nem sikerült egyedi beváltási kódot generálni. Próbáld újra.');
      return { success: false };
    }

    try {
      const { data, error } = await supabase
        .from('coupon_usages')
        .insert({ 
          user_id: user.id, 
          coupon_id: coupon.id,
          redemption_code: redemptionCode,
          is_used: false,
        })
        .select('id, redemption_code')
        .single();

      if (error) {
        showError('Hiba történt a beváltás rögzítésekor.');
        console.error('Insert usage error:', error);
        return { success: false };
      }
      
      return { success: true, usageId: data.id, redemptionCode: data.redemption_code };

    } catch (error) {
      console.error('Redeem error:', error);
      showError('Váratlan hiba történt a beváltás során.');
      return { success: false };
    }
  };

  return {
    coupons,
    isLoading,
    redeemCoupon,
    isCouponUsedUp,
    isCouponPending,
    refreshUsages,
    deletePendingUsage,
  };
};