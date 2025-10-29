import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate, Link } from 'react-router-dom';
import UnauthorizedAccess from '@/components/UnauthorizedAccess';
import AuthLayout from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Tag, User, Clock, MapPin, Home, AtSign, AlertTriangle } from 'lucide-react';
import { useRedemption } from '@/hooks/use-redemption';
import { format } from 'date-fns';

const RedemptionPage = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { isLoading, usageDetails, checkCode, finalizeRedemption, clearDetails, hasPermission, activeOrganizationName } = useRedemption();
  const navigate = useNavigate();
  const [codeInput, setCodeInput] = useState('');
  
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    checkCode(codeInput);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950">
        <p className="text-cyan-400">Jogosultság ellenőrzése...</p>
      </div>
    );
  }

  if (isAuthenticated && !hasPermission) {
    return <UnauthorizedAccess />;
  }
  
  const userName = usageDetails?.profile?.first_name || usageDetails?.profile?.last_name 
    ? `${usageDetails.profile.first_name || ''} ${usageDetails.profile.last_name || ''}`.trim()
    : 'Névtelen felhasználó';
    
  const usernameDisplay = usageDetails?.profile?.username ? `@${usageDetails.profile.username}` : 'Nincs felhasználónév';

  return (
    <AuthLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6 text-green-400">Kupon Beváltás (Admin)</h1>
        
        {!activeOrganizationName && (
            <Card className="text-center p-4 bg-gray-800/50 rounded-lg border border-red-500/30 mb-6">
                <AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2" />
                <p className="text-red-300 text-sm">Nincs aktív szervezet kiválasztva. Kérjük, válassz szervezetet az Admin Dashboardon.</p>
            </Card>
        )}
        
        <Card className="bg-black/50 border-green-500/30 backdrop-blur-sm text-white p-6">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-xl text-green-300">Beváltási kód ellenőrzése</CardTitle>
            <CardDescription className="text-gray-400">
              Írd be a felhasználó által felmutatott 6 jegyű kódot.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleCheck} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-gray-300">Beváltási kód</Label>
              <Input 
                id="code"
                type="text" 
                placeholder="Pl. 123456"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                maxLength={6}
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 text-center text-2xl font-mono tracking-widest"
                disabled={isLoading || !activeOrganizationName}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
              disabled={isLoading || codeInput.length !== 6 || !activeOrganizationName}
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Kód ellenőrzése
            </Button>
          </form>
        </Card>

        {usageDetails && (
          <Card className="mt-6 bg-black/50 border-cyan-500/30 backdrop-blur-sm text-white p-6 text-left">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-2xl text-cyan-300 flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Kupon adatok
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <p className="text-lg font-semibold text-white">{usageDetails.coupon.title}</p>
              <div className="flex items-center text-gray-300">
                <MapPin className="h-4 w-4 mr-2 text-purple-400" />
                Szervezet: <span className="ml-1 font-medium">{usageDetails.coupon.organization_name}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <User className="h-4 w-4 mr-2 text-purple-400" />
                Felhasználó neve: <span className="ml-1 font-medium">{userName}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <AtSign className="h-4 w-4 mr-2 text-purple-400" />
                Felhasználónév: <span className="ml-1 font-medium text-white">{usernameDisplay}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Clock className="h-4 w-4 mr-2 text-purple-400" />
                Generálva: <span className="ml-1 font-medium">{format(new Date(usageDetails.redeemed_at), 'yyyy. MM. dd. HH:mm:ss')}</span>
              </div>
              
              <div className="pt-4 flex justify-between space-x-4">
                <Button 
                  onClick={clearDetails}
                  variant="outline"
                  className="border-red-400 text-red-400 hover:bg-red-400/10 w-1/2"
                  disabled={isLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Mégsem
                </Button>
                <Button 
                  onClick={finalizeRedemption}
                  className="bg-red-600 hover:bg-red-700 w-1/2"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Beváltás Véglegesítése
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="mt-8">
          <Button asChild variant="outline" className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Vissza a főoldalra
            </Link>
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RedemptionPage;