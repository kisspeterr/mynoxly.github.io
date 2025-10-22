import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/events';
import { showError } from '@/utils/toast';

// Extend Event type to include organization profile data
interface PublicEvent extends Event {
  organization_profile: {
    logo_url: string | null;
  } | null;
}

export const usePublicEvents = () => {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // Fetch all events and join linked coupon data and organization profile data
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            coupon:coupon_id (id, title, coupon_code),
            organization_profile:organization_name (logo_url)
          `)
          .order('start_time', { ascending: true });

        if (error) {
          showError('Hiba történt az események betöltésekor.');
          console.error('Fetch public events error:', error);
          setEvents([]);
          return;
        }

        setEvents(data as PublicEvent[]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return {
    events,
    isLoading,
  };
};