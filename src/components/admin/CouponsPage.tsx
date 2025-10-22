import React, { useEffect, useState } from 'react';
import { useCoupons } from '@/hooks/use-coupons';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Calendar, Tag, Loader2, MapPin, Pencil, CheckCircle, XCircle, Archive, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import CouponForm from './CouponForm';
import { format } from 'date-fns';
import { Coupon, CouponInsert } from '@/types/coupons';
import { Badge } from '@/components/ui/badge';

interface CouponEditDialogProps {
  coupon: Coupon;
  onUpdate: (id: string, data: Partial<CouponInsert>) => Promise<{ success: boolean }>;
  isLoading: boolean;
}

const CouponEditDialog: React.FC<CouponEditDialogProps> = ({ coupon, onUpdate, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (data: CouponInsert) => {
    // We only send fields that might have changed, excluding organization_name, is_active, is_archived
    const updateData: Partial<CouponInsert> = {
      title: data.title,
      description: data.description,
      image_url: data.image_url,
      expiry_date: data.expiry_date,
      max_uses_per_user: data.max_uses_per_user,
      total_max_uses: data.total_max_uses,
      points_reward: data.points_reward,
      points_cost: data.points_cost,
      is_code_required: data.is_code_required,
      coupon_code: data.coupon_code,
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


interface CouponCardProps {
  coupon: Coupon;
  onToggleActive: (id: string, currentStatus: boolean) => Promise<{ success: boolean }>;
  onArchive: (id: string) => Promise<{ success: boolean }>;
  onDelete: (id: string, isArchived: boolean) => Promise<{ success: boolean }>;
  onUpdate: (id: string, data: Partial<CouponInsert>) => Promise<{ success: boolean }>;
  isLoading: boolean;
}

const CouponCard: React.FC<CouponCardProps> = ({ coupon, onToggleActive, onArchive, onDelete, onUpdate, isLoading }) => {
  const expiryDate = coupon.expiry_date ? format(new Date(coupon.expiry_date), 'yyyy. MM. dd.') : 'Nincs beállítva';
  const isArchived = coupon.is_archived;
  const isActive = coupon.is_active;
  
  const statusBadge = () => {
    if (isArchived) {
      return <Badge className="bg-gray-600 text-white">Archiválva</Badge>;
    }
    if (isActive) {
      return <Badge className="bg-green-600 text-white">Aktív</Badge>;
    }
    return <Badge className="bg-red-600 text-white">Inaktív</Badge>;
  };
  
  const statusClasses = isArchived ? 'opacity-50 border-gray-700/50' : isActive ? 'border-cyan-500/30' : 'border-red-500/30';

  return (
    <Card className={`bg-black/50 backdrop-blur-sm text-white transition-shadow duration-300 ${statusClasses}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-xl text-cyan-300">{coupon.title}</CardTitle>
        {statusBadge()}
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription className="text-gray-400">{coupon.description || 'Nincs leírás.'}</CardDescription>
        
        <div className="flex items-center text-sm text-gray-300">
          <Tag className="h-4 w-4 mr-2 text-purple-400" />
          Kód: <span className="font-mono ml-1 text-cyan-300">{coupon.coupon_code || 'Azonnali beváltás'}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-300">
          <Calendar className="h-4 w-4 mr-2 text-purple-400" />
          Lejárat: {expiryDate}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-300 pt-2 border-t border-gray-700/50">
          <div>Max/Felhasználó: <span className="font-semibold text-white">{coupon.max_uses_per_user}</span></div>
          <div>Összes Max: <span className="font-semibold text-white">{coupon.total_max_uses || '∞'}</span></div>
        </div>
        
        {/* Actions */}
        <div className="flex space-x-2 pt-4 border-t border-gray-700/50">
          <CouponEditDialog coupon={coupon} onUpdate={onUpdate} isLoading={isLoading} />
          
          {/* Toggle Active/Deactivate Button (Only if not archived) */}
          {!isArchived && (
            <Button 
              variant={isActive ? 'destructive' : 'default'} 
              size="icon" 
              onClick={() => onToggleActive(coupon.id, isActive)}
              disabled={isLoading}
              className={`h-8 w-8 ${isActive ? 'bg-red-600/50 hover:bg-red-600/70' : 'bg-green-600/50 hover:bg-green-600/70'}`}
            >
              {isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            </Button>
          )}
          
          {/* Archive Button (Only if not archived) */}
          {!isArchived && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 border-gray-500/50 text-gray-400 hover:bg-gray-500/10">
                  <Archive className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/80 border-gray-500/30 backdrop-blur-sm max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-gray-400">Kupon archiválása</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Biztosan archiválni szeretnéd a "{coupon.title}" kupont? Ez inaktiválja és elrejti a nyilvános nézetből.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" className="text-gray-300 border-gray-700 hover:bg-gray-800">Mégsem</Button>
                  </DialogClose>
                  <Button 
                    variant="default" 
                    onClick={() => onArchive(coupon.id)}
                    disabled={isLoading}
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    Archiválás megerősítése
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          {/* Permanent Delete Button (Only if archived) */}
          {isArchived && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="icon" className="h-8 w-8">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/80 border-red-500/30 backdrop-blur-sm max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-red-400">Végleges törlés</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Biztosan VÉGLEGESEN törölni szeretnéd a "{coupon.title}" archivált kupont? Ez a művelet nem visszavonható.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" className="text-gray-300 border-gray-700 hover:bg-gray-800">Mégsem</Button>
                  </DialogClose>
                  <Button 
                    variant="destructive" 
                    onClick={() => onDelete(coupon.id, true)}
                    disabled={isLoading}
                  >
                    Végleges Törlés
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const CouponsPage = () => {
  const { coupons, isLoading, fetchCoupons, createCoupon, updateCoupon, toggleActiveStatus, archiveCoupon, deleteCoupon, organizationName } = useCoupons();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const activeAndInactiveCoupons = coupons.filter(c => !c.is_archived);
  const archivedCoupons = coupons.filter(c => c.is_archived);

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
        <div className="flex space-x-3">
            <Button 
                onClick={fetchCoupons} 
                variant="outline" 
                size="icon"
                className="border-gray-700 text-gray-400 hover:bg-gray-800"
                disabled={isLoading}
            >
                <RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            </Button>
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
      </div>

      <div className="mb-6 p-4 bg-purple-900/50 rounded-lg border border-purple-500/50 flex items-center gap-3">
        <MapPin className="h-5 w-5 text-purple-300" />
        <p className="text-gray-300">
          Szervezet: <span className="font-semibold text-white">{organizationName || 'Nincs beállítva'}</span>
        </p>
      </div>
      
      {/* Active and Inactive Coupons */}
      <h3 className="text-2xl font-bold text-cyan-300 mb-4">Aktív és Inaktív Kuponok ({activeAndInactiveCoupons.length})</h3>
      {activeAndInactiveCoupons.length === 0 && !isLoading ? (
        <p className="text-gray-400 text-center mt-10 mb-12">Még nincsenek aktív vagy inaktív kuponok ehhez a szervezethez.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {activeAndInactiveCoupons.map(coupon => (
            <CouponCard 
              key={coupon.id} 
              coupon={coupon} 
              onDelete={deleteCoupon} 
              onUpdate={updateCoupon}
              onArchive={archiveCoupon}
              onToggleActive={toggleActiveStatus}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
      
      {/* Archived Coupons */}
      <h3 className="text-2xl font-bold text-gray-400 mb-4 flex items-center gap-2">
        <Archive className="h-5 w-5" /> Archivált Kuponok ({archivedCoupons.length})
      </h3>
      {archivedCoupons.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">Nincsenek archivált kuponok.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archivedCoupons.map(coupon => (
            <CouponCard 
              key={coupon.id} 
              coupon={coupon} 
              onDelete={deleteCoupon} 
              onUpdate={updateCoupon}
              onArchive={archiveCoupon}
              onToggleActive={toggleActiveStatus}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CouponsPage;