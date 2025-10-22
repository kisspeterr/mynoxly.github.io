import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, Tag, Loader2, Pencil, Archive, Power, AlertTriangle } from 'lucide-react';
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
      points_reward: data.points_reward,
      points_cost: data.points_cost,
      is_code_required: data.is_code_required,
      // coupon_code is disabled in form if required, so we don't need to send it
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
    onArchive: (id: string) => Promise<{ success: boolean }>;
    onUpdate: (id: string, data: Partial<CouponInsert>) => Promise<{ success: boolean }>;
    onToggleActive: (id: string, currentStatus: boolean) => Promise<{ success: boolean }>;
    isLoading: boolean;
}

const CouponCard: React.FC<CouponCardProps> = ({ coupon, onArchive, onUpdate, onToggleActive, isLoading }) => {
  const expiryDate = coupon.expiry_date ? format(new Date(coupon.expiry_date), 'yyyy. MM. dd. HH:mm') : 'Nincs beállítva';
  const isActive = coupon.is_active;

  const handleArchive = () => {
    onArchive(coupon.id);
  };
  
  const handleToggle = () => {
    onToggleActive(coupon.id, isActive);
  };

  return (
    <Card className={`bg-black/50 border-cyan-500/30 backdrop-blur-sm text-white transition-shadow duration-300 ${!isActive ? 'opacity-70 border-yellow-500/30' : 'hover:shadow-lg hover:shadow-cyan-500/20'}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className={`text-xl ${isActive ? 'text-cyan-300' : 'text-yellow-300'}`}>{coupon.title}</CardTitle>
        <div className="flex space-x-2">
          
          {/* Toggle Active Status Button */}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleToggle}
            disabled={isLoading}
            className={`h-8 w-8 opacity-70 hover:opacity-100 transition-all duration-300 ${
                isActive 
                    ? 'border-red-500/50 text-red-400 hover:bg-red-500/10' 
                    : 'border-green-500/50 text-green-400 hover:bg-green-500/10'
            }`}
          >
            <Power className="h-4 w-4" />
          </Button>
          
          <CouponEditDialog coupon={coupon} onUpdate={onUpdate} isLoading={isLoading} />
          
          {/* Archive Dialog (Replaces Delete) */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="icon" className="h-8 w-8 opacity-70 hover:opacity-100 bg-red-800/50 hover:bg-red-700/50">
                <Archive className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/80 border-red-500/30 backdrop-blur-sm max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-red-400 flex items-center gap-2">
                    <Archive className="h-6 w-6" /> Kupon Archiválása
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  Biztosan archiválni szeretnéd a "{coupon.title}" kupont? Ez eltávolítja a főoldalról.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="text-gray-300 border-gray-700 hover:bg-gray-800">Mégsem</Button>
                </DialogClose>
                <Button 
                  variant="destructive" 
                  onClick={handleArchive}
                  disabled={isLoading}
                >
                  Archiválás megerősítése
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
          Kód: <span className="font-mono ml-1 text-cyan-300">{coupon.coupon_code || 'Azonnali'}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-300">
          <Calendar className="h-4 w-4 mr-2 text-purple-400" />
          Lejárat: {expiryDate}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-300 pt-2 border-t border-gray-700/50">
          <div>Max/Felhasználó: <span className="font-semibold text-white">{coupon.max_uses_per_user}</span></div>
          <div>Összes Max: <span className="font-semibold text-white">{coupon.total_max_uses || '∞'}</span></div>
        </div>
        
        <div className={`text-sm font-semibold pt-2 ${isActive ? 'text-green-400' : 'text-yellow-400'}`}>
            <Power className="h-4 w-4 mr-1 inline-block" /> Státusz: {isActive ? 'Aktív' : 'Inaktív'}
        </div>
      </CardContent>
    </Card>
  );
};

export default CouponCard;