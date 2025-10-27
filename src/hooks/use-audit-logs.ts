import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { useAuth } from './use-auth';

export interface AuditLog {
  id: string;
  user_id: string;
  organization_name: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  payload: any;
  created_at: string;
  
  // Joined data
  user_profile: {
    username: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export type AuditFilter = {
    user_id?: string;
    organization_name?: string;
    action?: string;
};

// Helper to fetch user profiles (username, email, first_name, last_name) securely via RPC
const fetchUserProfilesByIds = async (userIds: string[]): Promise<Record<string, { username: string, first_name: string | null, last_name: string | null }>> => {
    if (userIds.length === 0) return {};
    
    // Use the existing RPC function
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


export const useAuditLogs = () => {
  const { isSuperadmin } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string, username: string }>>([]);
  const [availableOrganizations, setAvailableOrganizations] = useState<string[]>([]);

  const fetchLogs = useCallback(async (filters: AuditFilter = {}) => {
    if (!isSuperadmin) {
      setLogs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Fetch raw audit logs (without JOIN)
      let query = supabase
        .from('audit_logs')
        .select(`*`) // Select all columns from audit_logs only
        .order('created_at', { ascending: false })
        .limit(100); 

      // Apply filters
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.organization_name) {
        query = query.eq('organization_name', filters.organization_name);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }

      const { data: rawLogs, error } = await query;

      if (error) {
        showError('Hiba történt az audit logok betöltésekor.');
        console.error('Fetch audit logs error:', error);
        setLogs([]);
        return;
      }
      
      if (!rawLogs || rawLogs.length === 0) {
          setLogs([]);
          return;
      }
      
      // 2. Collect unique user IDs
      const userIds = Array.from(new Set(rawLogs.map(log => log.user_id).filter((id): id is string => id !== null)));
      
      // 3. Fetch user profiles securely
      const profileMap = await fetchUserProfilesByIds(userIds);
      
      // 4. Combine data
      const processedLogs: AuditLog[] = rawLogs.map(log => ({
          ...log,
          user_profile: log.user_id ? profileMap[log.user_id] || null : null,
      }));
      
      setLogs(processedLogs);
    } finally {
      setIsLoading(false);
    }
  }, [isSuperadmin]);
  
  // Fetch filter options (users and organizations)
  const fetchFilterOptions = useCallback(async () => {
      if (!isSuperadmin) return;
      
      // Fetch all users with usernames
      const { data: usersData } = await supabase.rpc('get_all_user_profiles_for_superadmin');
      if (usersData) {
          setAvailableUsers(usersData.map(u => ({ id: u.id, username: u.username })));
          
          const orgNames = Array.from(new Set(usersData
            .filter(u => u.organization_name)
            .map(u => u.organization_name as string)
          ));
          setAvailableOrganizations(orgNames);
      }
  }, [isSuperadmin]);

  useEffect(() => {
    fetchLogs({});
    fetchFilterOptions();
  }, [fetchLogs, fetchFilterOptions]);

  return {
    logs,
    isLoading,
    fetchLogs,
    availableUsers,
    availableOrganizations,
  };
};