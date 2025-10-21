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

export const usePublicCoupons = () => {
  const { user, isAuthenticated } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  // Store ALL usages (pending and used) to manage button state
  const [allUsages, setAllUsages] = useState<CouponUsage[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  // Fetches all coupons and the current user's finalized usages
  const fetchCouponsAndUsages = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch all coupons (RLS policy allows public read)
      const { data: couponData, error: couponError } = await supabase
        .from('coupons')
        .select(`
          id,
          organization_name,
          title,
          description,
          image_url,
          expiry_date,
          max_uses_per_user,
          total_max_uses,
          created_at
        `) // Removed coupon_code
        .order('created_at', { ascending: false });

      if (couponError) {
        showError('Hiba történt a kuponok betöltésekor.');
        console.error('Fetch public coupons error:', couponError);
        setCoupons([]);
        return;
      }
      setCoupons(couponData as Coupon[]);

      // 2. Fetch current user's ALL usages if authenticated (pending and finalized)
      if (isAuthenticated && user) {
        const { data: usageData, error: usageError } = await supabase
          .from('coupon_usages')
          .select('id, coupon_id, is_used')
          .eq('user_id', user.id); // RLS ensures only the user's data is returned

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
      // We subscribe to all changes on coupon_usages table, but RLS ensures we only receive updates for the current user's rows.
      channel = supabase
        .channel(`user_usages_${user.id}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'coupon_usages',
            filter: `user_id=eq.${user.id}` // Explicit filter for safety, though RLS should handle it
          },
          (payload) => {
            // When a change happens (INSERT/UPDATE/DELETE), refresh the entire usage list
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
  }, [isAuthenticated, user?.id]); // Re-fetch and re-subscribe when auth state changes

  // Helper function to check if a coupon is fully used by the current user
  // This now checks against finalized usages (is_used: true)
  const isCouponUsedUp = (couponId: string, maxUses: number): boolean => {
    if (maxUses === 0) return false; // Unlimited uses
    
    const count = allUsages.filter(u => u.coupon_id === couponId && u.is_used).length;
    return count >= maxUses;
  };
  
  // NEW Helper function to check if a coupon is currently PENDING redemption
  const isCouponPending = (couponId: string): boolean => {
    // Check if there is any usage record that is NOT yet used (is_used: false)
    return allUsages.some(u => u.coupon_id === couponId && u.is_used === false);
  };
  
  // NEW: Function to delete a pending usage record
  const deletePendingUsage = async (usageId: string) => {
    if (!isAuthenticated || !user) return { success: false };
    
    try {
      // Delete the record, but only if it is NOT used (is_used: false)
      const { error } = await supabase
        .from('coupon_usages')
        .delete()
        .eq('id', usageId)
        .eq('is_used', false); // Crucial safety check

      if (error) {
        console.error('Error deleting pending usage:', error);
        return { success: false };
      }
      
      // Realtime will handle the state update via refreshUsages
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
    
    // 1. Check if already pending (prevents double-click/double-generation)
    if (isCouponPending(coupon.id)) {
        showError('Már generáltál egy beváltási kódot ehhez a kuponhoz. Kérjük, használd azt.');
        return { success: false };
    }

    // 2. REAL-TIME USAGE CHECK (Finalized count)
    const { count, error: countError } = await supabase
      .from('coupon_usages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('coupon_id', coupon.id)
      .eq('is_used', true); // Only count finalized usages

    if (countError) {
      showError('Hiba történt a beváltási korlát ellenőrzésekor.');
      console.error('Real-time usage check error:', countError);
      return { success: false };
    }

    // 3. Check max uses per user limit using the fresh count
    if (coupon.max_uses_per_user !== 0 && count !== null && count >= coupon.max_uses_per_user) {
      showError(`Ezt a kupont már beváltottad ${coupon.max_uses_per_user} alkalommal.`);
      return { success: false };
    }
    
    // 4. Generate unique redemption code
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

    // 5. Record usage intent (is_used = false initially)
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
    isCouponPending, // Export new check
    refreshUsages, // Keep exported for manual refresh if needed
    deletePendingUsage, // Export new delete function
  };
};