import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Coupon, CouponInsert } from '@/types/coupons';
import { useAuth } from './use-auth';
import { showError, showSuccess } from '@/utils/toast'; // Importáljuk a helyes toast segédfüggvényeket

// Típusdefiníciók a Supabase-ból
type DbCoupon = Coupon & {
    coupon_usages: { id: string }[];
};

interface CouponHookResult {
    coupons: Coupon[];
    isLoading: boolean;
    organizationName: string | null;
    hasPermission: boolean;
    fetchCoupons: () => Promise<void>;
    createCoupon: (data: CouponInsert) => Promise<{ success: boolean, newCouponId?: string }>;
    updateCoupon: (id: string, data: Partial<CouponInsert>) => Promise<{ success: boolean }>;
    toggleActiveStatus: (id: string, currentStatus: boolean) => Promise<{ success: boolean }>;
    archiveCoupon: (id: string) => Promise<{ success: boolean }>;
    unarchiveCoupon: (id: string) => Promise<{ success: boolean }>;
    deleteCoupon: (id: string, isArchived: boolean) => Promise<{ success: boolean }>;
}

export const useCoupons = (): CouponHookResult => {
    const { activeOrganizationProfile, checkPermission } = useAuth();
    const organizationName = activeOrganizationProfile?.organization_name || null;
    const hasPermission = checkPermission('coupon_manager') || checkPermission('viewer');
    
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const mapDbCouponsToCoupons = (dbCoupons: DbCoupon[]): Coupon[] => {
        return dbCoupons.map(c => ({
            ...c,
            // Ha szükséges, itt további adatátalakítás történhet
        }));
    };

    const fetchCoupons = useCallback(async () => {
        if (!organizationName || !hasPermission) {
            setCoupons([]);
            return;
        }

        setIsLoading(true);
        
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('organization_name', organizationName) // FONTOS: Szűrés az aktív szervezet nevére
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching coupons:', error);
            showError('Hiba történt a kuponok betöltésekor.');
        } else if (data) {
            setCoupons(mapDbCouponsToCoupons(data as DbCoupon[]));
        }
        setIsLoading(false);
    }, [organizationName, hasPermission]);

    useEffect(() => {
        // Fetch coupons whenever organizationName or permissions change
        fetchCoupons();
    }, [fetchCoupons]);

    // --- CRUD Operations ---

    const createCoupon = async (data: CouponInsert) => {
        if (!organizationName || !checkPermission('coupon_manager')) {
            showError('Nincs jogosultságod kupon létrehozásához.');
            return { success: false };
        }
        
        setIsLoading(true);
        
        const insertData: CouponInsert = {
            ...data,
            organization_name: organizationName,
            // is_active és is_archived alapértelmezett értékei a DB-ben vannak, de itt is beállíthatjuk, ha szükséges
        };

        const { data: newCoupon, error } = await supabase
            .from('coupons')
            .insert(insertData)
            .select()
            .single();

        setIsLoading(false);

        if (error) {
            console.error('Error creating coupon:', error);
            showError(`Hiba a kupon létrehozásakor: ${error.message}`);
            return { success: false };
        }

        if (newCoupon) {
            showSuccess('Kupon sikeresen létrehozva!');
            fetchCoupons(); // Refresh list
            return { success: true, newCouponId: newCoupon.id };
        }
        return { success: false };
    };

    const updateCoupon = async (id: string, data: Partial<CouponInsert>) => {
        if (!organizationName || !checkPermission('coupon_manager')) {
            showError('Nincs jogosultságod kupon szerkesztéséhez.');
            return { success: false };
        }
        
        setIsLoading(true);
        
        const { error } = await supabase
            .from('coupons')
            .update(data)
            .eq('id', id)
            .eq('organization_name', organizationName); // Extra biztonsági ellenőrzés

        setIsLoading(false);

        if (error) {
            console.error('Error updating coupon:', error);
            showError(`Hiba a kupon frissítésekor: ${error.message}`);
            return { success: false };
        }

        showSuccess('Kupon sikeresen frissítve!');
        fetchCoupons(); // Refresh list
        return { success: true };
    };
    
    const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
        if (!organizationName || !checkPermission('coupon_manager')) {
            showError('Nincs jogosultságod a kupon állapotának módosításához.');
            return { success: false };
        }
        
        setIsLoading(true);
        const newStatus = !currentStatus;
        
        const { error } = await supabase
            .from('coupons')
            .update({ is_active: newStatus })
            .eq('id', id)
            .eq('organization_name', organizationName);

        setIsLoading(false);

        if (error) {
            console.error('Error toggling coupon status:', error);
            showError(`Hiba az állapot váltásakor: ${error.message}`);
            return { success: false };
        }

        showSuccess(`Kupon sikeresen ${newStatus ? 'aktiválva' : 'inaktiválva'}!`);
        fetchCoupons();
        return { success: true };
    };

    const archiveCoupon = async (id: string) => {
        if (!organizationName || !checkPermission('coupon_manager')) {
            showError('Nincs jogosultságod a kupon archiválásához.');
            return { success: false };
        }
        
        setIsLoading(true);
        
        const { error } = await supabase
            .from('coupons')
            .update({ is_archived: true, is_active: false })
            .eq('id', id)
            .eq('organization_name', organizationName);

        setIsLoading(false);

        if (error) {
            console.error('Error archiving coupon:', error);
            showError(`Hiba az archiváláskor: ${error.message}`);
            return { success: false };
        }

        showSuccess('Kupon sikeresen archiválva!');
        fetchCoupons();
        return { success: true };
    };
    
    const unarchiveCoupon = async (id: string) => {
        if (!organizationName || !checkPermission('coupon_manager')) {
            showError('Nincs jogosultságod a kupon visszaállításához.');
            return { success: false };
        }
        
        setIsLoading(true);
        
        const { error } = await supabase
            .from('coupons')
            .update({ is_archived: false, is_active: false }) // Visszaállítás piszkozatként
            .eq('id', id)
            .eq('organization_name', organizationName);

        setIsLoading(false);

        if (error) {
            console.error('Error unarchiving coupon:', error);
            showError(`Hiba a visszaállításkor: ${error.message}`);
            return { success: false };
        }

        showSuccess('Kupon sikeresen visszaállítva a piszkozatok közé!');
        fetchCoupons();
        return { success: true };
    };

    const deleteCoupon = async (id: string, isArchived: boolean) => {
        if (!organizationName || !checkPermission('coupon_manager')) {
            showError('Nincs jogosultságod a kupon törléséhez.');
            return { success: false };
        }
        
        // Csak archivált kuponokat engedünk törölni a végleges törlés gombbal
        if (!isArchived) {
             showError('Csak archivált kuponokat lehet véglegesen törölni.');
             return { success: false };
        }
        
        setIsLoading(true);
        
        const { error } = await supabase
            .from('coupons')
            .delete()
            .eq('id', id)
            .eq('organization_name', organizationName);

        setIsLoading(false);

        if (error) {
            console.error('Error deleting coupon:', error);
            showError(`Hiba a törléskor: ${error.message}`);
            return { success: false };
        }

        showSuccess('Kupon véglegesen törölve!');
        fetchCoupons();
        return { success: true };
    };


    return {
        coupons,
        isLoading,
        organizationName,
        hasPermission,
        fetchCoupons,
        createCoupon,
        updateCoupon,
        toggleActiveStatus,
        archiveCoupon,
        unarchiveCoupon,
        deleteCoupon,
    };
};