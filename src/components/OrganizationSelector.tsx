import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const OrganizationSelector: React.FC = () => {
    const { 
        allMemberships, 
        activeOrganizationId, 
        activeOrganizationProfile, 
        profile, 
        switchActiveOrganization, 
        isLoading 
    } = useAuth();
    
    const allOrganizations = [
        // 1. Add the user's own profile if they are the main admin (owner)
        ...(profile?.role === 'admin' && profile.organization_name ? [{
            organization_id: profile.id,
            organization_profile: {
                organization_name: profile.organization_name,
                logo_url: profile.logo_url,
            }
        }] : []),
        // 2. Add all accepted delegated memberships
        ...allMemberships.map(m => ({
            organization_id: m.organization_id,
            organization_profile: m.organization_profile,
        })).filter(m => m.organization_profile !== null)
    ];
    
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

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center">
                <Building className="h-4 w-4 mr-2 text-purple-400" />
                Aktív Szervezet Kiválasztása
            </label>
            <Select 
                value={activeOrganizationId || undefined} 
                onValueChange={switchActiveOrganization}
                disabled={uniqueOrganizations.length <= 1}
            >
                <SelectTrigger className="w-full bg-gray-800/50 border-purple-700 text-white hover:bg-gray-700/50">
                    <SelectValue placeholder="Válassz szervezetet" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-purple-500/30 text-white">
                    {uniqueOrganizations.map(org => (
                        <SelectItem 
                            key={org.organization_id} 
                            value={org.organization_id}
                            className="flex items-center"
                        >
                            {org.organization_profile?.organization_name}
                            {org.organization_id === activeOrganizationId && (
                                <CheckCircle className="h-4 w-4 ml-2 text-green-400" />
                            )}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {activeOrganizationProfile && (
                <p className="text-xs text-gray-500">
                    Jelenleg a(z) <span className="font-semibold text-purple-300">{activeOrganizationProfile.organization_name}</span> jogosultságaival dolgozol.
                </p>
            )}
        </div>
    );
};

export default OrganizationSelector;