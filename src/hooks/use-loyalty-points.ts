import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth, OrganizationProfileData } from './use-auth';

export interface LoyaltyPointRecord {
  id: string;
  user_id: string;
  organization_id: string;
  points: number;
  updated_at: string;
  
  // Joined organization data for display
  profile: OrganizationProfileData;
}

export const useLoyaltyPoints = () => {
  const { user, isAuthenticated } = useAuth();
  const [points, setPoints] = useState<LoyaltyPointRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPoints = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setPoints([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch points, joining the organization profile data from the new 'organizations' table
      const { data, error } = await supabase
        .from('loyalty_points')
        .select(`
          id,
          user_id,
          organization_id,
          points,
          updated_at,
          profile:organization_id (id, organization_name, logo_url, is_public, owner_id)
        `)
        .eq('user_id', user.id) // RLS ensures this is safe
        .order('points', { ascending: false });

      if (error) {
        showError('Hiba történt a hűségpontok betöltésekor.');
        console.error('Fetch loyalty points error:', error);
        setPoints([]);
        return;
      }
      
      // Ensure profile data is present and correctly typed
      const validPoints = (data as (Omit<LoyaltyPointRecord, 'profile'> & { profile: OrganizationProfileData | null })[])
        .filter(p => p.profile !== null)
        .map(p => ({
            ...p,
            profile: p.profile as OrganizationProfileData,
        }));
        
      setPoints(validPoints);

    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    fetchPoints();
    
    // Setup Realtime subscription for changes in user's loyalty points
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    if (isAuthenticated && user) {
      channel = supabase
        .channel(`user_loyalty_${user.id}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'loyalty_points',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchPoints();
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchPoints, isAuthenticated, user?.id]);
  
  /**
   * Retrieves the current point balance for a specific organization.
   */
  const getPointsForOrganization = (organizationId: string): number => {
    return points.find(p => p.organization_id === organizationId)?.points || 0;
  };

  return {
    points,
    isLoading,
    fetchPoints,
    getPointsForOrganization,
  };
};