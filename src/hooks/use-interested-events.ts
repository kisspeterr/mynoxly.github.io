import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';
import { Event } from '@/types/events';

export interface InterestedEventRecord {
  id: string; // interested_events ID
  event_id: string;
  
  // Joined event data
  event: Event & {
    logo_url: string | null; // Include logo for display
  };
}

// Helper to fetch organization logos
const fetchOrganizationLogos = async (organizationNames: string[]) => {
    if (organizationNames.length === 0) return {};
    
    const { data, error } = await supabase
      .from('profiles')
      .select('organization_name, logo_url')
      .in('organization_name', organizationNames);

    if (error) {
      console.error('Error fetching organization logos:', error);
      return {};
    }

    return data.reduce((acc, profile) => {
      if (profile.organization_name) {
        acc[profile.organization_name] = profile.logo_url;
      }
      return acc;
    }, {} as Record<string, string | null>);
};


export const useInterestedEvents = () => {
  const { user, isAuthenticated } = useAuth();
  const [interestedEvents, setInterestedEvents] = useState<InterestedEventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInterestedEvents = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setInterestedEvents([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Fetch interested event IDs
      const { data: interestedData, error: interestedError } = await supabase
        .from('interested_events')
        .select(`id, event_id`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (interestedError) {
        showError('Hiba történt az érdeklődő események betöltésekor.');
        console.error('Fetch interested events error:', interestedError);
        setInterestedEvents([]);
        return;
      }
      
      const eventIds = interestedData.map(r => r.event_id);
      if (eventIds.length === 0) {
          setInterestedEvents([]);
          return;
      }
      
      // 2. Fetch Event details and Coupon details
      const { data: eventDetails, error: eventError } = await supabase
        .from('events')
        .select(`
            *,
            coupon:coupon_id (id, title, coupon_code)
        `)
        .in('id', eventIds);
        
      if (eventError) {
          showError('Hiba történt az esemény részletek betöltésekor.');
          console.error('Fetch event details error:', eventError);
          return;
      }
      
      const rawEvents = eventDetails as Event[];
      const organizationNames = Array.from(new Set(rawEvents.map(e => e.organization_name)));
      
      // 3. Fetch organization logos separately
      const logoMap = await fetchOrganizationLogos(organizationNames);
      
      // 4. Combine data
      const processedEvents: InterestedEventRecord[] = interestedData.map(record => {
        const event = rawEvents.find(e => e.id === record.event_id);
        
        if (!event) return null;
        
        return {
          id: record.id,
          event_id: record.event_id,
          event: {
            ...event,
            logo_url: logoMap[event.organization_name] || null,
          }
        };
      }).filter((record): record is InterestedEventRecord => record !== null);
      
      setInterestedEvents(processedEvents);

    } catch (e) {
        showError('Váratlan hiba történt az érdeklődő események feldolgozásakor.');
        console.error('Processing error:', e);
        setInterestedEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    fetchInterestedEvents();
    
    // Setup Realtime subscription for changes in user's interested events
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    if (isAuthenticated && user) {
      channel = supabase
        .channel(`user_interested_events_${user.id}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'interested_events',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchInterestedEvents();
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchInterestedEvents, isAuthenticated, user?.id]);

  const isInterested = (eventId: string): boolean => {
    return interestedEvents.some(record => record.event_id === eventId);
  };

  const toggleInterest = async (eventId: string, eventTitle: string) => {
    if (!isAuthenticated || !user) {
      showError('Kérjük, jelentkezz be az érdeklődés jelöléséhez.');
      return;
    }

    const isCurrentlyInterested = isInterested(eventId);
    
    if (isCurrentlyInterested) {
      // Remove interest
      const { error } = await supabase
        .from('interested_events')
        .delete()
        .eq('user_id', user.id)
        .eq('event_id', eventId);

      if (error) {
        showError('Hiba történt az érdeklődés eltávolításakor.');
        console.error('Remove interest error:', error);
        return;
      }
      showSuccess(`Érdeklődés eltávolítva: ${eventTitle}.`);
    } else {
      // Add interest
      const { error } = await supabase
        .from('interested_events')
        .insert({ user_id: user.id, event_id: eventId });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
             showError('Már érdeklődsz ez iránt az esemény iránt.');
        } else {
             showError('Hiba történt az érdeklődés hozzáadásakor.');
             console.error('Add interest error:', error);
        }
        return;
      }
      showSuccess(`Érdeklődés hozzáadva: ${eventTitle}!`);
    }
    
    // Realtime should handle the state update, but we trigger a fetch for immediate feedback
    fetchInterestedEvents();
  };

  return {
    interestedEvents,
    isLoading,
    isInterested,
    toggleInterest,
    fetchInterestedEvents,
  };
};