import React, { useState, useEffect } from 'react';
import { useAuditLogs, AuditLog, AuditFilter } from '@/hooks/use-audit-logs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Clock, User, Building, Filter, RefreshCw, Activity, Tag, Calendar, Shield, Trash2, Upload, PlusCircle, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

// Map database actions to display names and colors
const ACTION_MAP: Record<string, { label: string, color: string, icon: React.FC<any> }> = {
    'INSERT': { label: 'Létrehozás', color: 'bg-green-600', icon: PlusCircle },
    'UPDATE': { label: 'Módosítás', color: 'bg-yellow-600', icon: Pencil },
    'DELETE': { label: 'Törlés', color: 'bg-red-600', icon: Trash2 },
    'STORAGE_UPLOAD': { label: 'Feltöltés', color: 'bg-purple-600', icon: Upload },
    'STORAGE_DELETE': { label: 'Törlés (Tárhely)', color: 'bg-red-800', icon: Trash2 },
    // Default for other actions (e.g., from triggers)
    'default': { label: 'Tevékenység', color: 'bg-gray-600', icon: Activity },
};

const TABLE_MAP: Record<string, string> = {
    'profiles': 'Profil/Szervezet',
    'coupons': 'Kupon',
    'events': 'Esemény',
    'coupon_usages': 'Beváltás',
    'organization_members': 'Tagság',
    'favorite_organizations': 'Kedvenc',
    'interested_events': 'Érdeklődés',
    'logos': 'Logó (Tárhely)',
    'coupon_banners': 'Banner (Tárhely)',
};

const getActionDetails = (log: AuditLog): string => {
    const actionType = log.action;
    const tableName = TABLE_MAP[log.table_name] || log.table_name;
    const payload = log.payload;
    
    if (actionType === 'INSERT') {
        if (log.table_name === 'profiles' && payload?.new?.role === 'admin') return `Új szervezet létrehozása: ${payload.new.organization_name}`;
        if (log.table_name === 'profiles' && payload?.new?.role === 'user') return `Új felhasználó regisztrációja`;
        if (log.table_name === 'coupons') return `Új kupon létrehozása: ${payload.new.title}`;
        if (log.table_name === 'coupon_usages') return `Beváltási kód generálása (Kupon: ${payload.new.coupon_id?.slice(0, 8)}...)`;
        if (log.table_name === 'organization_members' && payload?.new?.status === 'pending') return `Tag meghívása a szervezetbe`;
        if (log.table_name === 'organization_members' && payload?.new?.status === 'accepted') return `Meghívás elfogadása`;
        return `Új rekord létrehozása a(z) ${tableName} táblában`;
    }
    
    if (actionType === 'UPDATE') {
        if (log.table_name === 'coupon_usages' && payload?.new?.is_used === true && payload?.old?.is_used === false) return `Beváltás véglegesítése (Kód: ${payload.new.redemption_code})`;
        if (log.table_name === 'profiles' && payload?.new?.organization_name !== payload?.old?.organization_name) return `Szervezet nevének módosítása: ${payload.old.organization_name} -> ${payload.new.organization_name}`;
        if (log.table_name === 'profiles' && payload?.new?.logo_url !== payload?.old?.logo_url) return `Logó URL frissítése`;
        if (log.table_name === 'coupons') return `Kupon módosítása: ${payload.new.title}`;
        return `${tableName} rekord frissítése`;
    }
    
    if (actionType === 'DELETE') {
        if (log.table_name === 'favorite_organizations') return `Kedvenc eltávolítása`;
        if (log.table_name === 'interested_events') return `Érdeklődés eltávolítása`;
        return `${tableName} rekord törlése`;
    }
    
    if (actionType === 'STORAGE_UPLOAD') {
        return `${tableName} feltöltve. Méret: ${payload.file_size_kb} KB.`;
    }
    
    if (actionType === 'STORAGE_DELETE') {
        return `${tableName} törölve.`;
    }
    
    return `${actionType} művelet a(z) ${tableName} táblán.`;
};

