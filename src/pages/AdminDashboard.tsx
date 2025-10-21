import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, Tag, Calendar, ListChecks, QrCode, User } from 'lucide-react';
import UnauthorizedAccess from '@/components/UnauthorizedAccess';
import CouponsPage from '@/components/admin/CouponsPage';
import EventsPage from '@/components/admin/EventsPage';
import CouponUsagesPage from '@/components/admin/CouponUsagesPage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin, isLoading, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('coupons');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950">
        <p className="text-cyan-400">Jogosultság ellenőrzése...</p>
      </div>
    );
  }

  if (isAuthenticated && !isAdmin) {
    return <UnauthorizedAccess />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-purple-300 flex items-center gap-3">
            <Shield className="h-8 w-8 text-cyan-400" />
            Admin Dashboard
          </h1>
          <div className="flex space-x-3">
            <Button asChild variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
              <Link to="/profile">
                <User className="h-4 w-4 mr-2" />
                Profil
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
        </div>

        <div className="bg-black/30 border border-purple-500/30 rounded-xl p-6 shadow-2xl backdrop-blur-sm">
          <p className="text-xl text-gray-300 mb-4">Üdvözöllek, {profile?.first_name || 'Admin'}!</p>
          <p className="text-lg text-gray-400 mb-8">Szervezet: <span className="font-semibold text-cyan-300">{profile?.organization_name || 'Nincs beállítva'}</span></p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-700/50">
              <TabsTrigger value="coupons" className="data-[state=active]:bg-cyan-600/50 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-cyan-400">
                <Tag className="h-4 w-4 mr-2" /> Kuponok
              </TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-purple-600/50 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-400">
                <Calendar className="h-4 w-4 mr-2" /> Események
              </TabsTrigger>
              <TabsTrigger value="usages" className="data-[state=active]:bg-green-600/50 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-green-400">
                <ListChecks className="h-4 w-4 mr-2" /> Beváltások
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
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;