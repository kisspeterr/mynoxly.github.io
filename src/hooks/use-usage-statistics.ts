import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { useAuth } from './use-auth';
import { format, startOfDay, endOfDay } from 'date-fns';

export interface UsageStat {
  hour: string; // HH:00 format
  count: number;
}

export interface DetailedUsage {
  id: string;
  redeemed_at: string;
  coupon_title: string;
  user_email: string;
}

export const useUsageStatistics = () => {
  const { profile, isAuthenticated, isAdmin } = useAuth();
  const [stats, setStats] = useState<UsageStat[]>([]);
  const [detailedUsages, setDetailedUsages] = useState<DetailedUsage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const organizationName = profile?.organization_name;

  const fetchStatistics = useCallback(async (date: Date, userEmailFilter: string = '') => {
    if (!isAuthenticated || !isAdmin || !organizationName) {
      setStats([]);
      setDetailedUsages([]);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Define date range for the selected day
      const start = startOfDay(date).toISOString();
      const end = endOfDay(date).toISOString();

      // 2. Build the base query for successfully used coupons in the organization
      let query = supabase
        .from('coupon_usages')
        .select(`
          id,
          redeemed_at,
          is_used,
          user_id,
          coupon:coupon_id (title, organization_name)
        `)
        .eq('is_used', true)
        .gte('redeemed_at', start)
        .lte('redeemed_at', end)
        .order('redeemed_at', { ascending: true });

      // RLS ensures only the current organization's coupons are returned, 
      // but we rely on the join filter in the hook for safety/clarity.

      const { data, error } = await query;

      if (error) {
        showError('Hiba történt a statisztikák betöltésekor.');
        console.error('Fetch statistics error:', error);
        setStats([]);
        setDetailedUsages([]);
        return;
      }
      
      if (!data) {
        setStats([]);
        setDetailedUsages([]);
        return;
      }

      // 3. Filter and process data client-side
      const organizationUsages = data.filter(
        (usage) => usage.coupon && usage.coupon.organization_name === organizationName
      );
      
      // 4. Fetch user emails for detailed view (requires separate query for each user ID, which is inefficient, 
      // but necessary as auth.users is not joinable/publicly accessible)
      const userIds = Array.from(new Set(organizationUsages.map(u => u.user_id)));
      const { data: usersData } = await supabase.rpc('get_user_emails_by_ids', { user_ids: userIds });
      
      const emailMap = (usersData || []).reduce((acc, user) => {
        acc[user.id] = user.email;
        return acc;
      }, {} as Record<string, string>);

      // 5. Group by hour and filter by email
      const hourlyCounts: Record<string, number> = {};
      const processedDetails: DetailedUsage[] = [];

      for (const usage of organizationUsages) {
        const redeemedAt = new Date(usage.redeemed_at);
        const hourKey = format(redeemedAt, 'HH:00');
        const userEmail = emailMap[usage.user_id] || `ID: ${usage.user_id.slice(0, 8)}...`;
        
        // Apply email filter
        if (userEmailFilter && !userEmail.toLowerCase().includes(userEmailFilter.toLowerCase())) {
            continue;
        }

        hourlyCounts[hourKey] = (hourlyCounts[hourKey] || 0) + 1;
        
        processedDetails.push({
            id: usage.id,
            redeemed_at: usage.redeemed_at,
            coupon_title: usage.coupon?.title || 'Ismeretlen kupon',
            user_email: userEmail,
        });
      }

      // 6. Format hourly stats (00:00 to 23:00)
      const formattedStats: UsageStat[] = [];
      for (let i = 0; i < 24; i++) {
        const hour = i.toString().padStart(2, '0') + ':00';
        formattedStats.push({
          hour,
          count: hourlyCounts[hour] || 0,
        });
      }

      setStats(formattedStats);
      setDetailedUsages(processedDetails);

    } catch (error) {
      console.error('Unexpected statistics error:', error);
      showError('Váratlan hiba történt a statisztikák betöltésekor.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAdmin, organizationName]);

  return {
    stats,
    detailedUsages,
    isLoading,
    fetchStatistics,
  };
};