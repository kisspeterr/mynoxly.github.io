import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/events';
import { showError } from '@/utils/toast';

export const usePublicEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // Fetch all events and join linked coupon data (RLS policy allows public read)
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            coupon:coupon_id (id, title, coupon_code)
          `)
          .order('start_time', { ascending: true });

        if (error) {
          showError('Hiba történt az események betöltésekor.');
          console.error('Fetch public events error:', error);
          setEvents([]);
          return;
        }

        setEvents(data as Event[]);
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