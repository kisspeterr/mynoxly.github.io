import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Coupon } from '@/types/coupons';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from './use-auth';

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

  const redeemCoupon = async (coupon: Coupon): Promise<{ success: boolean, usageId?: string }> => {
    if (!isAuthenticated || !user) {
      showError('Kérjük, jelentkezz be a kupon beváltásához.');
      return { success: false };
    }

    // 1. Check max uses per user limit
    if (coupon.max_uses_per_user > 0) {
      const { count, error: countError } = await supabase
        .from('coupon_usages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('coupon_id', coupon.id);

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
    
    // 2. Record usage (This is the critical step for the time-limited display)
    try {
      const { data, error } = await supabase
        .from('coupon_usages')
        .insert({ user_id: user.id, coupon_id: coupon.id })
        .select('id')
        .single();

      if (error) {
        showError('Hiba történt a beváltás rögzítésekor.');
        console.error('Insert usage error:', error);
        return { success: false };
      }

      // Success: return the unique usage ID for the time-limited display
      return { success: true, usageId: data.id };

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