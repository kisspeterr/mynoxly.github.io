import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { LogOut, User, Home } from 'lucide-react';
import ProfileCard from '@/components/ProfileCard';
import UserCouponsList from '@/components/user/UserCouponsList'; // Import new component

const Profile = () => {
  const { isAuthenticated, isLoading, signOut, profile, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    // Show minimal loading if state changes mid-page (e.g., sign out initiated)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950">
        <p className="text-cyan-400">Betöltés...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // If not authenticated, useEffect should handle redirect, but we return null/empty for safety
    return null;
  }

  return (
    <AuthLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6 text-cyan-300">Felhasználói Profil</h1>
        
        {/* Responsive Grid Layout: Stacks on mobile, 1/3 - 2/3 split on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Card and Actions (Full width on mobile, 1/3 on large) */}
          <div className="lg:col-span-1 space-y-6">
            {profile && <ProfileCard profile={profile} email={user?.email} />}
            
            <div className="flex justify-center space-x-4">
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
          
          {/* Right Column: Coupons List (Full width on mobile, 2/3 on large) */}
          <div className="lg:col-span-2">
            <UserCouponsList />
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Profile;