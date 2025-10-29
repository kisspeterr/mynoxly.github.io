import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from './use-auth';
import { generateRedemptionCode } from '@/utils/code-generator';
import { Coupon } from '@/types/coupons';

// 3 minutes in milliseconds
const REDEMPTION_DURATION_MS = 3 * 60 * 1000;

// Define a type for coupon usage records, including redeemed_at
interface CouponUsage {
  id: string;
  coupon_id: string;
  is_used: boolean;
  redeemed_at: string; // We need this to check expiration time
}

// Extend Coupon type to include organization profile data and usage count
interface PublicCoupon extends Coupon {
  logo_url: string | null; // Simplified: logo_url directly on coupon object
  organization_id: string; // NEW: Organization ID (UUID)
  usage_count: number; // New field for total successful usages
}

export const usePublicCoupons = () => {
  const { user, isAuthenticated } = useAuth();
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [allUsages, setAllUsages] = useState<CouponUsage[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  // Helper to fetch organization logos and IDs
  const fetchOrganizationLogos = async (organizationNames: string[]): Promise<Record<string, { id: string, logo_url: string | null }>> => {
    if (organizationNames.length === 0) return {};
    
    const { data, error } = await supabase
      .from('organizations') // Use new organizations table
      .select('id, organization_name, logo_url')
      .in('organization_name', organizationNames);

    if (error) {
      console.error('Error fetching organization logos:', error);
      return {};
    }

    return data.reduce((acc, org) => {
      acc[org.organization_name] = { id: org.id, logo_url: org.logo_url };
      return acc;
    }, {} as Record<string, { id: string, logo_url: string | null }>);
  };

  // Function to manually refresh usages (called after successful redemption or modal close)
  const refreshUsages = async () => {
    // We need to refresh both usages (for pending/used status) AND coupon counts (for public display)
    await fetchCouponsAndUsages();
  };

  // Fetches all coupons and the current user's finalized usages
  const fetchCouponsAndUsages = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch all ACTIVE and NON-ARCHIVED coupons
      const { data: couponData, error: couponError } = await supabase
        .from('coupons')
        .select(`*`)
        .eq('is_active', true) // <-- NEW FILTER
        .eq('is_archived', false) // <-- NEW FILTER
        .order('created_at', { ascending: false });

      if (couponError) {
        showError('Hiba történt a kuponok betöltésekor.');
        console.error('Fetch public coupons error:', couponError);
        setCoupons([]);
        return;
      }
      
      const rawCoupons = couponData as Coupon[];
      const organizationNames = Array.from(new Set(rawCoupons.map(c => c.organization_name)));
      
      // 2. Fetch organization logos and IDs separately
      const logoMap = await fetchOrganizationLogos(organizationNames);
      
      // 3. Fetch usage counts for all coupons concurrently
      const usageCountPromises = rawCoupons.map(coupon => 
        supabase.rpc('get_coupon_usage_count', { coupon_id_in: coupon.id })
      );
      const usageCountResults = await Promise.all(usageCountPromises);
      
      const couponsWithLogos: PublicCoupon[] = rawCoupons.map((coupon, index) => {
        const usageCount = usageCountResults[index].data || 0;
        const orgInfo = logoMap[coupon.organization_name];
        
        return {
          ...coupon,
          logo_url: orgInfo?.logo_url || null,
          organization_id: orgInfo?.id || '', // CRITICAL: Store organization ID (UUID)
          usage_count: Number(usageCount), // Ensure it's a number
        };
      }).filter(c => c.organization_id !== ''); // Filter out coupons whose organization profile is missing

      setCoupons(couponsWithLogos);

      // 4. Fetch current user's ALL usages if authenticated
      if (isAuthenticated && user) {
        const { data: usageData, error: usageError } = await supabase
          .from('coupon_usages')
          .select('id, coupon_id, is_used, redeemed_at') // Include redeemed_at
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
            // We rely on explicit refreshUsages calls for immediate feedback, 
            // but keep this for general consistency.
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

  // --- Logic for checking pending/expired codes ---
  
  const isPendingExpired = (usage: CouponUsage): boolean => {
    if (usage.is_used) return false;
    
    const redeemedTime = new Date(usage.redeemed_at).getTime();
    const expiryTime = redeemedTime + REDEMPTION_DURATION_MS;
    const now = Date.now();
    
    return now > expiryTime;
  }

  // NEW LOGIC: Check if the user has reached the max uses limit, counting ONLY successfully used codes.
  const isCouponUsedUp = (couponId: string, maxUses: number): boolean => {
    if (maxUses === 0) return false;
    
    // Count ONLY successfully used usages (is_used: true)
    const count = allUsages.filter(u => u.coupon_id === couponId && u.is_used === true).length;
    return count >= maxUses;
  };
  
  // Returns the pending usage object if one exists and is NOT expired
  const getActivePendingUsage = (couponId: string): CouponUsage | undefined => {
    // Find any usage that is NOT used (is_used: false)
    const pendingUsage = allUsages.find(u => u.coupon_id === couponId && u.is_used === false);
    
    if (!pendingUsage) {
        return undefined;
    }
    
    // If it's expired, treat it as non-pending for the purpose of generating a new code
    if (isPendingExpired(pendingUsage)) {
        return undefined;
    }
    
    return pendingUsage;
  };
  
  // NEW FUNCTION: Allows user to delete a pending usage record
  const deletePendingUsage = async (usageId: string) => {
    if (!isAuthenticated || !user) {
        showError('Kérjük, jelentkezz be.');
        return { success: false };
    }
    
    try {
        const { error } = await supabase
            .from('coupon_usages')
            .delete()
            .eq('id', usageId)
            .eq('user_id', user.id) // RLS should handle this, but explicit check is safer
            .eq('is_used', false); // Only allow deletion of unused codes

        if (error) {
            showError('Hiba történt a kód törlésekor.');
            console.error('Delete pending usage error:', error);
            return { success: false };
        }
        
        showSuccess('Beváltási kód sikeresen törölve.');
        refreshUsages();
        return { success: true };
        
    } catch (error) {
        console.error('Unexpected delete error:', error);
        showError('Váratlan hiba történt a törlés során.');
        return { success: false };
    }
  };
  
  const redeemCoupon = async (coupon: PublicCoupon, onPointsUpdated?: () => void): Promise<{ success: boolean, usageId?: string, redemptionCode?: string }> => {
    if (!isAuthenticated || !user) {
      showError('Kérjük, jelentkezz be a kupon beváltásához.');
      return { success: false };
    }
    
    // 1. Check finalized usage count (re-check against DB for safety)
    // CRITICAL CHANGE: Check ONLY for used coupons here, matching the isCouponUsedUp logic
    const { count, error: countError } = await supabase
      .from('coupon_usages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('coupon_id', coupon.id)
      .eq('is_used', true); // <-- ONLY COUNT USED ONES

    if (countError) {
      showError('Hiba történt a beváltási korlát ellenőrzésekor.');
      console.error('Real-time usage check error:', countError);
      return { success: false };
    }

    if (coupon.max_uses_per_user !== 0 && count !== null && count >= coupon.max_uses_per_user) {
      showError(`Ezt a kupont már beváltottad ${coupon.max_uses_per_user} alkalommal.`);
      return { success: false };
    }
    
    // --- NEW LOGIC BRANCHING ---
    if (!coupon.is_code_required) {
        // A. Simple Redemption (Immediate, no code, no modal)
        try {
            const { data: success, error: rpcError } = await supabase.rpc('redeem_simple_coupon', {
                coupon_id_in: coupon.id,
            });
            
            if (rpcError) {
                // Handle specific Postgres exceptions raised in the function
                if (rpcError.message.includes('Usage limit reached')) {
                    showError(`Ezt a kupont már beváltottad ${coupon.max_uses_per_user} alkalommal.`);
                } else if (rpcError.message.includes('Insufficient loyalty points')) {
                    showError(`Nincs elegendő hűségpontod a beváltáshoz.`);
                } else {
                    showError(`Hiba történt az azonnali beváltás során: ${rpcError.message}`);
                }
                console.error('Simple Redeem RPC error:', rpcError);
                return { success: false };
            }
            
            const pointsReward = coupon.points_reward;
            showSuccess(`Sikeres beváltás! Kupon: ${coupon.title}${pointsReward > 0 ? ` (+${pointsReward} pont)` : ''}`);
            
            // Manually trigger points refresh if callback is provided
            if (onPointsUpdated) {
                onPointsUpdated();
            }
            
            // Refresh usages immediately after successful insertion to update local state
            await refreshUsages();
            
            return { success: true };
            
        } catch (error) {
            console.error('Simple Redeem error:', error);
            showError('Váratlan hiba történt az azonnali beváltás során.');
            return { success: false };
        }
        
    } else {
        // B. Code Redemption (Generates code, requires admin approval)
        
        // 2. Check for active pending usage (Only relevant for code-based redemption)
        const activePendingCheck = getActivePendingUsage(coupon.id);
        if (activePendingCheck) {
            showError('Már generáltál egy beváltási kódot ehhez a kuponhoz. Kérjük, használd azt.');
            return { success: false };
        }
        
        // 3. Check Loyalty Points Cost (Pre-check for code generation)
        if (coupon.points_cost > 0) {
            const organizationId = coupon.organization_id; // Use the already fetched UUID
            if (!organizationId) {
                showError('Hiba: Nem található a szervezet azonosítója.');
                return { success: false };
            }
            
            // Fetch current points for this organization using organizationId (UUID)
            const { data: pointsData } = await supabase
                .from('loyalty_points')
                .select('points')
                .eq('user_id', user.id)
                .eq('organization_id', organizationId)
                .single();
                
            const currentPoints = pointsData?.points || 0;
            
            if (currentPoints < coupon.points_cost) {
                showError(`Nincs elegendő hűségpontod (${coupon.points_cost} pont szükséges). Jelenlegi pont: ${currentPoints}.`);
                return { success: false };
            }
            
            // NOTE: Points deduction now happens in finalize_coupon_redemption RPC.
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

        try {
          // 5. Insert usage record (is_used: false)
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
          
          // Refresh usages immediately after successful insertion to update local state
          await refreshUsages();
          
          return { success: true, usageId: data.id, redemptionCode: data.redemption_code };

        } catch (error) {
          console.error('Redeem error:', error);
          showError('Váratlan hiba történt a beváltás során.');
          return { success: false };
        }
    }
  };
  
  return {
    coupons,
    isLoading,
    redeemCoupon,
    isCouponUsedUp,
    isCouponPending: (couponId: string) => !!getActivePendingUsage(couponId), // Check if active pending exists
    getPendingUsageId: (couponId: string) => getActivePendingUsage(couponId)?.id, // Get ID of active pending usage
    refreshUsages,
    deletePendingUsage, // Now defined
  };
};