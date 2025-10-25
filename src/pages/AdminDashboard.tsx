import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, Tag, Calendar, ListChecks, QrCode, User, Menu, Settings, BarChart, Home, Loader2, Users, Building, CheckCircle } from 'lucide-react';
import UnauthorizedAccess from '@/components/UnauthorizedAccess';
import CouponsPage from '@/components/admin/CouponsPage';
import EventsPage from '@/components/admin/EventsPage';
import CouponUsagesPage from '@/components/admin/CouponUsagesPage';
import ProfileSettingsPage from '@/components/admin/ProfileSettingsPage';
import UsageStatisticsPage from '@/components/admin/UsageStatisticsPage'; // Import Statistics Page
import OrganizationMembersPage from '@/components/admin/OrganizationMembersPage'; // NEW IMPORT
import OrganizationSelector from '@/components/OrganizationSelector'; // NEW IMPORT
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MemberRole } from '@/types/organization';

const ROLE_MAP: Record<MemberRole, string> = {
    coupon_manager: 'Kupon kezelő',
    event_manager: 'Esemény kezelő',
    redemption_agent: 'Beváltó ügynök',
    viewer: 'Statisztika néző',
};

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin, isLoading, signOut, profile, activeOrganizationProfile, allMemberships, switchActiveOrganization } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('coupons');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect if loading is done and user is not authenticated
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <p className="ml-3 text-cyan-400">Jogosultság ellenőrzése...</p>
      </div>
    );
  }

  // Combine own admin profile (if exists) and delegated memberships
  const allOrganizations = [
      // 1. Add the user's own profile if they are the main admin (owner)
      ...(profile?.role === 'admin' && profile.organization_name ? [{
          organization_id: profile.id,
          organization_profile: {
              organization_name: profile.organization_name,
              logo_url: profile.logo_url,
          },
          roles: ['coupon_manager', 'event_manager', 'redemption_agent', 'viewer'] as MemberRole[], // Full owner rights
          isOwner: true,
      }] : []),
      // 2. Add all accepted delegated memberships
      ...allMemberships.map(m => ({
          organization_id: m.organization_id,
          organization_profile: m.organization_profile,
          roles: m.roles,
          isOwner: false,
      })).filter(m => m.organization_profile !== null)
  ];
  
  // Filter out duplicates based on organization_id
  const uniqueOrganizations = allOrganizations.filter((org, index, self) => 
      index === self.findIndex((t) => (
          t.organization_id === org.organization_id
      ))
  );

  // Check if the user is the main admin OR has any accepted membership
  const hasAdminAccess = isAdmin || allMemberships.length > 0;

  if (isAuthenticated && !hasAdminAccess) {
    return <UnauthorizedAccess />;
  }
  
  if (!isAuthenticated) {
      return null;
  }
  
  // Determine if the user has an active organization selected (needed for most tabs)
  const isOrganizationActive = !!activeOrganizationProfile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header and Actions - Responsive Layout */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-300 flex items-center gap-3 mb-4 md:mb-0">
            <Shield className="h-7 w-7 text-cyan-400" />
            Admin Dashboard
          </h1>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex space-x-3">
            <Button asChild variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Főoldal
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
              <Link to="/profile">
                <User className="h-4 w-4 mr-2" />
                Személyes Profil
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-green-400 text-green-400 hover:bg-green-400/10">
              <Link to="/code">
                <QrCode className="h-4 w-4 mr-2" />
                Beváltás
              </Link>
            </Button>
            <Button onClick={signOut} variant="destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Kijelentkezés
            </Button>
          </div>
          
          {/* Mobile Dropdown Menu */}
          <div className="md:hidden self-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="border-purple-500 text-purple-300">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/90 border-purple-500/30 backdrop-blur-sm text-white">
                <DropdownMenuItem asChild>
                  <Link to="/" className="flex items-center">
                    <Home className="h-4 w-4 mr-2 text-cyan-400" />
                    Főoldal
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-cyan-400" />
                    Személyes Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/code" className="flex items-center">
                    <QrCode className="h-4 w-4 mr-2 text-green-400" />
                    Beváltás
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/dashboard?tab=statistics" className="flex items-center">
                    <BarChart className="h-4 w-4 mr-2 text-pink-400" />
                    Statisztikák
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="text-red-400 flex items-center">
                  <LogOut className="h-4 w-4 mr-2" />
                  Kijelentkezés
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="bg-black/30 border border-purple-500/30 rounded-xl p-4 md:p-6 shadow-2xl backdrop-blur-sm">
          <p className="text-lg md:text-xl text-gray-300 mb-4">Üdvözöllek, {profile?.first_name || 'Admin'}!</p>
          
          <div className="mb-6">
            <OrganizationSelector />
          </div>
          
          {!isOrganizationActive ? (
            <div className="text-center p-10 bg-gray-800/50 rounded-lg border border-red-500/30">
                <Shield className="h-10 w-10 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-300 mb-4">Nincs aktív szervezet kiválasztva</h3>
                <p className="text-gray-400 mt-2 mb-6">Kérjük, válaszd ki, melyik szervezet nevében szeretnél dolgozni:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    {uniqueOrganizations.map(org => (
                        <Card 
                            key={org.organization_id} 
                            className="bg-gray-900/50 border-purple-500/30 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer"
                            onClick={() => switchActiveOrganization(org.organization_id)}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl text-cyan-300 flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    {org.organization_profile?.organization_name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-sm text-gray-400">Szerepkör:</span>
                                    {org.isOwner ? (
                                        <Badge className="bg-red-600/50 text-red-300 flex items-center gap-1">
                                            <Shield className="h-3 w-3" /> Tulajdonos
                                        </Badge>
                                    ) : (
                                        org.roles.map(r => (
                                            <Badge key={r} className="bg-cyan-600/50 text-cyan-300">{ROLE_MAP[r]}</Badge>
                                        ))
                                    )}
                                </div>
                                <Button 
                                    size="sm" 
                                    className="w-full mt-3 bg-purple-600 hover:bg-purple-700"
                                    onClick={() => switchActiveOrganization(org.organization_id)}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Kiválasztás
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tabs List - Full width on mobile (6 tabs now) */}
              <TabsList className="grid w-full grid-cols-6 bg-gray-800/50 border border-gray-700/50 h-auto p-1">
                <TabsTrigger value="coupons" className="data-[state=active]:bg-cyan-600/50 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 py-2 text-sm md:text-base">
                  <Tag className="h-4 w-4 mr-1 md:mr-2" /> <span className="hidden sm:inline">Kuponok</span>
                </TabsTrigger>
                <TabsTrigger value="events" className="data-[state=active]:bg-purple-600/50 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-400 py-2 text-sm md:text-base">
                  <Calendar className="h-4 w-4 mr-1 md:mr-2" /> <span className="hidden sm:inline">Események</span>
                </TabsTrigger>
                <TabsTrigger value="usages" className="data-[state=active]:bg-green-600/50 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-green-400 py-2 text-sm md:text-base">
                  <ListChecks className="h-4 w-4 mr-1 md:mr-2" /> <span className="hidden sm:inline">Beváltások</span>
                </TabsTrigger>
                <TabsTrigger value="statistics" className="data-[state=active]:bg-pink-600/50 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-pink-400 py-2 text-sm md:text-base">
                  <BarChart className="h-4 w-4 mr-1 md:mr-2" /> <span className="hidden sm:inline">Statisztikák</span>
                </TabsTrigger>
                <TabsTrigger value="members" className="data-[state=active]:bg-yellow-600/50 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-yellow-400 py-2 text-sm md:text-base">
                  <Users className="h-4 w-4 mr-1 md:mr-2" /> <span className="hidden sm:inline">Tagok</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-pink-600/50 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-pink-400 py-2 text-sm md:text-base">
                  <Settings className="h-4 w-4 mr-1 md:mr-2" /> <span className="hidden sm:inline">Beállítások</span>
                </TabsTrigger>
              </TabsList>
              <div className="mt-6">
                <TabsContent value="coupons">
                  <CouponsPage />
                </TabsContent>
                <TabsContent value="events">
                  <EventsPage />
                </TabsContent>
                <TabsContent value="usages">
                  <CouponUsagesPage />
                </TabsContent>
                <TabsContent value="statistics">
                  <UsageStatisticsPage />
                </TabsContent>
                <TabsContent value="members">
                  <OrganizationMembersPage />
                </TabsContent>
                <TabsContent value="settings">
                  <ProfileSettingsPage />
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;