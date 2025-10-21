import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Coupon } from '@/types/coupons';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from './use-auth';
import { generateRedemptionCode } from '@/utils/code-generator';

// Define a type for coupon usage records
interface CouponUsage {
  id: string;
  coupon_id: string;
  is_used: boolean;
}

export const usePublicCoupons = () => {
  const { user, isAuthenticated } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [usages, setUsages] = useState<CouponUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCouponsAndUsages = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch all coupons (RLS policy allows public read)
      const { data: couponData, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (couponError) {
        showError('Hiba történt a kuponok betöltésekor.');
        console.error('Fetch public coupons error:', couponError);
        setCoupons([]);
        return;
      }
      setCoupons(couponData as Coupon[]);

      // 2. Fetch current user's finalized usages if authenticated
      if (isAuthenticated && user) {
        const { data: usageData, error: usageError } = await supabase
          .from('coupon_usages')
          .select('id, coupon_id, is_used')
          .eq('user_id', user.id)
          .eq('is_used', true); // Only count finalized usages

        if (usageError) {
          console.error('Fetch user usages error:', usageError);
          // Continue even if usage fetch fails, but log error
        } else {
          setUsages(usageData as CouponUsage[]);
        }
      } else {
        setUsages([]);
      }

    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCouponsAndUsages();
  }, [isAuthenticated, user?.id]); // Re-fetch when auth state changes

  // Helper function to check if a coupon is fully used by the current user
  const isCouponUsedUp = (couponId: string, maxUses: number): boolean => {
    if (maxUses === 0) return false; // Unlimited uses
    
    const count = usages.filter(u => u.coupon_id === couponId && u.is_used).length;
    return count >= maxUses;
  };

  // Function to manually refresh usages (called after successful redemption)
  const refreshUsages = async () => {
    if (isAuthenticated && user) {
      const { data: usageData, error: usageError } = await supabase
        .from('coupon_usages')
        .select('id, coupon_id, is_used')
        .eq('user_id', user.id)
        .eq('is_used', true);

      if (!usageError) {
        setUsages(usageData as CouponUsage[]);
      }
    }
  };

  const redeemCoupon = async (coupon: Coupon): Promise<{ success: boolean, usageId?: string, redemptionCode?: string }> => {
    if (!isAuthenticated || !user) {
      showError('Kérjük, jelentkezz be a kupon beváltásához.');
      return { success: false };
    }

    // 1. Check max uses per user limit using the local 'usages' state
    if (isCouponUsedUp(coupon.id, coupon.max_uses_per_user)) {
      showError(`Ezt a kupont már beváltottad ${coupon.max_uses_per_user} alkalommal.`);
      return { success: false };
    }
    
    // 2. Generate unique redemption code
    let redemptionCode: string;
    let codeIsUnique = false;
    let attempts = 0;
    
    // Ensure the generated code is unique (simple retry loop)
    do {
      redemptionCode = generateRedemptionCode();
      const { count } = await supabase
        .from('coupon_usages')
        .select('id', { count: 'exact', head: true })
        .eq('redemption_code', redemptionCode);
      
      if (count === 0) {
        codeIsUnique = true;
      }
      attempts++;
    } while (!codeIsUnique && attempts < 5);

    if (!codeIsUnique) {
      showError('Nem sikerült egyedi beváltási kódot generálni. Próbáld újra.');
      return { success: false };
    }

    // 3. Record usage intent (is_used = false initially)
    try {
      const { data, error } = await supabase
        .from('coupon_usages')
        .insert({ 
          user_id: user.id, 
          coupon_id: coupon.id,
          redemption_code: redemptionCode,
          is_used: false, // Mark as pending validation
        })
        .select('id, redemption_code')
        .single();

      if (error) {
        showError('Hiba történt a beváltás rögzítésekor.');
        console.error('Insert usage error:', error);
        return { success: false };
      }

      // Success: return the unique usage ID and the short code
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
    refreshUsages, // Export refresh function
  };
};