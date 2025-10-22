import React from 'react';
import { useCoupons } from '@/hooks/use-coupons';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, Tag, Loader2, ArchiveRestore, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Coupon } from '@/types/coupons';

interface ArchivedCouponCardProps {
  coupon: Coupon;
  onUnarchive: (id: string) => Promise<{ success: boolean }>;
  onPermanentDelete: (id: string) => Promise<{ success: boolean }>;
  isLoading: boolean;
}

const ArchivedCouponCard: React.FC<ArchivedCouponCardProps> = ({ coupon, onUnarchive, onPermanentDelete, isLoading }) => {
  const expiryDate = coupon.expiry_date ? format(new Date(coupon.expiry_date), 'yyyy. MM. dd. HH:mm') : 'Nincs beállítva';

  return (
    <Card className="bg-black/50 border-red-500/30 backdrop-blur-sm text-white opacity-80">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-xl text-red-300 flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            {coupon.title}
        </CardTitle>
        <div className="flex space-x-2">
          {/* Unarchive Button */}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onUnarchive(coupon.id)}
            disabled={isLoading}
            className="h-8 w-8 opacity-70 hover:opacity-100 border-green-500/50 text-green-300 hover:bg-green-500/10"
          >
            <ArchiveRestore className="h-4 w-4" />
          </Button>
          
          {/* Permanent Delete Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="icon" className="h-8 w-8 opacity-70 hover:opacity-100">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/80 border-red-500/30 backdrop-blur-sm max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6" /> Végleges Törlés
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  Biztosan véglegesen törölni szeretnéd a "{coupon.title}" kupont? Ez a művelet **NEM** visszavonható.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="text-gray-300 border-gray-700 hover:bg-gray-800">Mégsem</Button>
                </DialogClose>
                <Button 
                  variant="destructive" 
                  onClick={() => onPermanentDelete(coupon.id)}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 'Végleges Törlés'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription className="text-gray-400">{coupon.description || 'Nincs leírás.'}</CardDescription>
        
        <div className="flex items-center text-sm text-gray-300">
          <Tag className="h-4 w-4 mr-2 text-purple-400" />
          Kód: <span className="font-mono ml-1 text-red-300">{coupon.coupon_code || 'Nincs kód'}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-300">
          <Calendar className="h-4 w-4 mr-2 text-purple-400" />
          Lejárat: {expiryDate}
        </div>
      </CardContent>
    </Card>
  );
};

const ArchivedCouponsList: React.FC = () => {
  const { archivedCoupons, isLoading, unarchiveCoupon, permanentDeleteCoupon, fetchCoupons } = useCoupons();

  if (isLoading && archivedCoupons.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-red-400" />
        <p className="ml-3 text-gray-300">Archivált kuponok betöltése...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-red-300 mb-6 flex items-center gap-2">
        <ArchiveRestore className="h-6 w-6" />
        Archivált Kuponok ({archivedCoupons.length})
      </h3>
      
      {archivedCoupons.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">Nincsenek archivált kuponok.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archivedCoupons.map(coupon => (
            <ArchivedCouponCard 
              key={coupon.id} 
              coupon={coupon} 
              onUnarchive={unarchiveCoupon}
              onPermanentDelete={permanentDeleteCoupon}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivedCouponsList;