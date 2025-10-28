import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/events';
import { showError } from '@/utils/toast';

// Extend Event type to include organization profile data
interface PublicEvent extends Event {
  logo_url: string | null; // Simplified: logo_url directly on event object
}

export const usePublicEvents = () => {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch all events (without join)
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select(`*, coupon:coupon_id (id, title, coupon_code)`)
          .order('start_time', { ascending: true });

        if (eventError) {
          showError('Hiba történt az események betöltésekor.');
          console.error('Fetch public events error:', eventError);
          setEvents([]);
          return;
        }
        
        const rawEvents = eventData as Event[];
        const organizationNames = Array.from(new Set(rawEvents.map(e => e.organization_name)));
        
        // 2. Fetch organization logos separately
        const logoMap = await fetchOrganizationLogos(organizationNames);
        
        const eventsWithLogos: PublicEvent[] = rawEvents.map(event => ({
          ...event,
          logo_url: logoMap[event.organization_name] || null,
        }));

        setEvents(eventsWithLogos);
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