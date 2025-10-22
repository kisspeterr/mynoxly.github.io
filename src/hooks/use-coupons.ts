import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Coupon, CouponInsert } from '@/types/coupons';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from './use-auth';

export const useCoupons = () => {
  const { profile, isAuthenticated, isAdmin } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [archivedCoupons, setArchivedCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const organizationName = profile?.organization_name;

  // Function to fetch coupons (used internally and exported for manual refresh)
  const fetchCoupons = async () => {
    if (!isAuthenticated || !isAdmin || !organizationName) {
      setCoupons([]);
      setArchivedCoupons([]);
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

      const allCoupons = data as Coupon[];
      
      // Separate active/inactive from archived
      setCoupons(allCoupons.filter(c => !c.is_archived));
      setArchivedCoupons(allCoupons.filter(c => c.is_archived));

    } finally {
      setIsLoading(false);
    }
  };

  // Automatically fetch coupons when organizationName changes (i.e., when profile loads)
  useEffect(() => {
    if (organizationName) {
      fetchCoupons();
    }
  }, [organizationName]);


  const createCoupon = async (couponData: CouponInsert) => {
    if (!organizationName) {
      showError('Hiányzik a szervezet neve a profilból.');
      return { success: false };
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .insert({ ...couponData, organization_name: organizationName, is_active: true, is_archived: false })
        .select()
        .single();

      if (error) {
        showError(`Hiba a kupon létrehozásakor: ${error.message}`);
        return { success: false };
      }

      setCoupons(prev => [data as Coupon, ...prev]);
      showSuccess('Kupon sikeresen létrehozva!');
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateCoupon = async (id: string, couponData: Partial<CouponInsert & { is_active?: boolean, is_archived?: boolean }>) => {
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
        return { success: false };
      }

      // Re-fetch all data to ensure correct sorting and separation
      await fetchCoupons();
      showSuccess('Kupon sikeresen frissítve!');
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const archiveCoupon = async (id: string) => {
    const result = await updateCoupon(id, { is_archived: true, is_active: false });
    if (result.success) {
        showSuccess('Kupon sikeresen archiválva!');
    }
    return result;
  };
  
  const unarchiveCoupon = async (id: string) => {
    const result = await updateCoupon(id, { is_archived: false, is_active: true });
    if (result.success) {
        showSuccess('Kupon sikeresen visszaállítva!');
    }
    return result;
  };
  
  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    const result = await updateCoupon(id, { is_active: !currentStatus });
    if (result.success) {
        showSuccess(`Kupon sikeresen ${!currentStatus ? 'aktiválva' : 'deaktiválva'}!`);
    }
    return result;
  };

  const permanentDeleteCoupon = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) {
        showError('Hiba történt a kupon végleges törlésekor.');
        return { success: false };
      }

      setArchivedCoupons(prev => prev.filter(c => c.id !== id));
      showSuccess('Kupon véglegesen törölve!');
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    coupons,
    archivedCoupons,
    isLoading,
    fetchCoupons, // Keep exported for manual refresh if needed
    createCoupon,
    updateCoupon,
    archiveCoupon,
    unarchiveCoupon,
    toggleActiveStatus,
    permanentDeleteCoupon,
    organizationName,
  };
};