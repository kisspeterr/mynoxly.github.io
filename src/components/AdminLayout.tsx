import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, Home, Loader2, Menu, X, Building, User, QrCode, CheckCircle, AlertTriangle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { MemberRole } from '@/types/organization';
import OrganizationSelectionPage from './admin/OrganizationSelectionPage';

interface AdminLayoutProps {
    children: React.ReactNode;
    tabs: { id: string, label: string, icon: React.FC<any>, component: React.FC, requiredPermission: MemberRole }[];
    activeTab: string;
    setActiveTab: (tabId: string) => void;
}

const ROLE_MAP: Record<MemberRole, string> = {
    coupon_manager: 'Kupon kezelő',
    event_manager: 'Esemény kezelő',
    redemption_agent: 'Beváltó ügynök',
    viewer: 'Statisztika néző',
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, tabs, activeTab, setActiveTab }) => {
    const { isAuthenticated, isSuperadmin, isLoading, signOut, profile, activeOrganizationProfile, allMemberships, checkPermission, switchActiveOrganization } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login');
        } else if (!isLoading && isSuperadmin) {
            navigate('/superadmin/dashboard');
        }
    }, [isAuthenticated, isSuperadmin, isLoading, navigate]);
    
    const handleSignOut = async () => {
        await signOut();
        navigate('/'); 
    };
    
    // Filter tabs based on permissions for the ACTIVE organization
    const visibleTabs = useMemo(() => {
        return tabs.filter(tab => checkPermission(tab.requiredPermission));
    }, [tabs, activeOrganizationProfile, checkPermission]);
    
    // Ensure activeTab is visible, otherwise default to the first visible tab
    useEffect(() => {
        if (visibleTabs.length > 0 && !visibleTabs.some(tab => tab.id === activeTab)) {
            setActiveTab(visibleTabs[0].id);
        }
    }, [activeOrganizationProfile, visibleTabs, activeTab, setActiveTab]);
    
    // Determine if the user has an active organization selected
    const isOrganizationActive = !!activeOrganizationProfile;
    
    // Find the active membership details for display
    const activeMembership = useMemo(() => {
        return allMemberships.find(m => m.organization_id === activeOrganizationProfile?.id);
    }, [allMemberships, activeOrganizationProfile]);
    
    // Combine all accepted memberships for the selector
    const uniqueOrganizations = allMemberships.map(m => ({
        organization_id: m.organization_id,
        organization_name: m.organization_profile?.organization_name || 'Ismeretlen szervezet',
        isOwner: m.organization_profile?.owner_id === profile?.id,
    })).filter((org, index, self) => 
        index === self.findIndex((t) => (
            t.organization_id === org.organization_id
        ))
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                <p className="ml-3 text-cyan-400">Jogosultság ellenőrzése...</p>
            </div>
        );
    }

    if (!isAuthenticated || allMemberships.length === 0) {
        // If authenticated but no memberships, show unauthorized access (or redirect handled by parent)
        return null; 
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white p-4 md:p-8">
            <div className="container mx-auto max-w-7xl">
                
                {/* Header and Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-purple-300 flex items-center gap-3 mb-4 md:mb-0">
                        <Shield className="h-7 w-7 text-cyan-400" />
                        Admin Dashboard
                    </h1>
                    
                    {/* Desktop Actions */}
                    <div className="hidden md:flex space-x-3">
                        <Button asChild variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
                            <Link to="/"><Home className="h-4 w-4 mr-2" />Főoldal</Link>
                        </Button>
                        <Button asChild variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
                            <Link to="/profile"><User className="h-4 w-4 mr-2" />Személyes Profil</Link>
                        </Button>
                        {checkPermission('redemption_agent') && (
                            <Button asChild variant="outline" className="border-green-400 text-green-400 hover:bg-green-400/10">
                                <Link to="/code"><QrCode className="h-4 w-4 mr-2" />Beváltás</Link>
                            </Button>
                        )}
                        <Button onClick={handleSignOut} variant="destructive">
                            <LogOut className="h-4 w-4 mr-2" />Kijelentkezés
                        </Button>
                    </div>
                    
                    {/* Mobile Dropdown Menu */}
                    <div className="md:hidden self-end">
                        <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="border-purple-500 text-purple-300">
                                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-black/90 border-purple-500/30 backdrop-blur-sm text-white">
                                <DropdownMenuItem asChild><Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center"><Home className="h-4 w-4 mr-2 text-cyan-400" />Főoldal</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center"><User className="h-4 w-4 mr-2 text-cyan-400" />Személyes Profil</Link></DropdownMenuItem>
                                {checkPermission('redemption_agent') && (
                                    <DropdownMenuItem asChild><Link to="/code" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center"><QrCode className="h-4 w-4 mr-2 text-green-400" />Beváltás</Link></DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={handleSignOut} className="text-red-400 flex items-center">
                                    <LogOut className="h-4 w-4 mr-2" />Kijelentkezés
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="bg-black/30 border border-purple-500/30 rounded-xl p-4 md:p-6 shadow-2xl backdrop-blur-sm">
                    
                    {/* Organization Selector / Status Bar */}
                    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                        <p className="text-lg md:text-xl text-gray-300">Üdvözöllek, <span className="font-semibold text-white">{profile?.first_name || 'Admin'}</span>!</p>
                        
                        {/* Organization Selector Dropdown */}
                        {uniqueOrganizations.length > 1 && (
                            <div className="w-full sm:w-auto sm:min-w-[250px]">
                                <Select 
                                    value={activeOrganizationProfile?.id || 'null'} 
                                    onValueChange={(value) => switchActiveOrganization(value)}
                                >
                                    <SelectTrigger className="w-full bg-gray-800/50 border-purple-700 text-white hover:bg-gray-700/50">
                                        <Building className="h-4 w-4 mr-2 text-purple-400" />
                                        <SelectValue placeholder="Válassz szervezetet" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black/90 border-purple-500/30 text-white">
                                        {uniqueOrganizations.map(org => (
                                            <SelectItem 
                                                key={org.organization_id} 
                                                value={org.organization_id}
                                            >
                                                <div className="flex items-center font-semibold">
                                                    {org.organization_name}
                                                    {org.organization_id === activeOrganizationProfile?.id && (
                                                        <CheckCircle className="h-4 w-4 ml-2 text-green-400" />
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    
                    {/* Main Content Area */}
                    {!isOrganizationActive ? (
                        <OrganizationSelectionPage />
                    ) : (
                        <>
                            {/* Active Organization Status Card */}
                            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm p-3 mb-6">
                                <CardContent className="p-0 text-sm text-gray-500 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Building className="h-4 w-4 mr-2 text-purple-400" />
                                        Jelenleg a(z) <span className="font-semibold text-purple-300 ml-1">{activeOrganizationProfile.organization_name}</span> jogosultságaival dolgozol.
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {activeMembership?.isOwner ? (
                                            <Badge className="bg-red-600/50 text-red-300 flex items-center gap-1">
                                                <Shield className="h-3 w-3" /> Tulajdonos
                                            </Badge>
                                        ) : (
                                            activeMembership?.roles.map(r => (
                                                <Badge key={r} className="bg-cyan-600/50 text-cyan-300">{ROLE_MAP[r]}</Badge>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                            
                            {/* Tabs Navigation */}
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className={`grid w-full grid-cols-${visibleTabs.length} bg-gray-800/50 border border-gray-700/50 h-auto p-1 max-w-full mx-auto`}>
                                    {visibleTabs.map(tab => (
                                        <TabsTrigger 
                                            key={tab.id} 
                                            value={tab.id} 
                                            className="data-[state=active]:bg-purple-600/50 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-400 py-2 text-sm md:text-base"
                                        >
                                            <tab.icon className="h-4 w-4 mr-1 md:mr-2" /> <span className="hidden sm:inline">{tab.label}</span>
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                <div className="mt-6">
                                    {children}
                                </div>
                            </Tabs>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;