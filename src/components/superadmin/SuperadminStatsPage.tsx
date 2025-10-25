import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, Building, Tag, RefreshCw, BarChart } from 'lucide-react';
import { showError } from '@/utils/toast';
import { Button } from '@/components/ui/button';

interface GlobalStats {
    totalUsers: number;
    totalOrganizations: number;
    totalCoupons: number;
}

const SuperadminStatsPage: React.FC = () => {
    const { isSuperadmin } = useAuth();
    const [stats, setStats] = useState<GlobalStats>({ totalUsers: 0, totalOrganizations: 0, totalCoupons: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const fetchGlobalStats = useCallback(async () => {
        if (!isSuperadmin) return;

        setIsLoading(true);
        try {
            // 1. Total Users (using RPC)
            const { data: userCount, error: userError } = await supabase.rpc('get_total_user_count');
            
            if (userError) {
                console.error('Error fetching total user count:', userError);
                showError('Hiba történt a felhasználói szám betöltésekor.');
            }

            // 2. Total Organizations (profiles with organization_name set)
            const { count: orgCount, error: orgError } = await supabase
                .from('profiles')
                .select('id', { count: 'exact', head: true })
                .not('organization_name', 'is', null);
                
            if (orgError) {
                console.error('Error fetching total organization count:', orgError);
                showError('Hiba történt a szervezeti szám betöltésekor.');
            }
            
            // 3. Total Coupons
            const { count: couponCount, error: couponError } = await supabase
                .from('coupons')
                .select('id', { count: 'exact', head: true });
                
            if (couponError) {
                console.error('Error fetching total coupon count:', couponError);
                showError('Hiba történt a kuponok számának betöltésekor.');
            }

            setStats({
                totalUsers: userCount || 0,
                totalOrganizations: orgCount || 0,
                totalCoupons: couponCount || 0,
            });

        } finally {
            setIsLoading(false);
        }
    }, [isSuperadmin]);

    useEffect(() => {
        fetchGlobalStats();
    }, [fetchGlobalStats]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-pink-300 flex items-center gap-2">
                    <BarChart className="h-6 w-6" />
                    Globális Statisztikák
                </h2>
                <Button 
                    onClick={fetchGlobalStats} 
                    variant="outline" 
                    size="icon"
                    className="border-gray-700 text-gray-400 hover:bg-gray-800"
                    disabled={isLoading}
                >
                    <RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
                    <p className="ml-3 text-gray-300">Statisztikák betöltése...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-black/50 border-pink-500/30 backdrop-blur-sm text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">Összes Felhasználó</CardTitle>
                            <Users className="h-6 w-6 text-pink-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-white">{stats.totalUsers}</div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-black/50 border-pink-500/30 backdrop-blur-sm text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">Összes Szervezet</CardTitle>
                            <Building className="h-6 w-6 text-pink-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-white">{stats.totalOrganizations}</div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-black/50 border-pink-500/30 backdrop-blur-sm text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">Összes Kupon</CardTitle>
                            <Tag className="h-6 w-6 text-pink-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-white">{stats.totalCoupons}</div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default SuperadminStatsPage;