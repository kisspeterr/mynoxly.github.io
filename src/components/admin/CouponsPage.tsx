import React, { useState } from 'react';
import { useCoupons } from '@/hooks/use-coupons';
import { Button } from '@/components/ui/button';
import { PlusCircle, Tag, Loader2, MapPin, Archive, Gift } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CouponForm from './CouponForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CouponCard from './CouponCard'; // Import the new card component
import ArchivedCouponsList from './ArchivedCouponsList'; // Import the new archived list

const CouponsPage = () => {
  const { 
    coupons, 
    archivedCoupons, 
    isLoading, 
    createCoupon, 
    updateCoupon, 
    archiveCoupon, 
    toggleActiveStatus, 
    organizationName 
  } = useCoupons();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  if (isLoading && coupons.length === 0 && archivedCoupons.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <p className="ml-3 text-gray-300">Kuponok betöltése...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-cyan-300 flex items-center gap-2">
          <Tag className="h-6 w-6" />
          Kupon Kezelés
        </h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <PlusCircle className="h-4 w-4 mr-2" />
              Új Kupon
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/80 border-cyan-500/30 backdrop-blur-sm max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-cyan-300">Új Kupon Létrehozása</DialogTitle>
              <DialogDescription className="text-gray-400">
                Hozd létre az új akciót a {organizationName} számára.
              </DialogDescription>
            </DialogHeader>
            <CouponForm 
              onSubmit={createCoupon} 
              onClose={() => setIsFormOpen(false)} 
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 p-4 bg-purple-900/50 rounded-lg border border-purple-500/50 flex items-center gap-3">
        <MapPin className="h-5 w-5 text-purple-300" />
        <p className="text-gray-300">
          Szervezet: <span className="font-semibold text-white">{organizationName || 'Nincs beállítva'}</span>
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-gray-700/50 h-auto p-1 mb-6">
          <TabsTrigger value="active" className="data-[state=active]:bg-cyan-600/50 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 py-2 text-base">
            <Gift className="h-4 w-4 mr-2" /> Aktív Kuponok ({coupons.length})
          </TabsTrigger>
          <TabsTrigger value="archived" className="data-[state=active]:bg-red-600/50 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-red-400 py-2 text-base">
            <Archive className="h-4 w-4 mr-2" /> Archivált Kuponok ({archivedCoupons.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {coupons.length === 0 && !isLoading ? (
            <p className="text-gray-400 text-center mt-10">Még nincsenek aktív kuponok ehhez a szervezethez.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map(coupon => (
                <CouponCard 
                  key={coupon.id} 
                  coupon={coupon} 
                  onArchive={archiveCoupon} 
                  onUpdate={updateCoupon}
                  onToggleActive={toggleActiveStatus}
                  isLoading={isLoading}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="archived">
          <ArchivedCouponsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CouponsPage;