import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from './use-auth';
import { Event } from '@/types/events';

export interface InterestedEventRecord {
  id: string; // interested_events ID
  event_id: string;
  
  // Joined event data
  event: Event & {
    logo_url: string | null; // Include logo for display
  };
}

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
      // Fetch interested events, joining the full event data and organization profile data
      const { data, error } = await supabase
        .from('interested_events')
        .select(`
          id,
          event_id,
          event:event_id (
            *,
            organization_profile:organization_name (logo_url)
          )
        `)
        .eq('user_id', user.id) // RLS ensures this is safe
        .order('created_at', { ascending: false });

      if (error) {
        showError('Hiba történt az érdeklődő események betöltésekor.');
        console.error('Fetch interested events error:', error);
        setInterestedEvents([]);
        return;
      }
      
      const processedEvents: InterestedEventRecord[] = (data as any[]).map(record => {
        const event = record.event;
        
        // Extract logo_url from the nested organization_profile array/object
        // Supabase returns an array if the join is on a non-primary key (organization_name)
        const logo_url = Array.isArray(event.organization_profile) && event.organization_profile.length > 0 
            ? event.organization_profile[0].logo_url 
            : null;
            
        // Remove the temporary organization_profile field before returning the final event structure
        const { organization_profile, ...restOfEvent } = event;
            
        return {
          id: record.id,
          event_id: record.event_id,
          event: {
            ...restOfEvent,
            logo_url: logo_url,
          }
        };
      }).filter(record => record.event !== null); // Filter out records where event join failed
      
      setInterestedEvents(processedEvents);

    } catch (e) {
        // Catch unexpected errors during processing (like accessing properties on null)
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