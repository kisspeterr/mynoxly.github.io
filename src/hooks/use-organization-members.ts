import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrganizationMember, MemberRole } from '@/types/organization';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from './use-auth';

// Helper to fetch user profile by username
const fetchUserIdByUsername = async (username: string): Promise<string | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();
        
    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user ID by username:', error);
        return null;
    }
    return data?.id || null;
};

export const useOrganizationMembers = () => {
  const { activeOrganizationProfile, isAuthenticated, checkPermission } = useAuth();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const organizationName = activeOrganizationProfile?.organization_name;
  const organizationId = activeOrganizationProfile?.id;
  
  // Only high-level admin/owner can manage members
  const canManageMembers = checkPermission('coupon_manager'); 

  const fetchMembers = useCallback(async () => {
    if (!isAuthenticated || !organizationId || !canManageMembers) {
      setMembers([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Fetch members for the active organization ID
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          profiles (username, first_name, last_name, avatar_url)
        `)
        .eq('organization_id', organizationId) // CRITICAL: Filter by active organization ID
        .order('created_at', { ascending: false });

      if (error) {
        showError('Hiba történt a tagok betöltésekor.');
        console.error('Fetch members error:', error);
        return;
      }

      // Map roles from JSONB array to a single string for display/filtering if needed
      const membersWithRoles = data.map(member => ({
          ...member,
          // Ensure roles is treated as MemberRole[]
          roles: member.roles as MemberRole[],
      })) as OrganizationMember[];
      
      setMembers(membersWithRoles);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, organizationId, canManageMembers]);

  useEffect(() => {
    if (organizationId) {
      fetchMembers();
    } else {
        setMembers([]);
        setIsLoading(false);
    }
    
    // --- Realtime Subscription ---
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    if (organizationId && canManageMembers) {
        channel = supabase
          .channel(`members_admin_feed_${organizationId}`)
          .on(
            'postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'organization_members',
              filter: `organization_id=eq.${organizationId}` // Filter by organization_id
            },
            (payload) => {
              // Refetch all data on any change
              fetchMembers();
            }
          )
          .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
    
  }, [organizationId, canManageMembers, fetchMembers]);

  // Function to invite a new member (using username)
  const inviteMember = async (username: string, roles: MemberRole[]) => {
    if (!organizationId || !canManageMembers) {
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
        
        // Check if already member/pending
        const existing = members.find(m => m.user_id === userId);
        if (existing) {
            showError(`A felhasználó (@${username}) már tagja vagy meghívottja a szervezetnek.`);
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
  
  // Function to update a member's roles (accepts array)
  const updateMemberRoles = async (memberId: string, roles: MemberRole[]) => {
    if (!organizationId || !canManageMembers) {
      showError('Nincs jogosultságod tagok szerepének módosításához.');
      return { success: false };
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .update({ roles: roles }) // Update roles array
        .eq('id', memberId)
        .eq('organization_id', organizationId) // Security filter
        .select()
        .single();

      if (error || !data) {
        showError(`Hiba a tag szerepének frissítésekor.`);
        console.error('Update member role error:', error);
        return { success: false };
      }

      // Update local state
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, roles: roles } : m));
      showSuccess('Tag szerepe sikeresen frissítve!');
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to remove a member
  const removeMember = async (memberId: string) => {
    if (!organizationId || !canManageMembers) {
      showError('Nincs jogosultságod tag eltávolításához.');
      return { success: false };
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId)
        .eq('organization_id', organizationId); // Security filter

      if (error) {
        showError('Hiba történt a tag eltávolításakor.');
        console.error('Remove member error:', error);
        return { success: false };
      }

      setMembers(prev => prev.filter(m => m.id !== memberId));
      showSuccess('Tag sikeresen eltávolítva!');
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    members,
    isLoading,
    fetchMembers,
    inviteMember,
    updateMemberRoles, // Renamed to plural
    removeMember,
    organizationName,
    canManageMembers,
  };
};