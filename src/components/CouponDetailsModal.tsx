import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, Calendar, Tag, MapPin, Coins, XCircle, Building, Loader2, Info, ArrowRight } from 'lucide-react';
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
      {/* DialogContent: Use max-w-lg for desktop, ensure full height on mobile for better UX */}
      <DialogContent className="bg-black/90 border-cyan-500/30 backdrop-blur-xl max-w-lg w-[95vw] md:w-full p-0 text-white overflow-hidden">
        
        {/* Scrollable Content Wrapper */}
        <div className="max-h-[90vh] overflow-y-auto">
            
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
            </div>
            
            <div className="p-6 pt-6 space-y-6">
                <DialogHeader>
                    <DialogTitle className="text-3xl text-cyan-300 mb-2">{coupon.title}</DialogTitle>
                    
                    {/* Organization Info & Link */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-700/50 pb-3">
                        <div className="flex items-center text-gray-400 pt-1 mb-3 sm:mb-0">
                            {/* Organization Logo */}
                            <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center border border-cyan-400 overflow-hidden mr-2">
                                {coupon.logo_url ? (
                                    <img 
                                        src={coupon.logo_url} 
                                        alt={coupon.organization_name} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Building className="h-3 w-3 text-cyan-400" />
                                )}
                            </div>
                            <span className="text-lg font-semibold text-white">{coupon.organization_name}</span>
                        </div>
                        
                        {/* Organization Profile Button */}
                        <Button 
                            asChild
                            variant="outline"
                            size="sm"
                            className="border-purple-400 text-purple-400 hover:bg-purple-400/10"
                        >
                            <Link to={`/organization/${coupon.organization_name}`} onClick={onClose}>
                                Profil <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </DialogHeader>

                {/* Full Description - Scrollable and Responsive Text Wrapping */}
                <div className="space-y-3 max-h-40 overflow-y-auto pr-4 border border-gray-800/50 p-3 rounded-lg">
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Info className="h-5 w-5 text-purple-400" />
                        Teljes leírás:
                    </h4>
                    <p className="text-gray-300 whitespace-normal break-words text-sm">
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
                        Költség: <span className="font-semibold ml-1 text-white">{coupon.points_cost}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                        <Coins className="h-4 w-4 mr-2 text-purple-400" />
                        Jutalom: <span className="font-semibold ml-1 text-white">{coupon.points_reward}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <Button 
                    onClick={() => onRedeemClick(coupon)}
                    className={`w-full text-white px-6 py-3 text-lg ${coupon.is_code_required 
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CouponDetailsModal;