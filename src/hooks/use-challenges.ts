import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth, OrganizationProfileData } from './use-auth';
import { Challenge, UserChallenge, ConditionType } from '@/types/challenges';

// Extended Challenge type including user progress
export interface ActiveChallenge extends Challenge {
    user_progress: UserChallenge | null;
    progress_percentage: number;
    reward_organization_profile: OrganizationProfileData | null;
}

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

// Helper to calculate progress percentage
const calculateProgress = (progress: number, target: number): number => {
    if (target === 0) return 0;
    return Math.min(100, Math.floor((progress / target) * 100));
};


export const useChallenges = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeChallenges, setActiveChallenges] = useState<ActiveChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Core Fetching Logic ---
  const fetchChallengesAndProgress = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch all active challenges
      const { data: rawChallenges, error: challengeError } = await supabase
        .from('challenges')
        .select(`*`)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (challengeError) {
        console.error('Fetch active challenges error:', challengeError);
        setActiveChallenges([]);
        return;
      }
      
      const challenges = rawChallenges as Challenge[];
      if (challenges.length === 0) {
          setActiveChallenges([]);
          return;
      }
      
      // Collect all necessary organization IDs (for rewards)
      const rewardOrgIds = Array.from(new Set(
          challenges.map(c => c.reward_organization_id).filter((id): id is string => id !== null)
      ));
      const orgProfileMap = await fetchOrganizationProfiles(rewardOrgIds);

      let userProgressMap: Record<string, UserChallenge> = {};
      
      // 2. Fetch user progress if authenticated
      if (isAuthenticated && user) {
        const challengeIds = challenges.map(c => c.id);
        
        const { data: rawProgress, error: progressError } = await supabase
            .from('user_challenges')
            .select(`*`)
            .eq('user_id', user.id)
            .in('challenge_id', challengeIds);
            
        if (progressError) {
            console.error('Fetch user progress error:', progressError);
        } else {
            userProgressMap = (rawProgress as UserChallenge[]).reduce((acc, uc) => {
                acc[uc.challenge_id] = uc;
                return acc;
            }, {} as Record<string, UserChallenge>);
        }
      }
      
      // 3. Combine and calculate progress
      const processedChallenges: ActiveChallenge[] = challenges.map(challenge => {
          const progress = userProgressMap[challenge.id] || { progress_value: 0, is_completed: false, is_reward_claimed: false } as Partial<UserChallenge>;
          
          return {
              ...challenge,
              user_progress: progress as UserChallenge,
              progress_percentage: calculateProgress(progress.progress_value || 0, challenge.condition_value),
              reward_organization_profile: challenge.reward_organization_id ? orgProfileMap[challenge.reward_organization_id] || null : null,
          };
      });
      
      setActiveChallenges(processedChallenges);

    } catch (e) {
        console.error('Unexpected challenge processing error:', e);
        showError('Hiba történt a küldetések betöltésekor.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);
  
  // --- Reward Claiming Logic ---
  const claimReward = async (challengeId: string) => {
    if (!isAuthenticated || !user) {
        showError('Kérjük, jelentkezz be a jutalom igényléséhez.');
        return { success: false };
    }
    
    const challenge = activeChallenges.find(c => c.id === challengeId);
    if (!challenge || !challenge.user_progress?.is_completed || challenge.user_progress.is_reward_claimed) {
        showError('A jutalom nem igényelhető (még nincs teljesítve, vagy már igényelted).');
        return { success: false };
    }
    
    setIsLoading(true);
    try {
        // Call RPC function to handle reward claim (update loyalty points and mark challenge as claimed)
        const { data: success, error: rpcError } = await supabase.rpc('claim_challenge_reward', {
            challenge_id_in: challengeId,
            user_id_in: user.id,
        });
        
        if (rpcError) {
            showError(`Hiba történt a jutalom igénylésekor: ${rpcError.message}`);
            console.error('Claim reward RPC error:', rpcError);
            return { success: false };
        }
        
        showSuccess(`Sikeresen igényelted a jutalmat! (+${challenge.reward_points} pont)`);
        fetchChallengesAndProgress(); // Refresh state
        return { success: true };
        
    } catch (e) {
        console.error('Unexpected claim error:', e);
        showError('Váratlan hiba történt a jutalom igénylésekor.');
        return { success: false };
    } finally {
        setIsLoading(false);
    }
  };

  // --- Initialization and Realtime ---
  useEffect(() => {
    fetchChallengesAndProgress();
    
    // Setup Realtime subscription for user's own challenge progress
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    if (isAuthenticated && user) {
      channel = supabase
        .channel(`user_challenges_${user.id}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'user_challenges',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchChallengesAndProgress();
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchChallengesAndProgress, isAuthenticated, user?.id]);

  return {
    activeChallenges,
    isLoading,
    claimReward,
    fetchChallenges: fetchChallengesAndProgress,
  };
};