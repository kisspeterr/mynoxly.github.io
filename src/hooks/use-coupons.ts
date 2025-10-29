import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Coupon, CouponInsert } from '@/types/coupons';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from './use-auth';

export const useCoupons = () => {
  const { activeOrganizationProfile, activeOrganizationId, isAuthenticated, checkPermission } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const organizationName = activeOrganizationProfile?.organization_name;
  
  // Determine if the user has ANY permission to view coupons
  const hasPermission = checkPermission('coupon_manager') || checkPermission('viewer');

  // Function to fetch coupons (used internally and exported for manual refresh)
  const fetchCoupons = useCallback(async () => {
    if (!isAuthenticated || !organizationName || !hasPermission) {
      setCoupons([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // CRITICAL: Explicitly filter by organization_name. 
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('organization_name', organizationName) // <-- EXPLICIT FILTER
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
  }, [isAuthenticated, organizationName, hasPermission]); // Dependencies for useCallback

  // Automatically fetch coupons when activeOrganizationId changes
  useEffect(() => {
    if (activeOrganizationId) {
      fetchCoupons();
    } else {
        setCoupons([]);
        setIsLoading(false);
    }
  }, [activeOrganizationId, isAuthenticated, hasPermission, fetchCoupons]); // Added fetchCoupons to dependencies

  const createCoupon = async (couponData: CouponInsert): Promise<{ success: boolean, newCouponId?: string }> => {
    if (!organizationName || !checkPermission('coupon_manager')) {
      showError('Nincs jogosultságod kupon létrehozásához, vagy hiányzik a szervezet neve.');
      return { success: false };
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        // Ensure new coupons are INACTIVE and not archived by default
        .insert({ ...couponData, organization_name: organizationName, is_active: false, is_archived: false })
        .select()
        .single();

      if (error) {
        showError(`Hiba a kupon létrehozásakor: ${error.message}`);
        return { success: false };
      }

      const newCoupon = data as Coupon;
      setCoupons(prev => [newCoupon, ...prev]);
      showSuccess('Kupon sikeresen létrehozva! Kérjük, publikáld a megjelenítéshez.');
      return { success: true, newCouponId: newCoupon.id };
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateCoupon = async (id: string, couponData: Partial<CouponInsert>): Promise<{ success: boolean, newCouponId?: string }> => {
    if (!organizationName || !checkPermission('coupon_manager')) {
        showError('Nincs jogosultságod kupon frissítéséhez.');
        return { success: false };
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .update(couponData)
        .eq('id', id)
        .eq('organization_name', organizationName) // <-- ADDED SECURITY FILTER
        .select()
        .single();

      if (error || !data) {
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
    if (!organizationName || !checkPermission('coupon_manager')) {
        showError('Nincs jogosultságod a kupon állapotának módosításához.');
        return { success: false };
    }
    
    const newStatus = !currentStatus;
    
    // CRITICAL CHECK: Prevent publishing if image_url is missing
    if (newStatus === true) {
        const couponToPublish = coupons.find(c => c.id === id);
        if (!couponToPublish || !couponToPublish.image_url) {
            showError('A kupon publikálásához kötelező feltölteni egy bannert!');
            return { success: false };
        }
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .update({ is_active: newStatus })
        .eq('id', id)
        .eq('organization_name', organizationName) // <-- ADDED SECURITY FILTER
        .select()
        .single();

      if (error || !data) {
        showError(`Hiba a kupon ${newStatus ? 'aktiválásakor' : 'deaktiválásakor'}. Ellenőrizd a jogosultságokat.`);
        console.error('Toggle active status error:', error);
        return { success: false };
      }

      setCoupons(prev => prev.map(c => c.id === id ? data as Coupon : c));
      showSuccess(`Kupon sikeresen ${newStatus ? 'publikálva' : 'inaktiválva'}!`);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };
  
  const archiveCoupon = async (id: string) => {
    if (!organizationName || !checkPermission('coupon_manager')) {
        showError('Nincs jogosultságod a kupon archiválásához.');
        return { success: false };
    }
    setIsLoading(true);
    try {
      // Archiving automatically sets is_active to false
      const { data, error } = await supabase
        .from('coupons')
        .update({ is_archived: true, is_active: false })
        .eq('id', id)
        .eq('organization_name', organizationName) // <-- ADDED SECURITY FILTER
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
  
  // NEW: Function to unarchive a coupon
  const unarchiveCoupon = async (id: string) => {
    if (!organizationName || !checkPermission('coupon_manager')) {
        showError('Nincs jogosultságod a kupon visszaállításához.');
        return { success: false };
    }
    setIsLoading(true);
    try {
      // Unarchiving sets is_archived to false, but keeps is_active as false (draft state)
      const { data, error } = await supabase
        .from('coupons')
        .update({ is_archived: false, is_active: false })
        .eq('id', id)
        .eq('organization_name', organizationName)
        .select()
        .single();

      if (error || !data) {
        showError('Hiba történt a kupon visszaállításakor.');
        console.error('Unarchive coupon error:', error);
        return { success: false };
      }

      setCoupons(prev => prev.map(c => c.id === id ? data as Coupon : c));
      showSuccess('Kupon sikeresen visszaállítva a piszkozatok közé!');
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
    if (!organizationName || !checkPermission('coupon_manager')) {
        showError('Nincs jogosultságod a kupon törléséhez.');
        return { success: false };
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id)
        .eq('organization_name', organizationName); // <-- ADDED SECURITY FILTER

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
    fetchCoupons,
    createCoupon,
    updateCoupon,
    toggleActiveStatus,
    archiveCoupon,
    unarchiveCoupon, // NEW
    deleteCoupon,
    organizationName,
    hasPermission, // NEW
  };
};