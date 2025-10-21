import React, { useEffect } from 'react';
import { useCouponUsages } from '@/hooks/use-coupon-usages';
import { Loader2, Tag, User, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

const CouponUsagesPage = () => {
  const { usages, isLoading, fetchUsages, organizationName } = useCouponUsages();

  const getStatusBadge = (isUsed: boolean) => {
    if (isUsed) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/50 text-green-300">
          <CheckCircle className="h-3 w-3 mr-1" /> Beváltva
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-600/50 text-yellow-300">
        <Clock className="h-3 w-3 mr-1" /> Függőben (3 perc)
      </span>
    );
  };

  if (isLoading && usages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <p className="ml-3 text-gray-300">Beváltások betöltése...</p>
      </div>
    );
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
                  {usage.coupon?.title || 'Ismeretlen Kupon'}
                </CardTitle>
                {getStatusBadge(usage.is_used)}
              </CardHeader>
              <CardContent className="space-y-2 text-left text-sm">
                <div className="flex items-center text-gray-300">
                  <User className="h-4 w-4 mr-2 text-purple-400" />
                  Felhasználó ID: <span className="font-mono ml-1 text-cyan-300">{usage.user_id.slice(0, 8)}...</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Clock className="h-4 w-4 mr-2 text-purple-400" />
                  Beváltás ideje: <span className="ml-1 font-medium">{format(new Date(usage.redeemed_at), 'yyyy. MM. dd. HH:mm:ss')}</span>
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