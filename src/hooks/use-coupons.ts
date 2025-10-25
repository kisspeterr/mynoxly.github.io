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
    if (!isAuthenticated || !isAdmin) {
      setCoupons([]);
      return;
    }
    
    if (!organizationName) {
        // Ha nincs szervezet név, nem tudunk lekérdezni, de nem hiba, csak üres lista.
        setCoupons([]);
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    try {
      // CRITICAL: Explicitly filter by organization_name. 
      // RLS ensures the user can only see their own organization's data anyway, 
      // but this client-side filter guarantees we only request and display the relevant subset.
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('organization_name', organizationName) // <-- NEW EXPLICIT FILTER
        .order('created_at', { ascending: false });

      if (error) {
        showError('Hiba történt a kuponok betöltésekor. Ellenőrizd a szervezet nevét a profilban.');
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
  }, [organizationName, isAuthenticated, isAdmin]);


  const createCoupon = async (couponData: CouponInsert) => {
    if (!organizationName) {
      showError('Hiányzik a szervezet neve a profilból. Kérjük, állítsd be a Beállítások oldalon.');
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
    if (!organizationName) {
        showError('Hiányzik a szervezet neve a profilból.');
        return { success: false };
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .update(couponData)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        // Ha az RLS blokkolja, a data null lehet, vagy hiba jön vissza.
        showError(`Hiba a kupon frissítésekor. Lehet, hogy nincs jogosultságod ehhez a kuponhoz, vagy a szervezet neve hiányzik.`);
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
    if (!organizationName) {
        showError('Hiányzik a szervezet neve a profilból.');
        return { success: false };
    }
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
    if (!organizationName) {
        showError('Hiányzik a szervezet neve a profilból.');
        return { success: false };
    }
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
    if (!organizationName) {
        showError('Hiányzik a szervezet neve a profilból.');
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