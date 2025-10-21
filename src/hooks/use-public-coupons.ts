import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Coupon } from '@/types/coupons';
import { showError } from '@/utils/toast';

export const usePublicCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      setIsLoading(true);
      try {
        // Fetch all coupons (RLS policy allows public read)
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          showError('Hiba történt a kuponok betöltésekor.');
          console.error('Fetch public coupons error:', error);
          setCoupons([]);
          return;
        }

        setCoupons(data as Coupon[]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  return {
    coupons,
    isLoading,
  };
};