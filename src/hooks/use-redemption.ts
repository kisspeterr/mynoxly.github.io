import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { formatDistanceToNow } from 'date-fns';

interface UsageDetails {
  id: string;
  coupon_id: string;
  user_id: string;
  redeemed_at: string;
  is_used: boolean;
  coupon: {
    title: string;
    organization_name: string;
  };
  profile: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  user_email: string;
}

export const useRedemption = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [usageDetails, setUsageDetails] = useState<UsageDetails | null>(null);
  const REDEMPTION_TIMEOUT_MINUTES = 3;

  const fetchUserProfileAndEmail = async (userId: string) => {
    // 1. Fetch Profile (Name)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching profile:', profileError);
    }

    // 2. Fetch User Email (This is the tricky part, as auth.users is protected)
    // We rely on the fact that the admin session might have elevated privileges, 
    // but client-side RLS usually prevents reading other users' emails from auth.users.
    // Since we cannot use the Service Role Key here, we must rely on the user ID for identification.
    
    // For demonstration, we will use a placeholder or the user ID if the email is inaccessible.
    let userEmail = `User ID: ${userId.slice(0, 8)}...`;
    
    // In a real scenario, if the admin needs the email, this must be done via a secure Edge Function.
    // Since we are client-side, we cannot reliably fetch the target user's email.

    return {
      profile: profileData || null,
      user_email: userEmail,
    };
  };

  const checkCode = async (code: string) => {
    setIsLoading(true);
    setUsageDetails(null);

    if (code.length !== 6 || isNaN(Number(code))) {
      showError('A kódnak pontosan 6 számjegyből kell állnia.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Fetch usage record by redemption code, joining only the coupon data
      const { data: usage, error } = await supabase
        .from('coupon_usages')
        .select(`
          id,
          coupon_id,
          user_id,
          redeemed_at,
          is_used,
          coupon:coupon_id (title, organization_name)
        `)
        .eq('redemption_code', code)
        .single();

      if (error || !usage) {
        showError('Érvénytelen beváltási kód.');
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
      const { profile, user_email } = await fetchUserProfileAndEmail(usage.user_id);

      // 4. Code is valid and pending usage
      setUsageDetails({
        ...(usage as Omit<UsageDetails, 'profile' | 'user_email'>),
        profile,
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

    setIsLoading(true);
    try {
      // Mark as used, BUT ONLY IF IT IS CURRENTLY UNUSED (is_used: false)
      const { error, count } = await supabase
        .from('coupon_usages')
        .update({ is_used: true })
        .eq('id', usageDetails.id)
        .eq('is_used', false) // CRITICAL: Only update if it hasn't been used yet
        .select()
        .single();

      if (error) {
        showError('Hiba történt a beváltás véglegesítésekor.');
        console.error('Finalize error:', error);
        return false;
      }
      
      // If the update was successful (meaning it was previously is_used=false)
      // Note: Supabase returns the updated row in data, but we check for error.
      
      // If the update was successful, the Realtime event will fire.
      showSuccess(`Sikeres beváltás! Kupon: ${usageDetails.coupon.title}`);
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