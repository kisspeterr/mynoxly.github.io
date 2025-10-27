import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth, OrganizationProfileData } from './use-auth';
import { OrganizationMember, Invitation, MemberRole } from '@/types/organization';

// Helper to fetch user profile by username
const fetchUserIdByUsername = async (username: string): Promise<string | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();
        
    if (error) {
        if (error.code === 'PGRST116') { // No rows found
            return null;
        }
        console.error('Error fetching user ID by username:', error);
        return null;
    }
    return data?.id || null;
};

// Helper to fetch user profiles (username, email, first_name, last_name) securely via RPC
const fetchUserProfilesByIds = async (userIds: string[]): Promise<Record<string, { username: string, first_name: string | null, last_name: string | null }>> => {
    if (userIds.length === 0) return {};
    
    const { data: usersData, error } = await supabase.rpc('get_user_profiles_by_ids', { user_ids: userIds });
    
    if (error) {
        console.error('Error fetching user profiles via RPC:', error);
        return {};
    }
    
    return (usersData || []).reduce((acc, user) => {
        acc[user.id] = {
            username: user.username,
            first_name: user.first_name || null,
            last_name: user.last_name || null,
        };
        return acc;
    }, {} as Record<string, { username: string, first_name: string | null, last_name: string | null }>);
};


