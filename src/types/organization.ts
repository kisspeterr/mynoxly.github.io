import { Profile } from '@/hooks/use-auth';

export type MemberRole = 'coupon_manager' | 'event_manager' | 'redemption_agent' | 'viewer';

export interface OrganizationMember {
    id: string;
    organization_id: string;
    user_id: string;
    status: 'pending' | 'accepted';
    roles: MemberRole[];
    created_at: string;
    
    // Joined data
    profile: {
        username: string;
        first_name: string | null;
        last_name: string | null;
    } | null;
}

export interface Invitation {
    id: string;
    organization_id: string;
    user_id: string;
    status: 'pending';
    roles: MemberRole[];
    created_at: string;
    
    // Joined organization data
    organization: {
        organization_name: string;
        logo_url: string | null;
    } | null;
}