import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Event, EventInsert } from '@/types/events';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from './use-auth';

export const useEvents = () => {
  const { activeOrganizationProfile, activeOrganizationId, isAuthenticated, checkPermission } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const organizationName = activeOrganizationProfile?.organization_name;
  
  // Determine if the user has ANY permission to view events
  const hasPermission = checkPermission('event_manager') || checkPermission('viewer');

  const fetchEvents = async () => {
    if (!isAuthenticated || !organizationName || !hasPermission) {
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

  // Automatically fetch events when activeOrganizationId changes
  useEffect(() => {
    if (activeOrganizationId) {
      fetchEvents();
    } else {
        setEvents([]);
        setIsLoading(false);
    }
  }, [activeOrganizationId, isAuthenticated, hasPermission]); // Watch the ID instead of the object

  const createEvent = async (eventData: EventInsert) => {
    if (!organizationName || !checkPermission('event_manager')) {
      showError('Nincs jogosultságod esemény létrehozásához, vagy hiányzik a szervezet neve.');
      return { success: false, newEventId: undefined };
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({ 
            ...eventData, 
            organization_name: organizationName,
            is_active: false, // Default to inactive (draft)
            is_archived: false,
        })
        .select(`
          *,
          coupon:coupon_id (id, title, coupon_code)
        `)
        .single();

      if (error) {
        showError(`Hiba az esemény létrehozásakor: ${error.message}`);
        console.error('Create event error:', error);
        return { success: false, newEventId: undefined };
      }

      const newEvent = data as Event;
      setEvents(prev => [...prev, newEvent]);
      showSuccess('Esemény sikeresen létrehozva! Kérjük, publikáld a megjelenítéshez.');
      return { success: true, newEventId: newEvent.id };
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateEvent = async (id: string, eventData: Partial<EventInsert>) => {
    if (!organizationName || !checkPermission('event_manager')) {
        showError('Nincs jogosultságod esemény frissítéséhez.');
        return { success: false };
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id)
        .eq('organization_name', organizationName) // Security filter
        .select(`
          *,
          coupon:coupon_id (id, title, coupon_code)
        `)
        .single();

      if (error || !data) {
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
  
  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    if (!organizationName || !checkPermission('event_manager')) {
        showError('Nincs jogosultságod az esemény állapotának módosításához.');
        return { success: false };
    }
    
    const newStatus = !currentStatus;
    
    // CRITICAL CHECK: Prevent publishing if image_url is missing
    if (newStatus === true) {
        const eventToPublish = events.find(e => e.id === id);
        if (!eventToPublish || !eventToPublish.image_url) {
            showError('Az esemény publikálásához kötelező feltölteni egy bannert!');
            return { success: false };
        }
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .update({ is_active: newStatus })
        .eq('id', id)
        .eq('organization_name', organizationName)
        .select(`*, coupon:coupon_id (id, title, coupon_code)`)
        .single();

      if (error || !data) {
        showError(`Hiba az esemény ${newStatus ? 'publikálásakor' : 'inaktiválásakor'}.`);
        console.error('Toggle active status error:', error);
        return { success: false };
      }

      setEvents(prev => prev.map(e => e.id === id ? data as Event : e));
      showSuccess(`Esemény sikeresen ${newStatus ? 'publikálva' : 'inaktiválva'}!`);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };
  
  const archiveEvent = async (id: string) => {
    if (!organizationName || !checkPermission('event_manager')) {
        showError('Nincs jogosultságod az esemény archiválásához.');
        return { success: false };
    }
    setIsLoading(true);
    try {
      // Archiving automatically sets is_active to false
      const { data, error } = await supabase
        .from('events')
        .update({ is_archived: true, is_active: false })
        .eq('id', id)
        .eq('organization_name', organizationName)
        .select(`*, coupon:coupon_id (id, title, coupon_code)`)
        .single();

      if (error || !data) {
        showError('Hiba történt az esemény archiválásakor.');
        console.error('Archive event error:', error);
        return { success: false };
      }

      setEvents(prev => prev.map(e => e.id === id ? data as Event : e));
      showSuccess('Esemény sikeresen archiválva!');
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };
  
  const unarchiveEvent = async (id: string) => {
    if (!organizationName || !checkPermission('event_manager')) {
        showError('Nincs jogosultságod az esemény visszaállításához.');
        return { success: false };
    }
    setIsLoading(true);
    try {
      // Unarchiving sets is_archived to false, but keeps is_active as false (draft state)
      const { data, error } = await supabase
        .from('events')
        .update({ is_archived: false, is_active: false })
        .eq('id', id)
        .eq('organization_name', organizationName)
        .select(`*, coupon:coupon_id (id, title, coupon_code)`)
        .single();

      if (error || !data) {
        showError('Hiba történt az esemény visszaállításakor.');
        console.error('Unarchive event error:', error);
        return { success: false };
      }

      setEvents(prev => prev.map(e => e.id === id ? data as Event : e));
      showSuccess('Esemény sikeresen visszaállítva a piszkozatok közé!');
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (id: string, isArchived: boolean) => {
    if (!isArchived) {
      showError('Csak archivált eseményeket lehet véglegesen törölni.');
      return { success: false };
    }
    if (!organizationName || !checkPermission('event_manager')) {
        showError('Nincs jogosultságod esemény törléséhez.');
        return { success: false };
    }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .eq('organization_name', organizationName); // Security filter

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
    toggleActiveStatus,
    archiveEvent,
    unarchiveEvent,
    deleteEvent,
    organizationName,
    hasPermission, // NEW
  };
};