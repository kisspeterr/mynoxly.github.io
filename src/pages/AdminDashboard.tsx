import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { Tag, Calendar, ListChecks, Settings, BarChart, Users } from 'lucide-react';
import UnauthorizedAccess from '@/components/UnauthorizedAccess';
import CouponsPage from '@/components/admin/CouponsPage';
import EventsPage from '@/components/admin/EventsPage';
import CouponUsagesPage from '@/components/admin/CouponUsagesPage';
import ProfileSettingsPage from '@/components/admin/ProfileSettingsPage';
import UsageStatisticsPage from '@/components/admin/UsageStatisticsPage';
import OrganizationMembersPage from '@/components/admin/OrganizationMembersPage';
import AdminLayout from '@/components/AdminLayout'; // NEW IMPORT
import { MemberRole } from '@/types/organization';
import { TabsContent } from '@/components/ui/tabs'; // Keep TabsContent for rendering children

const AdminDashboard = () => {
  const { isAuthenticated, isSuperadmin, isLoading, allMemberships } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('coupons');

  // Define all possible tabs and their required permissions
  const tabs = useMemo(() => [
    { id: 'coupons', label: 'Kuponok', icon: Tag, component: CouponsPage, requiredPermission: 'coupon_manager' as MemberRole },
    { id: 'events', label: 'Események', icon: Calendar, component: EventsPage, requiredPermission: 'event_manager' as MemberRole },
    { id: 'usages', label: 'Beváltások', icon: ListChecks, component: CouponUsagesPage, requiredPermission: 'redemption_agent' as MemberRole },
    { id: 'statistics', label: 'Statisztikák', icon: BarChart, component: UsageStatisticsPage, requiredPermission: 'viewer' as MemberRole },
    { id: 'members', label: 'Tagok', icon: Users, component: OrganizationMembersPage, requiredPermission: 'coupon_manager' as MemberRole },
    { id: 'settings', label: 'Beállítások', icon: Settings, component: ProfileSettingsPage, requiredPermission: 'coupon_manager' as MemberRole },
  ], []);
  
  // Filter tabs based on permissions (this filtering is also done inside AdminLayout, but needed here for rendering)
  const visibleTabs = tabs.filter(tab => tab.id === activeTab);
  const ActiveComponent = visibleTabs.length > 0 ? visibleTabs[0].component : null;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    } else if (!isLoading && isSuperadmin) {
      navigate('/superadmin/dashboard');
    }
  }, [isAuthenticated, isSuperadmin, isLoading, navigate]);
  
  // Check if the user has any accepted membership (owner or delegated)
  const hasAdminAccess = allMemberships.length > 0;

  if (isLoading) return null; // Loading state handled by AdminLayout
  if (!isAuthenticated || !hasAdminAccess) return <UnauthorizedAccess />;
  
  return (
    <AdminLayout 
        tabs={tabs} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
    >
        {/* Render the active component inside TabsContent */}
        {ActiveComponent && (
            <TabsContent value={activeTab}>
                <ActiveComponent />
            </TabsContent>
        )}
    </AdminLayout>
  );
};

export default AdminDashboard;