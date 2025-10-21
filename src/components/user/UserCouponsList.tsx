import React from 'react';
import { useUserUsages, UserUsageRecord } from '@/hooks/use-user-usages';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Tag, Clock, CheckCircle, XCircle, MapPin, Calendar, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

const formatTimeLeft = (ms: number) => {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const UsageCard: React.FC<{ usage: UserUsageRecord }> = ({ usage }) => {
  const coupon = usage.coupon;
  
  if (!coupon) {
    return (
      <Card className="bg-black/50 border-red-500/30 backdrop-blur-sm text-white opacity-70">
        <CardHeader>
          <CardTitle className="text-xl text-red-400">Ismeretlen Kupon</CardTitle>
          <CardDescription className="text-gray-400">A kupon adatai nem elérhetők.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const statusClasses = {
    active: 'border-yellow-500/50 bg-yellow-900/20 hover:shadow-yellow-500/20',
    used: 'border-green-500/50 bg-green-900/20 opacity-70',
    expired: 'border-red-500/50 bg-red-900/20 opacity-50',
  };
  
  const statusBadge = (status: UserUsageRecord['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-600/50 text-yellow-300 animate-pulse">
            <Clock className="h-3 w-3 mr-1" /> Aktív: {formatTimeLeft(usage.timeLeftMs)}
          </span>
        );
      case 'used':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/50 text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" /> Beváltva
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-600/50 text-red-300">
            <XCircle className="h-3 w-3 mr-1" /> Lejárt
          </span>
        );
    }
  };

  return (
    <Card className={`bg-black/50 backdrop-blur-sm text-white transition-shadow duration-300 ${statusClasses[usage.status]}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-xl text-cyan-300">{coupon.title}</CardTitle>
        {statusBadge(usage.status)}
      </CardHeader>
      <CardContent className="space-y-3 text-left text-sm">
        <CardDescription className="text-gray-400">{coupon.description || 'Nincs leírás.'}</CardDescription>
        
        <div className="pt-2 border-t border-gray-700/50 space-y-2">
          <div className="flex items-center text-gray-300">
            <MapPin className="h-4 w-4 mr-2 text-purple-400" />
            Szervezet: <span className="font-semibold ml-1 text-white">{coupon.organization_name}</span>
          </div>
          
          <div className="flex items-center text-gray-300">
            <Tag className="h-4 w-4 mr-2 text-purple-400" />
            Beváltási kód: <span className="font-mono ml-1 text-white">{usage.redemption_code}</span>
          </div>
          
          <div className="flex items-center text-gray-300">
            <Calendar className="h-4 w-4 mr-2 text-purple-400" />
            Generálva: <span className="ml-1 font-medium">{format(new Date(usage.redeemed_at), 'yyyy. MM. dd. HH:mm')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const UserCouponsList: React.FC = () => {
  const { usages, isLoading, fetchUsages } = useUserUsages();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
        <p className="ml-3 text-gray-300">Kuponjaid betöltése...</p>
      </div>
    );
  }
  
  const activeUsages = usages.filter(u => u.status === 'active');
  const usedUsages = usages.filter(u => u.status === 'used');
  const expiredUsages = usages.filter(u => u.status === 'expired');
  
  const sortedUsages = [...activeUsages, ...usedUsages, ...expiredUsages];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-cyan-300 flex items-center gap-2">
          <Tag className="h-6 w-6" />
          Kuponjaim ({usages.length})
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

      {usages.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">Még nem generáltál beváltási kódot.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedUsages.map(usage => (
            <UsageCard key={usage.id} usage={usage} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserCouponsList;