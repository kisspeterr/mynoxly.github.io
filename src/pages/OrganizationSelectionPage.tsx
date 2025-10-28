import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Building, Shield, ArrowRight, LogOut, CheckCircle, Users } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MemberRole } from '@/types/organization';

const ROLE_MAP: Record<MemberRole, string> = {
    coupon_manager: 'Kupon kezelő',
    event_manager: 'Esemény kezelő',
    redemption_agent: 'Beváltó ügynök',
    viewer: 'Statisztika néző',
};

const OrganizationSelectionPage: React.FC = () => {
    const { 
        isAuthenticated, 
        isLoading, 
        signOut, 
        profile, 
        allMemberships, 
        switchActiveOrganization 
    } = useAuth();
    const navigate = useNavigate();

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, isLoading, navigate]);
    
    const handleSignOut = async () => {
        await signOut();
        navigate('/'); 
    };
    
    const handleSelectOrganization = (organizationId: string) => {
        switchActiveOrganization(organizationId);
        // Redirect to the main Admin Dashboard after selection
        navigate('/admin/dashboard');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                <p className="ml-3 text-cyan-400">Szervezeti adatok betöltése...</p>
            </div>
        );
    }
    
    if (!isAuthenticated) return null;

    // Filter unique organizations the user is a member of (status: accepted)
    const uniqueOrganizations = allMemberships.filter((org, index, self) => 
        index === self.findIndex((t) => (
            t.organization_id === org.organization_id
        ))
    );
    
    // If the user has only one organization, redirect them directly to the dashboard
    if (uniqueOrganizations.length === 1) {
        const singleOrgId = uniqueOrganizations[0].organization_id;
        // Ensure it's set as active before redirecting
        if (singleOrgId) {
            switchActiveOrganization(singleOrgId);
            navigate('/admin/dashboard');
        }
        return null;
    }
    
    // If the user has no organizations, show a message
    if (uniqueOrganizations.length === 0) {
        return (
            <AuthLayout>
                <div className="text-center space-y-6">
                    <Building className="h-12 w-12 text-red-400 mx-auto" />
                    <h1 className="text-2xl font-bold text-red-300">Nincs aktív szervezeti tagság</h1>
                    <p className="text-gray-400">
                        Jelenleg nem vagy tagja egyetlen szervezetnek sem. Kérjük, ellenőrizd a profilodat a függőben lévő meghívásokért.
                    </p>
                    <Button asChild variant="outline" className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
                        <Link to="/profile">
                            <Users className="h-4 w-4 mr-2" />
                            Profil & Meghívások
                        </Link>
                    </Button>
                    <Button onClick={handleSignOut} variant="destructive" className="w-full">
                        <LogOut className="h-4 w-4 mr-2" />
                        Kijelentkezés
                    </Button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 p-4">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        Szervezet Kiválasztása
                    </h1>
                    <p className="text-gray-400 mt-2">Válassz egy szervezetet a Dashboard eléréséhez.</p>
                </div>
                
                <div className="space-y-4">
                    {uniqueOrganizations.map(membership => {
                        const org = membership.organization_profile;
                        if (!org) return null;
                        
                        const isOwner = org.owner_id === profile?.id;
                        
                        return (
                            <Card 
                                key={org.id} 
                                className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-white hover:border-cyan-500/50 transition-all duration-300"
                            >
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-4 flex-grow min-w-0">
                                        {org.logo_url ? (
                                            <img 
                                                src={org.logo_url} 
                                                alt={org.organization_name} 
                                                className="h-12 w-12 rounded-full object-cover border-2 border-purple-400"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center border-2 border-purple-400">
                                                <Building className="h-6 w-6 text-purple-400" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <CardTitle className="text-xl text-cyan-300 truncate">{org.organization_name}</CardTitle>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {isOwner ? (
                                                    <Badge className="bg-red-600/50 text-red-300 flex items-center gap-1">
                                                        <Shield className="h-3 w-3" /> Tulajdonos
                                                    </Badge>
                                                ) : (
                                                    membership.roles.map(r => (
                                                        <Badge key={r} className="bg-cyan-600/50 text-cyan-300">{ROLE_MAP[r]}</Badge>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <Button 
                                        onClick={() => handleSelectOrganization(org.id)}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex-shrink-0 ml-4"
                                    >
                                        Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
                
                <div className="mt-8 text-center">
                    <Button onClick={handleSignOut} variant="destructive" className="w-full max-w-xs">
                        <LogOut className="h-4 w-4 mr-2" />
                        Kijelentkezés
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OrganizationSelectionPage;