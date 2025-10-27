import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, Calendar, Tag, MapPin, Coins, XCircle, Building, Loader2 } from 'lucide-react';
import { Coupon } from '@/types/coupons';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface CouponDetailsModalProps {
  coupon: Coupon & { logo_url: string | null };
  isOpen: boolean;
  onClose: () => void;
  onRedeemClick: (coupon: Coupon) => void;
  isRedeeming: boolean;
  isDisabled: boolean;
  buttonText: string;
}

const CouponDetailsModal: React.FC<CouponDetailsModalProps> = ({ 
    coupon, 
    isOpen, 
    onClose, 
    onRedeemClick, 
    isRedeeming, 
    isDisabled,
    buttonText
}) => {
  const expiryDate = coupon.expiry_date ? format(new Date(coupon.expiry_date), 'yyyy. MM. dd.') : 'Nincs beállítva';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 border-cyan-500/30 backdrop-blur-xl max-w-lg p-0 text-white">
        
        {/* Image Header */}
        <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
            {coupon.image_url ? (
                <img 
                    src={coupon.image_url} 
                    alt={coupon.title} 
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <Gift className="h-12 w-12 text-cyan-400" />
                </div>
            )}
            
            {/* Organization Logo Overlay */}
            <div className="absolute bottom-[-20px] left-4">
                <Link 
                    to={`/organization/${coupon.organization_name}`}
                    className="relative w-16 h-16 rounded-full bg-gray-900 p-1 border-4 border-cyan-400 shadow-lg group hover:scale-105 transition-transform duration-300"
                >
                    {coupon.logo_url ? (
                        <img 
                            src={coupon.logo_url} 
                            alt={coupon.organization_name} 
                            className="h-full w-full rounded-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full rounded-full bg-gray-800 flex items-center justify-center">
                            <Building className="h-8 w-8 text-cyan-400" />
                        </div>
                    )}
                </Link>
            </div>
        </div>
        
        <div className="p-6 pt-8 space-y-6">
            <DialogHeader>
                <DialogTitle className="text-3xl text-cyan-300">{coupon.title}</DialogTitle>
                <DialogDescription className="text-gray-400 flex items-center pt-1">
                    <MapPin className="h-4 w-4 mr-2" /> {coupon.organization_name}
                </DialogDescription>
            </DialogHeader>

            {/* Full Description - Added max-h-40 and overflow-y-auto for scrolling */}
            <div className="space-y-3 max-h-40 overflow-y-auto pr-4"> {/* Increased pr-4 for scrollbar */}
                <h4 className="text-lg font-semibold text-white">Teljes leírás:</h4>
                <p className="text-gray-300 whitespace-pre-wrap">
                    {coupon.description && coupon.description.trim() !== '' ? coupon.description : 'Nincs részletes leírás megadva.'}
                </p>
            </div>
            
            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-700/50 py-4 text-sm">
                <div className="flex items-center text-gray-300">
                    <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                    Lejárat: <span className="font-semibold ml-1 text-white">{expiryDate}</span>
                </div>
                <div className="flex items-center text-gray-300">
                    <Tag className="h-4 w-4 mr-2 text-purple-400" />
                    Max/Felhasználó: <span className="font-semibold ml-1 text-white">{coupon.max_uses_per_user}</span>
                </div>
                <div className="flex items-center text-gray-300">
                    <Coins className="h-4 w-4 mr-2 text-purple-400" />
                    Költség: <span className="font-semibold ml-1 text-white">{coupon.points_cost} pont</span>
                </div>
                <div className="flex items-center text-gray-300">
                    <Coins className="h-4 w-4 mr-2 text-purple-400" />
                    Jutalom: <span className="font-semibold ml-1 text-white">{coupon.points_reward} pont</span>
                </div>
            </div>

            {/* Action Button (Passed from parent) */}
            <Button 
                onClick={() => onRedeemClick(coupon)}
                className={`w-full text-white ${coupon.is_code_required 
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600' 
                    : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600'}`}
                disabled={isDisabled || isRedeeming}
            >
                {isRedeeming ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {buttonText}
            </Button>
            
            <Button 
                onClick={onClose}
                variant="outline"
                className="w-full border-gray-700 text-gray-400 hover:bg-gray-800"
            >
                <XCircle className="h-4 w-4 mr-2" />
                Bezárás
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CouponDetailsModal;