import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

export interface WaitlistSubscriber {
  email: string;
  name?: string;
}

export const useWaitlist = () => {
  const [isLoading, setIsLoading] = useState(false);

  const subscribeToWaitlist = async (subscriber: WaitlistSubscriber) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('waitlist_subscribers')
        .insert([subscriber])
        .select();

      if (error) {
        if (error.code === '23505') {
          showError('Ez az email cím már fel van iratkozva!');
        } else {
          showError('Hiba történt a feliratkozás során. Kérjük, próbáld újra.');
        }
        console.error('Supabase error:', error);
        return { success: false, error };
      }

      showSuccess('Sikeresen feliratkoztál a várólistára!');
      return { success: true, data };
    } catch (error) {
      console.error('Waitlist subscription error:', error);
      showError('Váratlan hiba történt. Kérjük, próbáld újra.');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscribeToWaitlist,
    isLoading
  };
};