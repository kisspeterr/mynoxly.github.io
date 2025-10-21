import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Coupon, CouponInsert } from '@/types/coupons';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from './use-auth';

export const useCoupons = () => {
  const { profile, isAuthenticated, isAdmin } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const organizationName = profile?.organization_name;

  const fetchCoupons = async () => {
    if (!isAuthenticated || !isAdmin || !organizationName) {
      setCoupons([]);
      return;
    }

    setIsLoading(true);
    try {
      // RLS ensures only coupons for the current organization are returned
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        showError('Hiba történt a kuponok betöltésekor.');
        console.error('Fetch coupons error:', error);
        return;
      }

      setCoupons(data as Coupon[]);
    } finally {
      setIsLoading(false);
    }
  };

  const createCoupon = async (couponData: CouponInsert) => {
    if (!organizationName) {
      showError('Hiányzik a szervezet neve a profilból.');
      return { success: false };
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .insert({ ...couponData, organization_name: organizationName })
        .select()
        .single();

      if (error) {
        showError(`Hiba a kupon létrehozásakor: ${error.message}`);
        console.error('Create coupon error:', error);
        return { success: false };
      }

      setCoupons(prev => [data as Coupon, ...prev]);
      showSuccess('Kupon sikeresen létrehozva!');
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateCoupon = async (id: string, couponData: Partial<CouponInsert>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .update(couponData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        showError(`Hiba a kupon frissítésekor: ${error.message}`);
        console.error('Update coupon error:', error);
        return { success: false };
      }

      setCoupons(prev => prev.map(c => c.id === id ? data as Coupon : c));
      showSuccess('Kupon sikeresen frissítve!');
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCoupon = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) {
        showError('Hiba történt a kupon törlésekor.');
        console.error('Delete coupon error:', error);
        return { success: false };
      }

      setCoupons(prev => prev.filter(c => c.id !== id));
      showSuccess('Kupon sikeresen törölve!');
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    coupons,
    isLoading,
    fetchCoupons,
    createCoupon,
    updateCoupon, // Export the new function
    deleteCoupon,
    organizationName,
  };
};