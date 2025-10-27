import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from './use-auth'; // Import useAuth

interface ProfileDetails {
  first_name: string | null;
  last_name: string | null;
  organization_name: string | null;
  username: string; // NEW
}

interface UsageDetails {
  id: string;
  coupon_id: string;
  user_id: string;
  redeemed_at: string;
  is_used: boolean;
  coupon: {
    title: string;
    organization_name: string;
    points_reward: number; // Added points_reward
  };
  profile: ProfileDetails | null;
  user_email: string;
}

export const useRedemption = () => {
  const { activeOrganizationProfile, checkPermission } = useAuth(); // Use active organization context
  const [isLoading, setIsLoading] = useState(false);
  const [usageDetails, setUsageDetails] = useState<UsageDetails | null>(null);
  const REDEMPTION_TIMEOUT_MINUTES = 3;
  
  const activeOrganizationName = activeOrganizationProfile?.organization_name;

  const fetchUserProfileAndEmail = async (userId: string) => {
    // 1. Fetch Profile (Name, Username, and Organization)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name, username') // Removed organization_name
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching profile:', profileError);
    }
    
    // 2. Fetch User Email (This is the tricky part, as auth.users is protected)
    // We use the RPC function created for statistics to get email securely
    let userEmail = `ID: ${userId.slice(0, 8)}...`;
    let username = profileData?.username || userEmail;
    
    try {
        const { data: usersData } = await supabase.rpc('get_user_profiles_by_ids', { user_ids: [userId] });
        if (usersData && usersData.length > 0) {
            userEmail = usersData[0].email;
            username = usersData[0].username;
        }
    } catch (e) {
        console.warn('Could not fetch user email/username via RPC:', e);
    }

    return {
      profile: {
          ...(profileData as Omit<ProfileDetails, 'organization_name'> || {}),
          organization_name: null, // Organization name is no longer on user profile
          username: username,
      } as ProfileDetails,
      username: username,
      user_email: userEmail,
    };
  };

  const checkCode = async (code: string) => {
    if (!checkPermission('redemption_agent') || !activeOrganizationName) {
        showError('Nincs jogosultságod a beváltáshoz, vagy nincs aktív szervezet kiválasztva.');
        return;
    }
    
    setIsLoading(true);
    setUsageDetails(null);

    if (code.length !== 6 || isNaN(Number(code))) {
      showError('A kódnak pontosan 6 számjegyből kell állnia.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Fetch usage record by redemption code, joining coupon data including points_reward
      const { data: usage, error } = await supabase
        .from('coupon_usages')
        .select(`
          id,
          coupon_id,
          user_id,
          redeemed_at,
          is_used,
          coupon:coupon_id (title, organization_name, points_reward)
        `)
        .eq('redemption_code', code)
        .single();

      if (error || !usage) {
        showError('Érvénytelen beváltási kód.');
        return;
      }
      
      // 1b. Check if the coupon belongs to the active organization
      if (usage.coupon.organization_name !== activeOrganizationName) {
          showError('Ez a kupon nem a jelenleg kiválasztott szervezethez tartozik.');
          return;
      }

      if (usage.is_used) {
        showError('Ez a kupon már be lett váltva.');
        return;
      }

      // 2. Check time validity (3 minutes)
      const redeemedAt = new Date(usage.redeemed_at);
      const now = new Date();
      const timeDifferenceMs = now.getTime() - redeemedAt.getTime();
      const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);

      if (timeDifferenceMinutes > REDEMPTION_TIMEOUT_MINUTES) {
        showError(`A kód lejárt. ${formatDistanceToNow(redeemedAt, { addSuffix: true, includeSeconds: true })} lett generálva.`);
        return;
      }
      
      // 3. Fetch user profile and email separately
      const { profile: fetchedProfile, user_email, username } = await fetchUserProfileAndEmail(usage.user_id);

      // 4. Code is valid and pending usage
      setUsageDetails({
        ...(usage as Omit<UsageDetails, 'profile' | 'user_email'>),
        profile: fetchedProfile,
        user_email,
      });
      showSuccess('Kód érvényesítve! Kérjük, véglegesítsd a beváltást.');

    } catch (error) {
      console.error('Code check error:', error);
      showError('Hiba történt a kód ellenőrzésekor.');
    } finally {
      setIsLoading(false);
    }
  };

  const finalizeRedemption = async () => {
    if (!usageDetails) return;
    
    if (!checkPermission('redemption_agent') || usageDetails.coupon.organization_name !== activeOrganizationName) {
        showError('Nincs jogosultságod a beváltás véglegesítéséhez.');
        return false;
    }

    setIsLoading(true);
    try {
      // Call the secure Postgres RPC function
      const { data: success, error: rpcError } = await supabase.rpc('finalize_coupon_redemption', {
        usage_id_in: usageDetails.id,
      });

      if (rpcError) {
        // Handle specific Postgres exceptions raised in the function
        if (rpcError.message.includes('Unauthorized')) {
            showError('Jogosultsági hiba: Csak adminok véglegesíthetik a beváltást, vagy a kupon nem a szervezetéhez tartozik.');
        } else if (rpcError.message.includes('Coupon already used')) {
            showError('Ez a kupon már be lett váltva.');
        } else {
            showError(`Hiba történt a beváltás véglegesítésekor: ${rpcError.message}`);
        }
        console.error('Finalize RPC error:', rpcError);
        return false;
      }
      
      // If successful, the RPC handled the usage update and point reward
      const pointsReward = usageDetails.coupon.points_reward;
      
      showSuccess(`Sikeres beváltás! Kupon: ${usageDetails.coupon.title}${pointsReward > 0 ? ` (+${pointsReward} pont)` : ''}`);
      setUsageDetails(null); // Clear details after successful redemption
      return true;

    } catch (error) {
      console.error('Finalize error:', error);
      showError('Váratlan hiba történt.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    usageDetails,
    checkCode,
    finalizeRedemption,
    clearDetails: () => setUsageDetails(null),
  };
};