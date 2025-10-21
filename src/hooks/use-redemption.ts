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
  // We fetch profile data instead of trying to fetch auth.users directly
  profile: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  user_email: string; // We will manually fetch this if needed, but for now, rely on the user object if available.
}

export const useRedemption = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [usageDetails, setUsageDetails] = useState<UsageDetails | null>(null);
  const REDEMPTION_TIMEOUT_MINUTES = 3;

  const checkCode = async (code: string) => {
    setIsLoading(true);
    setUsageDetails(null);

    if (code.length !== 6 || isNaN(Number(code))) {
      showError('A kódnak pontosan 6 számjegyből kell állnia.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Fetch usage record by redemption code, joining coupon and profile data
      const { data: usage, error } = await supabase
        .from('coupon_usages')
        .select(`
          id,
          coupon_id,
          user_id,
          redeemed_at,
          is_used,
          coupon:coupon_id (title, organization_name),
          profile:user_id (first_name, last_name)
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
      
      // 3. Manually fetch user email from auth.users (only possible if RLS allows, or if we are admin)
      // Since this is an Admin page, we assume the admin has the necessary permissions or we rely on the user object being available.
      // However, since we are using the client-side Supabase client, we cannot access auth.users directly.
      // We will rely on the user object being available in the session for the admin, but for display purposes, we need the email.
      
      // Fallback: If we cannot fetch the email, we display the user ID.
      let userEmail = 'Nincs elérhető email';
      
      // Try to get the user object from Supabase auth (which is available to the admin session)
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser && authUser.id === usage.user_id) {
          // If the admin is redeeming their own coupon (unlikely but possible), use their email
          userEmail = authUser.email || userEmail;
      } else {
          // Since we cannot query auth.users directly from the client, we must rely on the profile data or the user ID.
          // For a real production app, this check should happen in an Edge Function or a server environment.
          // For now, we will display the user ID and a placeholder email.
          userEmail = `User ID: ${usage.user_id.slice(0, 8)}...`;
      }


      // 4. Code is valid and pending usage
      setUsageDetails({
        ...(usage as Omit<UsageDetails, 'user_email' | 'user'>),
        user_email: userEmail,
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
      // Mark as used
      const { error } = await supabase
        .from('coupon_usages')
        .update({ is_used: true })
        .eq('id', usageDetails.id);

      if (error) {
        showError('Hiba történt a beváltás véglegesítésekor.');
        console.error('Finalize error:', error);
        return false;
      }

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