import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Shield, Users, BarChart, Home, LogOut, Building } from 'lucide-react';
import UnauthorizedAccess from '@/components/UnauthorizedAccess';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SuperadminUsersPage from '@/components/superadmin/SuperadminUsersPage';
import SuperadminStatsPage from '@/components/superadmin/SuperadminStatsPage';

const SuperadminDashboard: React.FC = () => {
  const { isAuthenticated, isSuperadmin, isLoading, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    } else if (!isLoading && isAuthenticated && !isSuperadmin) {
      // Redirect regular admins to their dashboard
      navigate('/admin/dashboard');
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
        <p className="ml-3 text-cyan-400">Superadmin jogosultság ellenőrzése...</p>
      </div>
    );
  }

  if (!isSuperadmin) {
    return <UnauthorizedAccess />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-red-400 flex items-center gap-3 mb-4 md:mb-0">
            <Shield className="h-7 w-7 text-red-400" />
            Superadmin Dashboard
          </h1>
          
          <div className="flex space-x-3">
            <Button asChild variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Főoldal
              </Link>
            </Button>
            <Button onClick={handleSignOut} variant="destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Kijelentkezés
            </Button>
          </div>
        </div>

        <div className="bg-black/30 border border-red-500/30 rounded-xl p-4 md:p-6 shadow-2xl backdrop-blur-sm">
          <p className="text-lg md:text-xl text-gray-300 mb-4">Üdvözöllek, {profile?.first_name || 'Superadmin'}!</p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-gray-700/50 h-auto p-1 max-w-md mx-auto">
              <TabsTrigger value="users" className="data-[state=active]:bg-red-600/50 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-red-400 py-2 text-sm md:text-base">
                <Users className="h-4 w-4 mr-1 md:mr-2" /> Felhasználók & Szervezetek
              </TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:bg-pink-600/50 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-pink-400 py-2 text-sm md:text-base">
                <BarChart className="h-4 w-4 mr-1 md:mr-2" /> Globális Statisztikák
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="users">
                <SuperadminUsersPage />
              </TabsContent>
              <TabsContent value="stats">
                <SuperadminStatsPage />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SuperadminDashboard;