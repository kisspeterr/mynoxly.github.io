import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { useAuth } from './use-auth';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export type TimeRange = 'day' | 'week' | 'month' | 'year';

export interface UsageStat {
  label: string; // Formatted label (e.g., HH:00, MM. dd., Week X)
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

  const fetchStatistics = useCallback(async (date: Date, timeRange: TimeRange, userEmailFilter: string = '') => {
    if (!isAuthenticated || !isAdmin || !organizationName) {
      setStats([]);
      setDetailedUsages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      let start: string;
      let end: string;
      let dateFormat: string;
      let groupFn: (d: Date) => string;
      let initialData: UsageStat[] = [];

      // 1. Determine date range and grouping logic
      switch (timeRange) {
        case 'day':
          start = startOfDay(date).toISOString();
          end = endOfDay(date).toISOString();
          dateFormat = 'HH:00';
          groupFn = (d) => format(d, dateFormat);
          // Initialize 24 hours
          for (let i = 0; i < 24; i++) {
            initialData.push({ label: i.toString().padStart(2, '0') + ':00', count: 0 });
          }
          break;
        case 'week':
          start = startOfWeek(date, { weekStartsOn: 1 }).toISOString(); // Monday start
          end = endOfWeek(date, { weekStartsOn: 1 }).toISOString();
          dateFormat = 'EEE'; // Mon, Tue, etc.
          groupFn = (d) => format(d, dateFormat);
          // Initialize 7 days
          const days = ['Hé', 'Ke', 'Sze', 'Csü', 'Pé', 'Szo', 'Va'];
          initialData = days.map(day => ({ label: day, count: 0 }));
          break;
        case 'month':
          start = startOfMonth(date).toISOString();
          end = endOfMonth(date).toISOString();
          dateFormat = 'MM. dd.';
          groupFn = (d) => format(d, dateFormat);
          // We don't pre-initialize days for a month, we'll use the actual data points
          break;
        case 'year':
          start = startOfYear(date).toISOString();
          end = endOfYear(date).toISOString();
          dateFormat = 'yyyy. MM.';
          groupFn = (d) => format(d, dateFormat);
          // Initialize 12 months
          for (let i = 0; i < 12; i++) {
            initialData.push({ label: format(new Date(date.getFullYear(), i, 1), 'yyyy. MM.'), count: 0 });
          }
          break;
        default:
          throw new Error('Invalid time range');
      }

      // 2. Build the base query for successfully used coupons
      // RLS ensures only usages related to the admin's organization's coupons are returned.
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

      const { data, error } = await query;

      if (error) {
        showError('Hiba történt a statisztikák betöltésekor. Ellenőrizd a szervezet nevét a profilban.');
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

      // 3. Filter and process data client-side (CRITICAL: Filter by organization name)
      const organizationUsages = data.filter(
        // We rely on RLS, but ensure the joined coupon data exists and matches the organization name (safety check)
        (usage) => usage.coupon && usage.coupon.organization_name === organizationName
      );
      
      // 4. Fetch user emails for detailed view (ONLY for 'day' range)
      const processedDetails: DetailedUsage[] = [];
      let emailMap: Record<string, string> = {};

      if (timeRange === 'day') {
        const userIds = Array.from(new Set(organizationUsages.map(u => u.user_id)));
        const { data: usersData } = await supabase.rpc('get_user_emails_by_ids', { user_ids: userIds });
        
        emailMap = (usersData || []).reduce((acc, user) => {
          acc[user.id] = user.email;
          return acc;
        }, {} as Record<string, string>);
      }

      // 5. Group by time range and filter by email (only for 'day' range)
      const hourlyCounts: Record<string, number> = {};
      
      for (const usage of organizationUsages) {
        const redeemedAt = new Date(usage.redeemed_at);
        const groupKey = groupFn(redeemedAt);
        
        // Detailed view processing (only for 'day' range)
        if (timeRange === 'day') {
            const userEmail = emailMap[usage.user_id] || `ID: ${usage.user_id.slice(0, 8)}...`;
            
            // Apply email filter
            if (userEmailFilter && !userEmail.toLowerCase().includes(userEmailFilter.toLowerCase())) {
                continue;
            }
            
            processedDetails.push({
                id: usage.id,
                redeemed_at: usage.redeemed_at,
                coupon_title: usage.coupon?.title || 'Ismeretlen kupon',
                user_email: userEmail,
            });
        }

        // Aggregate counts
        hourlyCounts[groupKey] = (hourlyCounts[groupKey] || 0) + 1;
      }

      // 6. Format stats array
      let finalStats: UsageStat[];
      
      if (timeRange === 'day' || timeRange === 'year') {
        // Use pre-initialized array and fill counts
        finalStats = initialData.map(stat => ({
          ...stat,
          count: hourlyCounts[stat.label] || 0,
        }));
      } else if (timeRange === 'week') {
        // Map counts to the fixed day labels
        finalStats = initialData.map((stat, index) => {
            // Find the corresponding day key (e.g., 'Mon')
            const dayKey = stat.label;
            // Find the actual count from the aggregated data
            const count = Object.keys(hourlyCounts).find(key => key.includes(dayKey)) 
                ? hourlyCounts[dayKey] 
                : 0;
            return { label: stat.label, count };
        });
      } else { // month
        // Sort unique keys and map to stats
        finalStats = Object.keys(hourlyCounts)
            .sort()
            .map(label => ({ label, count: hourlyCounts[label] }));
      }

      setStats(finalStats);
      setDetailedUsages(processedDetails); // Only populated for 'day' range

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