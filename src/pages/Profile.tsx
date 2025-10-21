import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { LogOut, User, Home } from 'lucide-react';
import ProfileCard from '@/components/ProfileCard';

const Profile = () => {
  const { isAuthenticated, isLoading, signOut, profile, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !isAuthenticated) {
    // Show loading or let useEffect redirect
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950">
        <p className="text-cyan-400">Betöltés...</p>
      </div>
    );
  }

  return (
    <AuthLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6 text-cyan-300">Felhasználói Profil</h1>
        
        {profile && <ProfileCard profile={profile} email={user?.email} />}

        <div className="mt-8 flex justify-center space-x-4">
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
          >
            <Home className="h-4 w-4 mr-2" />
            Főoldal
          </Button>
          <Button onClick={signOut} variant="destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Kijelentkezés
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Profile;