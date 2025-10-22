import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Home } from 'lucide-react';
import ProfileCard from '@/components/ProfileCard';
import UserCouponsList from '@/components/user/UserCouponsList';
import UserFavoritesList from '@/components/user/UserFavoritesList';
import UserLoyaltyPointsList from '@/components/user/UserLoyaltyPointsList';
import UserInterestedEventsList from '@/components/user/UserInterestedEventsList';

const Profile = () => {
  const { signOut, profile, user } = useAuth();
  const navigate = useNavigate();

  if (!profile) {
    // This should theoretically not happen due to ProtectedRoute, but it's a good fallback.
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950">
        <p className="text-cyan-400">Profil betöltése...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-cyan-300">Felhasználói Profil</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
            <ProfileCard profile={profile} email={user?.email} />
            
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
          
          <div className="lg:col-span-2 space-y-10">
            <UserInterestedEventsList />
            <UserLoyaltyPointsList />
            <UserFavoritesList />
            <UserCouponsList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;