import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, Tag, Calendar, ListChecks, QrCode, User, Menu, Settings, BarChart, Home, Loader2, Users, Building, AlertTriangle } from 'lucide-react';
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
import { Card } from '@/components/ui/card';
import { MemberRole } from '@/types/organization';

const ROLE_MAP: Record<MemberRole, string> = {
    coupon_manager: 'Kupon kezelő',
    event_manager: 'Esemény kezelő',
    redemption_agent: 'Beváltó ügynök',
    viewer: 'Statisztika néző',
};

const AdminDashboard = () => {
  const { isAuthenticated, isSuperadmin, isLoading, signOut, profile, activeOrganizationProfile, allMemberships, checkPermission } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('coupons');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect if loading is done and user is not authenticated
      navigate('/login');
    } else if (!isLoading && isSuperadmin) {
      // Redirect Superadmins to their dedicated dashboard
      navigate('/superadmin/dashboard');
    }
  }, [isAuthenticated, isSuperadmin, isLoading, navigate]);
  
  const handleSignOut = async () => {
      await signOut();
      // Navigate to home page after sign out attempt, which should redirect to login if successful
      navigate('/'); 
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <p className="ml-3 text-cyan-400">Jogosultság ellenőrzése...</p>
      </div>
    );
  }

  // Check if the user has any accepted membership (owner or delegated)
  const hasAdminAccess = allMemberships.length > 0;

  if (isAuthenticated && !hasAdminAccess) {
    return <UnauthorizedAccess />;
  }
  
  if (!isAuthenticated) {
      return null;
  }
  
  // Determine if the user has an active organization selected (needed for most tabs)
  const isOrganizationActive = !!activeOrganizationProfile;
  
  // Define tabs and required permissions
  const tabs = [
    { value: 'coupons', label: 'Kuponok', icon: Tag, component: CouponsPage, requiredPermission: 'coupon_manager' as MemberRole },
    { value: 'events', label: 'Események', icon: Calendar, component: EventsPage, requiredPermission: 'event_manager' as MemberRole },
    { value: 'usages', label: 'Beváltások', icon: ListChecks, component: CouponUsagesPage, requiredPermission: 'viewer' as MemberRole },
    { value: 'statistics', label: 'Statisztikák', icon: BarChart, component: UsageStatisticsPage, requiredPermission: 'viewer' as MemberRole },
    { value: 'members', label: 'Tagok', icon: Users, component: OrganizationMembersPage, requiredPermission: 'coupon_manager' as MemberRole },
    { value: 'settings', label: 'Beállítások', icon: Settings, component: ProfileSettingsPage, requiredPermission: 'coupon_manager' as MemberRole },
  ];
  
  // Filter tabs based on user permissions (if an organization is active)
  const visibleTabs = tabs.filter(tab => isOrganizationActive ? checkPermission(tab.requiredPermission) : true);
  
  // Ensure activeTab is visible, otherwise default to the first visible tab
  useEffect(() => {
      if (isOrganizationActive && !visibleTabs.some(tab => tab.value === activeTab)) {
          setActiveTab(visibleTabs[0]?.value || 'coupons');
      }
  }, [isOrganizationActive, visibleTabs, activeTab]);


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
            <Button onClick={handleSignOut} variant="destructive">
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
                <DropdownMenuItem onClick={handleSignOut} className="text-red-400 flex items-center">
                  <LogOut className="h-4 w-4 mr-2" />
                  Kijelentkezés
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="bg-black/30 border border-purple-500/30 rounded-xl p-4 md:p-6 shadow-2xl backdrop-blur-sm">
          <p className="text-lg md:text-xl text-gray-300 mb-4">Üdvözöllek, {profile?.first_name || 'Admin'}!</p>
          
          {/* Organization Selector is always visible here */}
          <div className="mb-6">
            <OrganizationSelector />
          </div>
          
          {!isOrganizationActive ? (
            <Card className="text-center p-10 bg-gray-800/50 rounded-lg border border-red-500/30 mt-6">
                <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-300 mb-2">Nincs aktív szervezet kiválasztva</h3>
                <p className="text-gray-400">Kérjük, válassz egy szervezetet a fenti legördülő menüből a Dashboard eléréséhez.</p>
            </Card>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tabs List - Filtered by permissions */}
              <TabsList className={`grid w-full grid-cols-${visibleTabs.length} bg-gray-800/50 border border-gray-700/50 h-auto p-1`}>
                {visibleTabs.map(tab => (
                    <TabsTrigger 
                        key={tab.value}
                        value={tab.value} 
                        className="data-[state=active]:bg-cyan-600/50 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 py-2 text-sm md:text-base"
                    >
                        <tab.icon className="h-4 w-4 mr-1 md:mr-2" /> <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                ))}
              </TabsList>
              <div className="mt-6">
                {/* Tabs Content - Render only if active and visible */}
                {visibleTabs.map(tab => (
                    <TabsContent key={tab.value} value={tab.value}>
                        <tab.component />
                    </TabsContent>
                ))}
              </div>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;