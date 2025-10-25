import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Event, EventInsert } from '@/types/events';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from './use-auth';

export const useEvents = () => {
  const { profile, isAuthenticated, isAdmin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const organizationName = profile?.organization_name;

  const fetchEvents = async () => {
    if (!isAuthenticated || !isAdmin || !organizationName) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch events and optionally join the linked coupon data
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          coupon:coupon_id (id, title, coupon_code)
        `)
        .eq('organization_name', organizationName) // <-- EXPLICIT FILTER
        .order('start_time', { ascending: true });

      if (error) {
        showError('Hiba történt az események betöltésekor.');
        console.error('Fetch events error:', error);
        return;
      }

      setEvents(data as Event[]);
    } finally {
      setIsLoading(false);
    }
  };

  const createEvent = async (eventData: EventInsert) => {
    if (!organizationName) {
      showError('Hiányzik a szervezet neve a profilból.');
      return { success: false };
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({ ...eventData, organization_name: organizationName })
        .select(`
          *,
          coupon:coupon_id (id, title, coupon_code)
        `)
        .single();

      if (error) {
        showError(`Hiba az esemény létrehozásakor: ${error.message}`);
        console.error('Create event error:', error);
        return { success: false };
      }

      setEvents(prev => [...prev, data as Event]);
      showSuccess('Esemény sikeresen létrehozva!');
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateEvent = async (id: string, eventData: Partial<EventInsert>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id)
        .select(`
          *,
          coupon:coupon_id (id, title, coupon_code)
        `)
        .single();

      if (error) {
        showError(`Hiba az esemény frissítésekor: ${error.message}`);
        console.error('Update event error:', error);
        return { success: false };
      }

      setEvents(prev => prev.map(e => e.id === id ? data as Event : e));
      showSuccess('Esemény sikeresen frissítve!');
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        showError('Hiba történt az esemény törlésekor.');
        console.error('Delete event error:', error);
        return { success: false };
      }

      setEvents(prev => prev.filter(e => e.id !== id));
      showSuccess('Esemény sikeresen törölve!');
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    events,
    isLoading,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    organizationName,
  };
};