const LogCard: React.FC<{ log: AuditLog }> = ({ log }) => {
    const action = ACTION_MAP[log.action] || ACTION_MAP['default'];
    const Icon = action.icon;
    const username = log.user_profile?.username || log.user_id.slice(0, 8) + '...';
    const details = getActionDetails(log);
    
    return (
        <Card className="bg-black/50 border-gray-700/50 backdrop-blur-sm text-white">
            <CardContent className="p-4 flex items-start space-x-4">
                <div className={`p-2 rounded-full ${action.color} flex-shrink-0 mt-1`}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center mb-1">
                        <Badge className={`${action.color} text-white font-semibold`}>{action.label}</Badge>
                        <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(new Date(log.created_at), 'yyyy. MM. dd. HH:mm:ss')}
                        </span>
                    </div>
                    
                    <p className="text-lg font-medium text-white break-words">{details}</p>
                    
                    <div className="text-sm text-gray-400 mt-1 space-y-1">
                        <p className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-red-400" />
                            Felhasználó: <span className="font-semibold ml-1 text-red-300">@{username}</span>
                        </p>
                        {log.organization_name && (
                            <p className="flex items-center">
                                <Building className="h-4 w-4 mr-2 text-red-400" />
                                Szervezet: <span className="font-semibold ml-1 text-white">{log.organization_name}</span>
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


const SuperadminActivityPage: React.FC = () => {
    const { logs, isLoading, fetchLogs, availableUsers, availableOrganizations } = useAuditLogs();
    const [filters, setFilters] = useState<AuditFilter>({});
    
    const handleFilterChange = (key: keyof AuditFilter, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value === 'all' ? undefined : value,
        }));
    };
    
    const handleApplyFilters = () => {
        fetchLogs(filters);
    };
    
    const handleClearFilters = () => {
        setFilters({});
        fetchLogs({});
    };
    
    const availableActions = Object.keys(ACTION_MAP).filter(k => k !== 'default');

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-red-300 flex items-center gap-2">
                    <Activity className="h-6 w-6" />
                    Rendszer Aktivitás Logok
                </h2>
                <Button 
                    onClick={() => fetchLogs(filters)} 
                    variant="outline" 
                    size="icon"
                    className="border-gray-700 text-gray-400 hover:bg-gray-800"
                    disabled={isLoading}
                >
                    <RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                </Button>
            </div>

            {/* Filters Card */}
            <Card className="bg-black/50 border-red-500/30 backdrop-blur-sm p-4 mb-8">
                <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-xl text-red-300 flex items-center gap-2">
                        <Filter className="h-5 w-5" /> Szűrők
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* User Filter */}
                        <Select 
                            value={filters.user_id || 'all'} 
                            onValueChange={(val) => handleFilterChange('user_id', val)}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="w-full bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50">
                                <SelectValue placeholder="Felhasználó szűrése" />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 border-red-500/30 text-white">
                                <SelectItem value="all">Összes felhasználó</SelectItem>
                                {availableUsers.map(user => (
                                    <SelectItem key={user.id} value={user.id}>
                                        @{user.username}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        {/* Organization Filter */}
                        <Select 
                            value={filters.organization_name || 'all'} 
                            onValueChange={(val) => handleFilterChange('organization_name', val)}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="w-full bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50">
                                <SelectValue placeholder="Szervezet szűrése" />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 border-red-500/30 text-white">
                                <SelectItem value="all">Összes szervezet</SelectItem>
                                <SelectItem value="null">Nincs szervezet</SelectItem>
                                {availableOrganizations.map(org => (
                                    <SelectItem key={org} value={org}>
                                        {org}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        {/* Action Filter */}
                        <Select 
                            value={filters.action || 'all'} 
                            onValueChange={(val) => handleFilterChange('action', val)}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="w-full bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50">
                                <SelectValue placeholder="Tevékenység szűrése" />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 border-red-500/30 text-white">
                                <SelectItem value="all">Összes tevékenység</SelectItem>
                                {availableActions.map(action => (
                                    <SelectItem key={action} value={action}>
                                        {ACTION_MAP[action]?.label || action}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="flex space-x-4 pt-2">
                        <Button 
                            onClick={handleApplyFilters}
                            className="flex-grow bg-red-600 hover:bg-red-700"
                            disabled={isLoading}
                        >
                            Szűrés alkalmazása
                        </Button>
                        <Button 
                            onClick={handleClearFilters}
                            variant="outline"
                            className="w-1/3 border-gray-700 text-gray-400 hover:bg-gray-800"
                            disabled={isLoading}
                        >
                            Szűrők törlése
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-red-400" />
                    <p className="ml-3 text-gray-300">Logok betöltése...</p>
                </div>
            ) : logs.length === 0 ? (
                <p className="text-gray-400 text-center mt-10">Nincs találat a szűrőknek megfelelő aktivitásra.</p>
            ) : (
                <div className="space-y-4">
                    {logs.map(log => (
                        <LogCard key={log.id} log={log} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SuperadminActivityPage;