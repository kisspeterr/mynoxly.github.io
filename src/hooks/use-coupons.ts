import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Coupon, CouponInsert } from '@/types/coupons';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from './use-auth';

export const useCoupons = () => {
  const { profile, isAuthenticated, isAdmin } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const organizationName = profile?.organization_name;

  // Function to fetch coupons (used internally and exported for manual refresh)
  const fetchCoupons = async () => {
    if (!isAuthenticated || !isAdmin || !organizationName) {
      setCoupons([]);
      return;
    }

    setIsLoading(true);
    try {
      // RLS ensures only coupons for the current organization are returned
      // Admins see all coupons regardless of active/archived status
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
        // Ensure new coupons are active and not archived by default
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
        // RLS hiba esetén a Supabase gyakran "null" adatot ad vissza, de a hibaobjektumot is ellenőrizzük.
        showError(`Hiba a kupon frissítésekor. Lehet, hogy nincs jogosultságod ehhez a kuponhoz.`);
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
  
  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    setIsLoading(true);
    try {
      const newStatus = !currentStatus;
      const { data, error } = await supabase
        .from('coupons')
        .update({ is_active: newStatus })
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        showError(`Hiba a kupon ${newStatus ? 'aktiválásakor' : 'deaktiválásakor'}. Ellenőrizd a jogosultságokat.`);
        console.error('Toggle active status error:', error);
        return { success: false };
      }

      setCoupons(prev => prev.map(c => c.id === id ? data as Coupon : c));
      showSuccess(`Kupon sikeresen ${newStatus ? 'aktiválva' : 'deaktiválva'}!`);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };
  
  const archiveCoupon = async (id: string) => {
    setIsLoading(true);
    try {
      // Archiving automatically sets is_active to false
      const { data, error } = await supabase
        .from('coupons')
        .update({ is_archived: true, is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        showError('Hiba történt a kupon archiválásakor. Ellenőrizd a jogosultságokat.');
        console.error('Archive coupon error:', error);
        return { success: false };
      }

      setCoupons(prev => prev.map(c => c.id === id ? data as Coupon : c));
      showSuccess('Kupon sikeresen archiválva!');
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCoupon = async (id: string, isArchived: boolean) => {
    if (!isArchived) {
      showError('Csak archivált kuponokat lehet véglegesen törölni.');
      return { success: false };
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) {
        showError('Hiba történt a kupon törlésekor. Ellenőrizd a jogosultságokat.');
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
    fetchCoupons, // Keep exported for manual refresh if needed
    createCoupon,
    updateCoupon,
    toggleActiveStatus, // New action
    archiveCoupon,      // New action
    deleteCoupon,       // Modified action
    organizationName,
  };
};