import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User, Home, Loader2, Settings, Heart, Tag, Coins, Mail, ListChecks } from 'lucide-react';
import ProfileCard from '@/components/ProfileCard';
import UserCouponsList from '@/components/user/UserCouponsList';
import UserFavoritesList from '@/components/user/UserFavoritesList';
import UserLoyaltyPointsList from '@/components/user/UserLoyaltyPointsList';
import UserInterestedEventsList from '@/components/user/UserInterestedEventsList';
import UserSettingsForm from '@/components/user/UserSettingsForm';
import UserInvitationsList from '@/components/user/UserInvitationsList';
import UserChallengesList from '@/components/user/UserChallengesList'; // NEW IMPORT
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Navigation from '@/components/sections/Navigation'; // IMPORT NAVIGATION

const Profile = () => {
  const { isAuthenticated, isLoading, signOut, profile, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  const handleSignOut = async () => {
      await signOut();
      navigate('/'); 
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <p className="ml-3 text-cyan-400">Profil adatok betöltése...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white">
      <Navigation />
      <div className="pt-24 pb-12 px-4 md:px-8 container mx-auto max-w-7xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Személyes Profil
          </h1>
          <p className="text-gray-400 mt-2">Itt kezelheted a beállításaidat, kuponjaidat és hűségpontjaidat.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Card and Settings (Sticky on large screens) */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Profile Card */}
            {profile && <ProfileCard profile={profile} email={user?.email} />}
            
            {/* User Settings Form */}
            <Card className="bg-black/50 border-cyan-500/30 backdrop-blur-sm text-white">
                <CardHeader>
                    <CardTitle className="text-2xl text-cyan-300 flex items-center gap-2">
                        <Settings className="h-6 w-6" />
                        Fiók Beállítások
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <UserSettingsForm />
                </CardContent>
            </Card>
            
            {/* Actions */}
            <div className="flex flex-col space-y-4">
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Vissza a főoldalra
              </Button>
              <Button onClick={handleSignOut} variant="destructive" className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Kijelentkezés
              </Button>
            </div>
          </div>
          
          {/* Right Column: User Data Sections (Full width on mobile, 2/3 on large) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Invitations Section */}
            <Card className="bg-black/50 border-yellow-500/30 backdrop-blur-sm p-6">
                <UserInvitationsList />
            </Card>
            
            {/* Challenges Section */}
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm p-6">
                <UserChallengesList />
            </Card>
            
            {/* Interested Events Section */}
            <Card className="bg-black/50 border-red-500/30 backdrop-blur-sm p-6">
                <UserInterestedEventsList />
            </Card>
            
            {/* Loyalty Points Section */}
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm p-6">
                <UserLoyaltyPointsList />
            </Card>
            
            {/* Favorites Section */}
            <Card className="bg-black/50 border-red-500/30 backdrop-blur-sm p-6">
                <UserFavoritesList />
            </Card>
            
            {/* Coupons Section */}
            <Card className="bg-black/50 border-cyan-500/30 backdrop-blur-sm p-6">
                <UserCouponsList />
            </Card>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;