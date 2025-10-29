import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { useAuth } from './use-auth';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';
import { hu } from 'date-fns/locale'; // Import Hungarian locale for date formatting

export type TimeRange = 'day' | 'week' | 'month' | 'year';

export interface UsageStat {
  label: string; // Formatted label (e.g., HH:00, MM. dd., Week X)
  count: number;
}

export interface DetailedUsage {
  id: string;
  redeemed_at: string;
  coupon_title: string;
  username: string; // CHANGED: Use username instead of user_email
}

export const useUsageStatistics = () => {
  const { activeOrganizationProfile, activeOrganizationId, isAuthenticated, checkPermission } = useAuth();
  const [stats, setStats] = useState<UsageStat[]>([]);
  const [detailedUsages, setDetailedUsages] = useState<DetailedUsage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const organizationName = activeOrganizationProfile?.organization_name;
  
  // Determine if the user has ANY permission to view usages
  const hasPermission = checkPermission('viewer') || checkPermission('redemption_agent') || checkPermission('coupon_manager') || checkPermission('event_manager');


  const fetchStatistics = useCallback(async (date: Date, timeRange: TimeRange, userEmailFilter: string = '') => {
    if (!isAuthenticated || !organizationName || !hasPermission) {
      setStats([]);
      setDetailedUsages([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      let start: string;
      let end: string;
      let groupFn: (d: Date) => string;
      let initialData: UsageStat[] = [];

      // 1. Determine date range and grouping logic
      switch (timeRange) {
        case 'day':
          start = startOfDay(date).toISOString();
          end = endOfDay(date).toISOString();
          groupFn = (d) => format(d, 'HH:00');
          // Initialize 24 hours
          for (let i = 0; i < 24; i++) {
            initialData.push({ label: i.toString().padStart(2, '0') + ':00', count: 0 });
          }
          break;
        case 'week':
          const startW = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
          const endW = endOfWeek(date, { weekStartsOn: 1 });
          start = startW.toISOString();
          end = endW.toISOString();
          
          // Group by day of the week (e.g., "Hé (08. 12.)")
          groupFn = (d) => format(d, 'EEE (MM. dd.)', { locale: hu });
          
          // Initialize 7 days with descriptive labels
          const daysInWeek = eachDayOfInterval({ start: startW, end: endW });
          initialData = daysInWeek.map(d => ({ label: groupFn(d), count: 0 }));
          break;
        case 'month':
          const startM = startOfMonth(date);
          const endM = endOfMonth(date);
          start = startM.toISOString();
          end = endM.toISOString();
          
          // Group by day of the month (e.g., "08. 12.")
          groupFn = (d) => format(d, 'MM. dd.');
          // We don't pre-initialize days for a month, we'll use the actual data points
          break;
        case 'year':
          const startY = startOfYear(date);
          const endY = endOfYear(date);
          start = startY.toISOString();
          end = endY.toISOString();
          
          // Group by month name (e.g., "Január 2024")
          groupFn = (d) => format(d, 'yyyy. MMMM', { locale: hu });
          
          // Initialize 12 months with Hungarian month names
          const monthsInYear = eachMonthOfInterval({ start: startY, end: endY });
          initialData = monthsInYear.map(d => ({ label: groupFn(d), count: 0 }));
          break;
        default:
          throw new Error('Invalid time range');
      }

      // 2. Build the base query for successfully used coupons
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
        (usage) => usage.coupon && usage.coupon.organization_name === organizationName
      );
      
      // 4. Fetch user profiles (username and email) for detailed view (ONLY for 'day' range)
      const processedDetails: DetailedUsage[] = [];
      let profileMap: Record<string, { username: string, email: string }> = {};

      if (timeRange === 'day') {
        const userIds = Array.from(new Set(organizationUsages.map(u => u.user_id)));
        
        // Use the new RPC function
        const { data: usersData } = await supabase.rpc('get_user_profiles_by_ids', { user_ids: userIds });
        
        profileMap = (usersData || []).reduce((acc, user) => {
          acc[user.id] = { username: user.username, email: user.email };
          return acc;
        }, {} as Record<string, { username: string, email: string }>);
      }

      // 5. Group by time range and filter by email/username (only for 'day' range)
      const aggregatedCounts: Record<string, number> = {};
      
      for (const usage of organizationUsages) {
        const redeemedAt = new Date(usage.redeemed_at);
        const groupKey = groupFn(redeemedAt);
        
        // Detailed view processing (only for 'day' range)
        if (timeRange === 'day') {
            const userProfile = profileMap[usage.user_id];
            const usernameDisplay = userProfile?.username ? `@${userProfile.username}` : `ID: ${usage.user_id.slice(0, 8)}...`;
            const userEmail = userProfile?.email || '';
            
            // Apply filter (now checks both username and email)
            if (userEmailFilter) {
                const filterLower = userEmailFilter.toLowerCase();
                if (!usernameDisplay.toLowerCase().includes(filterLower) && !userEmail.toLowerCase().includes(filterLower)) {
                    continue;
                }
            }
            
            processedDetails.push({
                id: usage.id,
                redeemed_at: usage.redeemed_at,
                coupon_title: usage.coupon?.title || 'Ismeretlen kupon',
                username: usernameDisplay, // Store username
            });
        }

        // Aggregate counts
        aggregatedCounts[groupKey] = (aggregatedCounts[groupKey] || 0) + 1;
      }

      // 6. Format stats array
      let finalStats: UsageStat[];
      
      if (timeRange === 'day' || timeRange === 'week' || timeRange === 'year') {
        // Use pre-initialized array and fill counts
        finalStats = initialData.map(stat => ({
          ...stat,
          count: aggregatedCounts[stat.label] || 0,
        }));
      } else { // month (day-by-day breakdown)
        // Sort unique keys and map to stats
        finalStats = Object.keys(aggregatedCounts)
            .sort()
            .map(label => ({ label, count: aggregatedCounts[label] }));
      }

      setStats(finalStats);
      setDetailedUsages(processedDetails); // Only populated for 'day' range

    } catch (error) {
      console.error('Unexpected statistics error:', error);
      showError('Váratlan hiba történt a statisztikák betöltésekor.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, organizationName, hasPermission, activeOrganizationId]); // Added activeOrganizationId to dependencies

  return {
    stats,
    detailedUsages,
    isLoading,
    fetchStatistics,
    hasPermission, // NEW
  };
};