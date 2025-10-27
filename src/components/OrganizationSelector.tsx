import React from 'react';
import { useAuth, OrganizationProfileData } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, CheckCircle, Loader2, Shield, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MemberRole } from '@/types/organization';
import { Badge } from '@/components/ui/badge';

const ROLE_MAP: Record<MemberRole, string> = {
    coupon_manager: 'Kupon kezelő',
    event_manager: 'Esemény kezelő',
    redemption_agent: 'Beváltó ügynök',
    viewer: 'Statisztika néző',
};

const OrganizationSelector: React.FC = () => {
    const { 
        allMemberships, 
        activeOrganizationId, 
        activeOrganizationProfile, 
        profile, 
        switchActiveOrganization, 
        isLoading 
    } = useAuth();
    
    // Combine all accepted memberships
    const allOrganizations = allMemberships.map(m => ({
        organization_id: m.organization_id,
        organization_profile: m.organization_profile,
        roles: m.roles,
        isOwner: m.organization_profile?.owner_id === profile?.id, // Check if the current user is the owner
    })).filter(m => m.organization_profile !== null);
    
    // Filter out duplicates based on organization_id
    const uniqueOrganizations = allOrganizations.filter((org, index, self) => 
        index === self.findIndex((t) => (
            t.organization_id === org.organization_id
        ))
    );

    if (isLoading) {
        return (
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm p-4">
                <CardContent className="flex items-center p-0">
                    <Loader2 className="h-5 w-5 mr-3 animate-spin text-purple-400" />
                    <span className="text-gray-400">Szervezetek betöltése...</span>
                </CardContent>
            </Card>
        );
    }
    
    if (uniqueOrganizations.length === 0) {
        return (
            <Card className="bg-black/50 border-red-500/30 backdrop-blur-sm p-4">
                <CardContent className="flex items-center p-0">
                    <Building className="h-5 w-5 mr-3 text-red-400" />
                    <span className="text-gray-400">Nincs aktív szervezeti tagság.</span>
                </CardContent>
            </Card>
        );
    }
    
    const activeOrg = uniqueOrganizations.find(org => org.organization_id === activeOrganizationId);

    return (
        <div className="space-y-4">
            <label className="text-sm font-medium text-gray-400 flex items-center">
                <Building className="h-4 w-4 mr-2 text-purple-400" />
                Aktív Szervezet Kiválasztása
            </label>
            
            {/* Selector Dropdown */}
            <Select 
                value={activeOrganizationId || undefined} 
                onValueChange={switchActiveOrganization}
            >
                <SelectTrigger className="w-full bg-gray-800/50 border-purple-700 text-white hover:bg-gray-700/50">
                    <SelectValue placeholder="Válassz szervezetet" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-purple-500/30 text-white">
                    {uniqueOrganizations.map(org => (
                        <SelectItem 
                            key={org.organization_id} 
                            value={org.organization_id}
                            className="flex flex-col items-start"
                        >
                            <div className="flex items-center font-semibold">
                                {org.organization_profile?.organization_name}
                                {org.isOwner && <Shield className="h-4 w-4 ml-2 text-red-400" />}
                                {org.organization_id === activeOrganizationId && (
                                    <CheckCircle className="h-4 w-4 ml-2 text-green-400" />
                                )}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                {org.isOwner ? 'Tulajdonos' : org.roles.map(r => ROLE_MAP[r]).join(', ')}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            
            {/* Active Organization Status */}
            {activeOrg && (
                <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm p-3">
                    <CardContent className="p-0 text-xs text-gray-500">
                        Jelenleg a(z) <span className="font-semibold text-purple-300">{activeOrg.organization_profile?.organization_name}</span> jogosultságaival dolgozol.
                        <div className="mt-1 flex flex-wrap gap-1">
                            <span className="font-medium text-white">Szerepkör:</span>
                            {activeOrg.isOwner ? (
                                <Badge className="bg-red-600/50 text-red-300 flex items-center gap-1">
                                    <Shield className="h-3 w-3" /> Tulajdonos
                                </Badge>
                            ) : (
                                activeOrg.roles.map(r => (
                                    <Badge key={r} className="bg-cyan-600/50 text-cyan-300">{ROLE_MAP[r]}</Badge>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default OrganizationSelector;