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
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user_profile:user_id (username, first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100); // Limit to 100 recent logs for performance

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

      const { data, error } = await query;

      if (error) {
        showError('Hiba történt az audit logok betöltésekor.');
        console.error('Fetch audit logs error:', error);
        setLogs([]);
        return;
      }
      
      setLogs(data as AuditLog[]);
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