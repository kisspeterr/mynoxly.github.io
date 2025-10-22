import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';

// 3 minutes in milliseconds
const REDEMPTION_DURATION_MS = 3 * 60 * 1000;

export interface UserUsageRecord {
  id: string;
  user_id: string;
  coupon_id: string;
  redeemed_at: string;
  is_used: boolean;
  redemption_code: string;
  
  // Joined Coupon data
  coupon: {
    id: string;
    title: string;
    description: string | null;
    organization_name: string;
    image_url: string | null;
    expiry_date: string | null;
  } | null;
  
  // Calculated status
  status: 'active' | 'used' | 'expired';
  timeLeftMs: number;
}

export const useUserUsages = () => {
  const { user, isAuthenticated } = useAuth();
  const [usages, setUsages] = useState<UserUsageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const calculateStatus = (usage: Omit<UserUsageRecord, 'status' | 'timeLeftMs'>): { status: 'active' | 'used' | 'expired', timeLeftMs: number } => {
    if (usage.is_used) {
      return { status: 'used', timeLeftMs: 0 };
    }

    const redeemedTime = new Date(usage.redeemed_at).getTime();
    const expiryTime = redeemedTime + REDEMPTION_DURATION_MS;
    const now = Date.now();
    const timeLeft = expiryTime - now;

    if (timeLeft <= 0) {
      return { status: 'expired', timeLeftMs: 0 };
    }

    return { status: 'active', timeLeftMs: timeLeft };
  };

  const fetchUsages = async () => {
    if (!isAuthenticated || !user) {
      setUsages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch all usages for the current user, joining coupon details
      const { data, error } = await supabase
        .from('coupon_usages')
        .select(`
          id,
          user_id,
          coupon_id,
          redeemed_at,
          is_used,
          redemption_code,
          coupon:coupon_id (id, title, description, organization_name, image_url, expiry_date)
        `)
        .eq('user_id', user.id) // RLS ensures this is safe
        .order('redeemed_at', { ascending: false });

      if (error) {
        showError('Hiba történt a kuponjaid betöltésekor.');
        console.error('Fetch user usages error:', error);
        setUsages([]);
        return;
      }

      const processedUsages: UserUsageRecord[] = (data as Omit<UserUsageRecord, 'status' | 'timeLeftMs'>[]).map(usage => {
        const { status, timeLeftMs } = calculateStatus(usage);
        return { ...usage, status, timeLeftMs };
      });
      
      setUsages(processedUsages);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsages();
    
    // Setup Realtime subscription for user's own coupon usages
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    if (isAuthenticated && user) {
      channel = supabase
        .channel(`user_usages_profile_${user.id}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'coupon_usages',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            // When a change happens (INSERT/UPDATE/DELETE), refresh the entire usage list
            fetchUsages();
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

  // Timer for active coupons (updates every second)
  useEffect(() => {
    const activeUsages = usages.filter(u => u.status === 'active');
    if (activeUsages.length === 0) return;

    const timer = setInterval(() => {
      setUsages(prevUsages => prevUsages.map(usage => {
        if (usage.status === 'active') {
          const newTimeLeft = usage.timeLeftMs - 1000;
          if (newTimeLeft <= 0) {
            return { ...usage, status: 'expired', timeLeftMs: 0 };
          }
          return { ...usage, timeLeftMs: newTimeLeft };
        }
        return usage;
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [usages.filter(u => u.status === 'active').length]); // Only re-run if the count of active usages changes

  return {
    usages,
    isLoading,
    fetchUsages,
  };
};