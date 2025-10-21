import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Coupon } from '@/types/coupons';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from './use-auth';
import { generateRedemptionCode } from '@/utils/code-generator';

export const usePublicCoupons = () => {
  const { user, isAuthenticated } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      setIsLoading(true);
      try {
        // Fetch all coupons (RLS policy allows public read)
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          showError('Hiba történt a kuponok betöltésekor.');
          console.error('Fetch public coupons error:', error);
          setCoupons([]);
          return;
        }

        setCoupons(data as Coupon[]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const redeemCoupon = async (coupon: Coupon): Promise<{ success: boolean, usageId?: string, redemptionCode?: string }> => {
    if (!isAuthenticated || !user) {
      showError('Kérjük, jelentkezz be a kupon beváltásához.');
      return { success: false };
    }

    // 1. Check max uses per user limit (only count finalized usages if needed, but for now, count all records)
    if (coupon.max_uses_per_user > 0) {
      const { count, error: countError } = await supabase
        .from('coupon_usages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('coupon_id', coupon.id)
        .eq('is_used', true); // Only count finalized usages against the limit

      if (countError) {
        showError('Hiba a felhasználói korlát ellenőrzésekor.');
        console.error('Usage count error:', countError);
        return { success: false };
      }

      if (count !== null && count >= coupon.max_uses_per_user) {
        showError(`Ezt a kupont már beváltottad ${coupon.max_uses_per_user} alkalommal.`);
        return { success: false };
      }
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
  };
};