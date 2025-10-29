import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth, OrganizationProfileData } from './use-auth';
import { Challenge, ChallengeInsert, ConditionType } from '@/types/challenges';

// Helper to fetch organization profiles for rewards
const fetchOrganizationProfiles = async (orgIds: string[]): Promise<Record<string, OrganizationProfileData>> => {
    if (orgIds.length === 0) return {};
    
    const { data, error } = await supabase
      .from('organizations')
      .select('id, organization_name, logo_url, is_public, owner_id')
      .in('id', orgIds);

    if (error) {
      console.error('Error fetching organization profiles:', error);
      return {};
    }

    return (data as OrganizationProfileData[]).reduce((acc, org) => {
      acc[org.id] = org;
      return acc;
    }, {} as Record<string, OrganizationProfileData>);
};


export const useSuperadminChallenges = () => {
  const { isSuperadmin } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChallenges = useCallback(async () => {
    if (!isSuperadmin) {
      setChallenges([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Fetch all challenges
      const { data: rawChallenges, error } = await supabase
        .from('challenges')
        .select(`*`)
        .order('created_at', { ascending: false });

      if (error) {
        showError('Hiba történt a küldetések betöltésekor.');
        console.error('Fetch challenges error:', error);
        setChallenges([]);
        return;
      }
      
      const rewardOrgIds = Array.from(new Set(
          (rawChallenges || []).map(c => c.reward_organization_id).filter((id): id is string => id !== null)
      ));
      
      // 2. Fetch organization profiles for rewards
      const orgProfileMap = await fetchOrganizationProfiles(rewardOrgIds);
      
      // 3. Combine data
      const processedChallenges: Challenge[] = (rawChallenges || []).map(c => ({
          ...c,
          reward_organization_profile: c.reward_organization_id ? orgProfileMap[c.reward_organization_id] || null : null,
      }));
      
      setChallenges(processedChallenges);

    } finally {
      setIsLoading(false);
    }
  }, [isSuperadmin]);
  
  const fetchOrganizations = useCallback(async () => {
    if (!isSuperadmin) return;
    
    const { data, error } = await supabase
        .from('organizations')
        .select('id, organization_name, logo_url, is_public, owner_id')
        .order('organization_name', { ascending: true });
        
    if (error) {
        console.error('Error fetching organizations for challenges:', error);
        return;
    }
    setOrganizations(data as OrganizationProfileData[]);
  }, [isSuperadmin]);

  useEffect(() => {
    fetchChallenges();
    fetchOrganizations();
  }, [fetchChallenges, fetchOrganizations]);

  const createChallenge = async (data: ChallengeInsert) => {
    if (!isSuperadmin) {
      showError('Nincs jogosultságod küldetés létrehozásához.');
      return { success: false };
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('challenges')
        .insert(data);

      if (error) {
        showError(`Hiba a küldetés létrehozásakor: ${error.message}`);
        return { success: false };
      }

      showSuccess('Küldetés sikeresen létrehozva!');
      fetchChallenges();
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateChallenge = async (id: string, data: Partial<ChallengeInsert>) => {
    if (!isSuperadmin) {
        showError('Nincs jogosultságod küldetés frissítéséhez.');
        return { success: false };
    }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('challenges')
        .update(data)
        .eq('id', id);

      if (error) {
        showError(`Hiba a küldetés frissítésekor: ${error.message}`);
        return { success: false };
      }

      showSuccess('Küldetés sikeresen frissítve!');
      fetchChallenges();
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    if (!isSuperadmin) {
        showError('Nincs jogosultságod a küldetés állapotának módosításához.');
        return { success: false };
    }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('challenges')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) {
        showError(`Hiba a küldetés ${!currentStatus ? 'aktiválásakor' : 'deaktiválásakor'}.`);
        return { success: false };
      }

      showSuccess(`Küldetés sikeresen ${!currentStatus ? 'aktiválva' : 'deaktiválva'}!`);
      fetchChallenges();
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteChallenge = async (id: string) => {
    if (!isSuperadmin) {
        showError('Nincs jogosultságod a küldetés törléséhez.');
        return { success: false };
    }
    setIsLoading(true);
    try {
      // Note: Deleting a challenge will cascade delete associated user_challenges records.
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', id);

      if (error) {
        showError('Hiba történt a küldetés törlésekor.');
        return { success: false };
      }

      showSuccess('Küldetés sikeresen törölve!');
      fetchChallenges();
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    challenges,
    organizations,
    isLoading,
    fetchChallenges,
    createChallenge,
    updateChallenge,
    toggleActiveStatus,
    deleteChallenge,
  };
};