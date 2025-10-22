import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from './use-auth';

export interface EmailTemplate {
  id: string;
  organization_name: string;
  template_name: string;
  subject: string;
  body: string;
  created_at: string;
}

export interface EmailTemplateInsert {
  template_name: string;
  subject: string;
  body: string;
}

export const useEmailTemplates = () => {
  const { profile, isAuthenticated, isAdmin } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const organizationName = profile?.organization_name;

  const fetchTemplates = useCallback(async () => {
    if (!isAuthenticated || !isAdmin || !organizationName) {
      setTemplates([]);
      return;
    }

    setIsLoading(true);
    try {
      // RLS ensures only templates for the current organization are returned
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('template_name', { ascending: true });

      if (error) {
        showError('Hiba történt az email sablonok betöltésekor.');
        console.error('Fetch templates error:', error);
        return;
      }

      setTemplates(data as EmailTemplate[]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAdmin, organizationName]);

  useEffect(() => {
    if (organizationName) {
      fetchTemplates();
    }
  }, [organizationName, fetchTemplates]);

  const createTemplate = async (templateData: EmailTemplateInsert) => {
    if (!organizationName) {
      showError('Hiányzik a szervezet neve a profilból.');
      return { success: false };
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert({ ...templateData, organization_name: organizationName })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
            showError('Már létezik sablon ezzel a névvel.');
        } else {
            showError(`Hiba a sablon létrehozásakor: ${error.message}`);
        }
        console.error('Create template error:', error);
        return { success: false };
      }

      setTemplates(prev => [...prev, data as EmailTemplate]);
      showSuccess('Email sablon sikeresen létrehozva!');
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateTemplate = async (id: string, templateData: Partial<EmailTemplateInsert>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .update(templateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
            showError('Már létezik sablon ezzel a névvel.');
        } else {
            showError(`Hiba a sablon frissítésekor: ${error.message}`);
        }
        console.error('Update template error:', error);
        return { success: false };
      }

      setTemplates(prev => prev.map(t => t.id === id ? data as EmailTemplate : t));
      showSuccess('Email sablon sikeresen frissítve!');
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) {
        showError('Hiba történt a sablon törlésekor.');
        console.error('Delete template error:', error);
        return { success: false };
      }

      setTemplates(prev => prev.filter(t => t.id !== id));
      showSuccess('Email sablon sikeresen törölve!');
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    templates,
    isLoading,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
};