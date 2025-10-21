import React, { useEffect, useState } from 'react';
import { useCoupons } from '@/hooks/use-coupons';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Calendar, Tag, Loader2, MapPin, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import CouponForm from './CouponForm';
import { format } from 'date-fns';
import { Coupon, CouponInsert } from '@/types/coupons';

interface CouponEditDialogProps {
  coupon: Coupon;
  onUpdate: (id: string, data: Partial<CouponInsert>) => Promise<{ success: boolean }>;
  isLoading: boolean;
}

const CouponEditDialog: React.FC<CouponEditDialogProps> = ({ coupon, onUpdate, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (data: CouponInsert) => {
    // We only send fields that might have changed, excluding organization_name
    const updateData: Partial<CouponInsert> = {
      title: data.title,
      description: data.description,
      image_url: data.image_url,
      expiry_date: data.expiry_date,
      max_uses_per_user: data.max_uses_per_user,
      total_max_uses: data.total_max_uses,
      // coupon_code is disabled in form, so we don't need to send it
    };
    
    const result = await onUpdate(coupon.id, updateData);
    if (result.success) {
      setIsOpen(false);
    }
    return result;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 opacity-70 hover:opacity-100 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/80 border-cyan-500/30 backdrop-blur-sm max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-cyan-300">Kupon szerkesztése</DialogTitle>
          <DialogDescription className="text-gray-400">
            Frissítsd a "{coupon.title}" kupon adatait.
          </DialogDescription>
        </DialogHeader>
        <CouponForm 
          onSubmit={handleSubmit} 
          onClose={() => setIsOpen(false)} 
          isLoading={isLoading}
          initialData={coupon}
        />
      </DialogContent>
    </Dialog>
  );
};


const CouponCard: React.FC<{ coupon: Coupon, onDelete: (id: string) => void, onUpdate: (id: string, data: Partial<CouponInsert>) => Promise<{ success: boolean }>, isLoading: boolean }> = ({ coupon, onDelete, onUpdate, isLoading }) => {
  const expiryDate = coupon.expiry_date ? format(new Date(coupon.expiry_date), 'yyyy. MM. dd. HH:mm') : 'Nincs beállítva';

  return (
    <Card className="bg-black/50 border-cyan-500/30 backdrop-blur-sm text-white hover:shadow-lg hover:shadow-cyan-500/20 transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-xl text-cyan-300">{coupon.title}</CardTitle>
        <div className="flex space-x-2">
          <CouponEditDialog coupon={coupon} onUpdate={onUpdate} isLoading={isLoading} />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="icon" className="h-8 w-8 opacity-70 hover:opacity-100">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/80 border-red-500/30 backdrop-blur-sm max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-red-400">Kupon törlése</DialogTitle>
                <DialogDescription className="text-gray-300">
                  Biztosan törölni szeretnéd a "{coupon.title}" kupont? Ez a művelet nem visszavonható.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="text-gray-300 border-gray-700 hover:bg-gray-800">Mégsem</Button>
                </DialogClose>
                <Button 
                  variant="destructive" 
                  onClick={() => onDelete(coupon.id)}
                >
                  Törlés megerősítése
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
          Kód: <span className="font-mono ml-1 text-cyan-300">{coupon.coupon_code}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-300">
          <Calendar className="h-4 w-4 mr-2 text-purple-400" />
          Lejárat: {expiryDate}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-300 pt-2 border-t border-gray-700/50">
          <div>Max/Felhasználó: <span className="font-semibold text-white">{coupon.max_uses_per_user}</span></div>
          <div>Összes Max: <span className="font-semibold text-white">{coupon.total_max_uses || '∞'}</span></div>
        </div>
      </CardContent>
    </Card>
  );
};

const CouponsPage = () => {
  const { coupons, isLoading, fetchCoupons, createCoupon, updateCoupon, deleteCoupon, organizationName } = useCoupons();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Removed useEffect: useCoupons now handles automatic fetching based on organizationName

  if (isLoading && coupons.length === 0) {
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

      {coupons.length === 0 && !isLoading ? (
        <p className="text-gray-400 text-center mt-10">Még nincsenek kuponok ehhez a szervezethez.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map(coupon => (
            <CouponCard 
              key={coupon.id} 
              coupon={coupon} 
              onDelete={deleteCoupon} 
              onUpdate={updateCoupon}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CouponsPage;