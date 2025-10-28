import React, { useEffect } from 'react';
import { useCouponUsages } from '@/hooks/use-coupon-usages';
import { Loader2, Tag, User, Clock, CheckCircle, XCircle, RefreshCw, AtSign, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import UsageCountdown from './UsageCountdown'; // Import the new component
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import UnauthorizedAccess from '@/components/UnauthorizedAccess';

const CouponUsagesPage = () => {
  const { usages, isLoading, fetchUsages, organizationName } = useCouponUsages();
  const { checkPermission, activeOrganizationProfile } = useAuth();
  
  const canViewUsages = checkPermission('viewer') || checkPermission('redemption_agent') || checkPermission('coupon_manager') || checkPermission('event_manager');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Érvénytelen dátum';
    }
    return format(date, 'yyyy. MM. dd. HH:mm:ss');
  };
  
  if (!activeOrganizationProfile) {
    return (
        <Card className="text-center p-10 bg-gray-800/50 rounded-lg border border-red-500/30 mt-6">
            <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-300 mb-2">Nincs aktív szervezet</h3>
            <p className="text-gray-400">Kérjük, válassz egy szervezetet a Dashboard tetején a beváltások megtekintéséhez.</p>
        </Card>
    );
  }
  
  if (!canViewUsages) {
      return <p className="text-red-400 text-center mt-10">Nincs jogosultságod a beváltások megtekintéséhez.</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-cyan-300 flex items-center gap-2">
          <Tag className="h-6 w-6" />
          Kupon Beváltások
        </h2>
        <Button 
          onClick={fetchUsages} 
          variant="outline"
          size="icon"
          className="border-gray-700 text-gray-400 hover:bg-gray-800"
          disabled={isLoading}
        >
          <RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
        </Button>
      </div>

      {usages.length === 0 && !isLoading ? (
        <p className="text-gray-400 text-center mt-10">Még nem történt beváltás ehhez a szervezethez.</p>
      ) : (
        <div className="space-y-4">
          {usages.map(usage => (
            <Card 
              key={usage.id} 
              className={`bg-black/50 backdrop-blur-sm text-white transition-shadow duration-300 ${usage.is_used ? 'border-green-500/30' : 'border-yellow-500/30'}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl text-white">
                  {/* Robust check for coupon title */}
                  {usage.coupon?.title || 'Ismeretlen Kupon'}
                </CardTitle>
                {/* UsageCountdown expects a string for redeemedAt, which is now guaranteed by the hook's filtering */}
                <UsageCountdown 
                  redeemedAt={usage.redeemed_at as string} 
                  isUsed={usage.is_used} 
                />
              </CardHeader>
              <CardContent className="space-y-2 text-left text-sm">
                <div className="flex items-center text-gray-300">
                  <AtSign className="h-4 w-4 mr-2 text-purple-400" />
                  Felhasználó: <span className="font-mono ml-1 text-cyan-300">@{usage.profile?.username || usage.user_id.slice(0, 8) + '...'}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Clock className="h-4 w-4 mr-2 text-purple-400" />
                  Beváltás ideje: <span className="ml-1 font-medium">{formatDate(usage.redeemed_at as string)}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Tag className="h-4 w-4 mr-2 text-purple-400" />
                  Beváltási kód: <span className="font-mono ml-1 text-white">{usage.redemption_code}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CouponUsagesPage;