"use client";

import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not logged in, redirect to login
        navigate('/auth', { replace: true });
      } else if (profile?.role !== 'admin') {
        // Logged in but not admin, redirect to home
        navigate('/', { replace: true });
      }
    }
  }, [user, profile, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Jogosultság ellenőrzése...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-300 mb-4">Hozzáférés megtagadva</h2>
          <p className="text-gray-300">Kérjük, jelentkezz be admin jogosultsággal</p>
        </div>
      </div>
    );
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-300 mb-4">Nincs admin jogosultság</h2>
          <p className="text-gray-300">
            A felhasználói fiókod nem rendelkezik admin jogosultsággal.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Szerepkör: {profile?.role || 'user'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRouteGuard;