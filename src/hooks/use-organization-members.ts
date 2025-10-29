import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrganizationMember, OrganizationMemberInsert, MemberRole } from '@/types/organization';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from './use-auth';

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
          profiles (username, first_name, last_name, avatar_url, email:auth_users(email))
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
          // Assuming roles is a JSONB array of strings, we might simplify it here
          role: (member.roles as MemberRole[])[0] || 'viewer', 
          email: member.profiles?.email?.[0]?.email || 'N/A',
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

  // Function to invite a new member (requires email and role)
  const inviteMember = async (email: string, role: MemberRole) => {
    if (!organizationId || !canManageMembers) {
      showError('Nincs jogosultságod tagok meghívásához.');
      return { success: false };
    }
    
    setIsLoading(true);
    try {
      // NOTE: This requires a server-side function or admin API call in a real app, 
      // but for simplicity, we insert a pending record here.
      // In a real scenario, we'd need to find the user_id by email first.
      
      // Step 1: Find user ID by email (requires admin privileges or a custom function)
      // Since we don't have a public function to look up user IDs by email, 
      // we must rely on the user accepting the invitation. 
      // For now, we assume the user exists and we can find their profile ID.
      
      // Since we cannot reliably get the user_id from email on the client side 
      // without exposing sensitive data or using a custom RPC, we will skip 
      // the actual invitation logic for now and focus on the core member management.
      
      showError('A tagok meghívása jelenleg nem támogatott a kliens oldalon. Kérjük, használd a Supabase Auth funkcióit.');
      return { success: false };
      
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to update a member's role
  const updateMemberRole = async (memberId: string, newRole: MemberRole) => {
    if (!organizationId || !canManageMembers) {
      showError('Nincs jogosultságod tagok szerepének módosításához.');
      return { success: false };
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .update({ roles: [newRole] }) // Update roles array
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
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, roles: [newRole], role: newRole } : m));
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
    updateMemberRole,
    removeMember,
    organizationName,
    canManageMembers,
  };
};