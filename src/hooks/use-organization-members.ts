import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from './use-auth';
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

export const useOrganizationMembers = () => {
  const { profile, isAuthenticated, isAdmin, user } = useAuth();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const organizationId = profile?.id;
  const organizationName = profile?.organization_name;

  // --- Admin Functions ---

  const fetchMembers = useCallback(async () => {
    if (!isAuthenticated || !isAdmin || !organizationId) {
      setMembers([]);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch members for the current organization, joining user profile data
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          profile:user_id (username, first_name, last_name)
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
      
      // Filter out the owner (the current admin user) from the list
      const filteredMembers = (data as OrganizationMember[]).filter(m => m.user_id !== user?.id);
      setMembers(filteredMembers);

    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAdmin, organizationId, user?.id]);
  
  const inviteMember = async (username: string, roles: MemberRole[]) => {
    if (!organizationId || !organizationName) {
        showError('Hiányzik a szervezet azonosítója.');
        return { success: false };
    }
    
    setIsLoading(true);
    try {
        const userId = await fetchUserIdByUsername(username);
        
        if (!userId) {
            showError(`A felhasználó (@${username}) nem található.`);
            return { success: false };
        }
        
        if (userId === user?.id) {
            showError('Nem hívhatod meg saját magadat.');
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
    if (isAdmin && organizationId) {
        fetchMembers();
    } else if (isAuthenticated) {
        fetchInvitations();
    }
    
    // Realtime subscription for admin view (members list)
    let adminChannel: ReturnType<typeof supabase.channel> | null = null;
    if (isAdmin && organizationId) {
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
  }, [isAdmin, organizationId, isAuthenticated, user?.id]); // Dependencies updated

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