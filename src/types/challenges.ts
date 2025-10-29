import { OrganizationProfileData } from '@/hooks/use-auth';

export type ConditionType = 'REDEEM_COUNT' | 'TOTAL_POINTS' | 'DIFFERENT_ORGANIZATIONS';

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  reward_points: number;
  reward_organization_id: string | null;
  condition_type: ConditionType;
  condition_value: number;
  condition_organizations: string[]; // Array of organization UUIDs
  created_at: string;
  
  -- Joined data
  reward_organization_profile?: OrganizationProfileData | null;
}

export interface ChallengeInsert {
  title: string;
  description: string | null;
  reward_points: number;
  reward_organization_id: string | null;
  condition_type: ConditionType;
  condition_value: number;
  condition_organizations: string[];
  is_active: boolean;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  is_completed: boolean;
  completed_at: string | null;
  progress_value: number;
  is_reward_claimed: boolean;
}