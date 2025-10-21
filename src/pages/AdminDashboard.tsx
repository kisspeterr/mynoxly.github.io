import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Shield } from 'lucide-react';
import UnauthorizedAccess from '@/components/UnauthorizedAccess';

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin, isLoading, signOut, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // If not authenticated, redirect to login
      navigate('/login');
    }
    // Note: We no longer redirect non-admins here. We render the UnauthorizedAccess component instead.
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950">
        <p className="text-cyan-400">Jogosultság ellenőrzése...</p>
      </div>
    );
  }

  // If authenticated but not admin, show unauthorized access page
  if (isAuthenticated && !isAdmin) {
    return <UnauthorizedAccess />;
  }
  
  // If not authenticated, useEffect handles redirect to /login. If we reach here, 
  // it means isAuthenticated is true AND isAdmin is true.

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-purple-300 flex items-center gap-3">
            <Shield className="h-8 w-8 text-cyan-400" />
            Admin Dashboard
          </h1>
          <Button onClick={signOut} variant="destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Kijelentkezés
          </Button>
        </div>

        <div className="bg-black/30 border border-purple-500/30 rounded-xl p-6 shadow-2xl backdrop-blur-sm">
          <p className="text-xl text-gray-300 mb-4">Üdvözöllek, {profile?.first_name || 'Admin'}!</p>
          <p className="text-lg text-gray-400">Szerepköröd: <span className="font-semibold text-cyan-300">{profile?.role}</span></p>
          
          <div className="mt-8 p-4 bg-purple-900/50 rounded-lg border border-purple-500/50">
            <h3 className="text-2xl font-bold text-purple-300 mb-4">
              Admin Eszközök
            </h3>
            <p className="text-gray-300">Itt kezelheted a kuponokat és a partnereket.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;