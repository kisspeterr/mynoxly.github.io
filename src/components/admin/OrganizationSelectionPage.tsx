import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, CheckCircle, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MemberRole } from '@/types/organization';

const ROLE_MAP: Record<MemberRole, string> = {
    coupon_manager: 'Kupon kezelő',
    event_manager: 'Esemény kezelő',
    redemption_agent: 'Beváltó ügynök',
    viewer: 'Statisztika néző',
};

const OrganizationSelectionPage: React.FC = () => {
    const { allMemberships, profile, switchActiveOrganization, isLoading } = useAuth();
    
    // Combine all accepted memberships and filter out duplicates based on organization_id
    const uniqueOrganizations = allMemberships.map(m => ({
        organization_id: m.organization_id,
        organization_profile: m.organization_profile,
        roles: m.roles,
        isOwner: m.organization_profile?.owner_id === profile?.id,
    })).filter((org, index, self) => 
        org.organization_profile !== null && index === self.findIndex((t) => (
            t.organization_id === org.organization_id
        ))
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                <p className="ml-3 text-cyan-400">Tagságok betöltése...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-purple-300">Válassz Szervezetet</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
                Válaszd ki azt a szervezetet, amelynek az adatait kezelni szeretnéd. A jogosultságaid a kiválasztott szervezethez tartozó szerepköröktől függenek.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {uniqueOrganizations.map(org => {
                    const orgProfile = org.organization_profile!;
                    
                    return (
                        <Card 
                            key={org.organization_id} 
                            className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-white hover:shadow-lg hover:shadow-purple-500/20 transition-shadow duration-300"
                        >
                            <CardHeader className="flex flex-row items-center space-x-4">
                                {orgProfile.logo_url ? (
                                    <img 
                                        src={orgProfile.logo_url} 
                                        alt={orgProfile.organization_name} 
                                        className="h-12 w-12 rounded-full object-cover border-2 border-purple-400"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center border-2 border-purple-400">
                                        <Building className="h-6 w-6 text-purple-400" />
                                    </div>
                                )}
                                <div>
                                    <CardTitle className="text-xl text-cyan-300">{orgProfile.organization_name}</CardTitle>
                                    <CardDescription className="text-gray-400">
                                        {org.isOwner ? 'Tulajdonos' : 'Delegált tag'}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="pt-2 border-t border-gray-700/50 space-y-2">
                                    <h4 className="font-semibold text-gray-300 flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-red-400" /> Jogosultságok:
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {org.isOwner ? (
                                            <Badge className="bg-red-600/50 text-red-300">Teljes hozzáférés</Badge>
                                        ) : (
                                            org.roles.map(role => (
                                                <Badge key={role} className="bg-cyan-600/50 text-cyan-300">{ROLE_MAP[role]}</Badge>
                                            ))
                                        )}
                                    </div>
                                </div>
                                
                                <Button 
                                    onClick={() => switchActiveOrganization(org.organization_id)}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                >
                                    Kezelés megkezdése <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default OrganizationSelectionPage;