export const useOrganizationMembers = () => {
  const { activeOrganizationId, activeOrganizationProfile, isAuthenticated, user, checkPermission } = useAuth();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const organizationId = activeOrganizationId;
  const organizationName = activeOrganizationProfile?.organization_name;

  // --- Admin Functions ---

  const fetchMembers = useCallback(async () => {
    // Only fetch if the user has permission to manage members AND an organization is active
    if (!isAuthenticated || !organizationId || !checkPermission('coupon_manager')) { 
      setMembers([]);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Fetch raw members data (WITHOUT JOINING PROFILE)
      const { data: rawMembers, error } = await supabase
        .from('organization_members')
        .select(`
          id, organization_id, user_id, status, roles, created_at
        `)
        .eq('organization_id', organizationId)
        .order('status', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        showError('Hiba történt a tagok betöltésekor.');
        console.error('Fetch members error:', error);
        setMembers([]);
        return;
      }
      
      if (!rawMembers) {
          setMembers([]);
          return;
      }
      
      // 2. Collect user IDs and fetch profiles securely
      const userIds = rawMembers.map(m => m.user_id);
      const profileMap = await fetchUserProfilesByIds(userIds);
      
      // 3. Combine data and filter out the owner
      const processedMembers: OrganizationMember[] = rawMembers
        .map(m => {
            const userProfile = profileMap[m.user_id];
            return {
                ...m,
                profile: userProfile ? {
                    username: userProfile.username,
                    first_name: userProfile.first_name,
                    last_name: userProfile.last_name,
                } : null,
            } as OrganizationMember;
        });
        
      setMembers(processedMembers);

    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, organizationId, checkPermission]);
  
  const inviteMember = async (username: string, roles: MemberRole[]) => {
    if (!organizationId || !organizationName || !checkPermission('coupon_manager')) { // Only managers can invite
        showError('Nincs jogosultságod tagok meghívásához.');
        return { success: false };
    }
    
    setIsLoading(true);
    try {
        const userId = await fetchUserIdByUsername(username);
        
        if (!userId) {
            showError(`A felhasználó (@${username}) nem található.`);
            return { success: false };
        }
        
        // Check if the user is the owner of this organization
        const { data: orgData } = await supabase.from('organizations').select('owner_id').eq('id', organizationId).single();
        if (orgData?.owner_id === userId) {
            showError('A felhasználó már a szervezet tulajdonosa.');
            return { success: false };
        }

        const { error } = await supabase
            .from('organization_members')
            .insert({
                organization_id: organizationId,
                user_id: userId,
                status: 'pending',
                roles: roles,
            });

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                showError(`A felhasználó (@${username}) már tagja vagy meghívottja a szervezetnek.`);
            } else {
                showError(`Hiba történt a meghíváskor: ${error.message}`);
                console.error('Invite member error:', error);
            }
            return { success: false };
        }

        showSuccess(`Meghívó elküldve @${username} felhasználónak!`);
        fetchMembers(); // Refresh list
        return { success: true };
        
    } finally {
        setIsLoading(false);
    }
  };
  
  const updateMemberRoles = async (memberId: string, roles: MemberRole[]) => {
    if (!organizationId || !checkPermission('coupon_manager')) { // Only managers can update roles
        showError('Nincs jogosultságod a jogosultságok frissítéséhez.');
        return { success: false };
    }
    setIsLoading(true);
    try {
        const { error } = await supabase
            .from('organization_members')
            .update({ roles: roles })
            .eq('id', memberId);

        if (error) {
            showError(`Hiba történt a jogosultságok frissítésekor: ${error.message}`);
            return { success: false };
        }

        showSuccess('Jogosultságok sikeresen frissítve!');
        fetchMembers(); // Refresh list
        return { success: true };
        
    } finally {
        setIsLoading(false);
    }
  };
  
  const removeMember = async (memberId: string) => {
    if (!organizationId || !checkPermission('coupon_manager')) { // Only managers can remove members
        showError('Nincs jogosultságod tagok eltávolításához.');
        return { success: false };
    }
    setIsLoading(true);
    try {
        const { error } = await supabase
            .from('organization_members')
            .delete()
            .eq('id', memberId);

        if (error) {
            showError(`Hiba történt a tag eltávolításakor: ${error.message}`);
            return { success: false };
        }

        showSuccess('Tag sikeresen eltávolítva!');
        fetchMembers(); // Refresh list
        return { success: true };
        
    } finally {
        setIsLoading(false);
    }
  };

  // --- User Functions (Invitations) ---
  
  const fetchInvitations = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setInvitations([]);
      return;
    }
    
    setIsLoading(true);
    try {
        // Fetch pending invitations for the current user, joining organization profile data
        const { data, error } = await supabase
            .from('organization_members')
            .select(`
                id, organization_id, user_id, status, roles, created_at,
                organization:organization_id (organization_name, logo_url)
            `)
            .eq('user_id', user.id)
            .eq('status', 'pending');

        if (error) {
            showError('Hiba történt a meghívások betöltésekor.');
            console.error('Fetch invitations error:', error);
            setInvitations([]);
            return;
        }
        
        setInvitations(data as Invitation[]);
        
    } finally {
        setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);
  
  const acceptInvitation = async (invitationId: string) => {
    setIsLoading(true);
    try {
        const { error } = await supabase
            .from('organization_members')
            .update({ status: 'accepted' })
            .eq('id', invitationId)
            .eq('user_id', user?.id); // Security check

        if (error) {
            showError(`Hiba történt a meghívás elfogadásakor: ${error.message}`);
            return { success: false };
        }

        showSuccess('Meghívás elfogadva! Most már tagja vagy a szervezetnek.');
        fetchInvitations(); // Refresh list
        return { success: true };
        
    } finally {
        setIsLoading(false);
    }
  };
  
  const rejectInvitation = async (invitationId: string) => {
    setIsLoading(true);
    try {
        const { error } = await supabase
            .from('organization_members')
            .delete()
            .eq('id', invitationId)
            .eq('user_id', user?.id); // Security check

        if (error) {
            showError(`Hiba történt a meghívás elutasításakor: ${error.message}`);
            return { success: false };
        }

        showSuccess('Meghívás elutasítva.');
        fetchInvitations(); // Refresh list
        return { success: true };
        
    } finally {
        setIsLoading(false);
    }
  };

  // --- Initialization and Realtime ---
  useEffect(() => {
    if (organizationId) {
        fetchMembers();
    }
    
    if (isAuthenticated) {
        fetchInvitations();
    }
    
    // Realtime subscription for admin view (members list)
    let adminChannel: ReturnType<typeof supabase.channel> | null = null;
    if (organizationId) {
        adminChannel = supabase
            .channel(`org_members_${organizationId}`)
            .on(
                'postgres_changes',
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'organization_members',
                    filter: `organization_id=eq.${organizationId}`
                },
                () => {
                    fetchMembers();
                }
            )
            .subscribe();
    }
    
    // Realtime subscription for user view (invitations)
    let userChannel: ReturnType<typeof supabase.channel> | null = null;
    if (isAuthenticated && user) {
        userChannel = supabase
            .channel(`user_invitations_${user.id}`)
            .on(
                'postgres_changes',
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'organization_members',
                    filter: `user_id=eq.${user.id}`
                },
                () => {
                    fetchInvitations();
                }
            )
            .subscribe();
    }

    return () => {
      if (adminChannel) supabase.removeChannel(adminChannel);
      if (userChannel) supabase.removeChannel(userChannel);
    };
  }, [organizationId, isAuthenticated, user?.id]); // Dependencies updated

  return {
    members,
    invitations,
    isLoading,
    fetchMembers,
    inviteMember,
    updateMemberRoles,
    removeMember,
    fetchInvitations,
    acceptInvitation,
    rejectInvitation,
  };
};