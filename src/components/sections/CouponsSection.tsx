import React, { useState } from 'react';
import { Gift, Loader2, LogIn, Building, QrCode, CheckCircle, Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePublicCoupons } from '@/hooks/use-public-coupons';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'react-router-dom';
import RedemptionModal from '@/components/RedemptionModal';
import CouponDetailsModal from '@/components/CouponDetailsModal';
import { showError } from '@/utils/toast';
import { Coupon } from '@/types/coupons';
import { useLoyaltyPoints } from '@/hooks/use-loyalty-points';

// Extend Coupon type to include organization profile data and usage count
interface PublicCoupon extends Coupon {
  logo_url: string | null;
  usage_count: number;
}

const CouponsSection = () => {
  const { 
    coupons, 
    isLoading, 
    redeemCoupon, 
    isCouponUsedUp, 
    isCouponPending, 
    refreshUsages, 
  } = usePublicCoupons();
  const { isAuthenticated } = useAuth();
  const { points, isLoading: isLoadingPoints, getPointsForOrganization } = useLoyaltyPoints();
  
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isRedemptionModalOpen, setIsRedemptionModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<PublicCoupon | null>(null);
  const [currentUsageId, setCurrentUsageId] = useState<string | undefined>(undefined);
  const [currentRedemptionCode, setCurrentRedemptionCode] = useState<string | undefined>(undefined);

  // Helper function to calculate redemption status for a given coupon
  const getRedemptionStatus = (coupon: PublicCoupon) => {
    const usedUp = isAuthenticated && isCouponUsedUp(coupon.id, coupon.max_uses_per_user);
    const pending = isAuthenticated && coupon.is_code_required && isCouponPending(coupon.id);
    
    const isPointCoupon = coupon.points_cost > 0;
    let canRedeem = true;
    let pointStatusText = '';
    
    if (isAuthenticated && isPointCoupon) {
        const organizationRecord = points.find(p => p.profile.organization_name === coupon.organization_name);
        const organizationId = organizationRecord?.organization_id;
        const currentPoints = organizationId ? getPointsForOrganization(organizationId) : 0;
        
        if (currentPoints < coupon.points_cost) {
            canRedeem = false;
            pointStatusText = `Nincs elegendő pont (${currentPoints}/${coupon.points_cost})`;
        }
    }
    
    const isDisabled = usedUp || pending || isRedeeming || !canRedeem;
    
    let buttonText = coupon.is_code_required ? 'Kód generálása' : 'Beváltás';
    if (isRedeeming) {
        buttonText = 'Feldolgozás...';
    } else if (usedUp) {
        buttonText = `Limit elérve (${coupon.max_uses_per_user} / ${coupon.max_uses_per_user})`;
    } else if (!canRedeem) {
        buttonText = pointStatusText;
    } else if (pending) {
        buttonText = 'Aktív kód';
    }
    
    const buttonClasses = coupon.is_code_required 
      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600' 
      : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600';
      
    return { isDisabled, buttonText, buttonClasses, usedUp, pending, canRedeem };
  };

  const handleRedeemClick = async (coupon: PublicCoupon, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (!isAuthenticated) {
      showError('Kérjük, jelentkezz be a kupon beváltásához.');
      return;
    }
    
    if (isRedeeming) return;

    const { isDisabled: preCheckDisabled } = getRedemptionStatus(coupon);
    if (preCheckDisabled) {
        showError(getRedemptionStatus(coupon).buttonText);
        return;
    }

    setIsRedeeming(true);
    try {
      const result = await redeemCoupon(coupon);

      if (result.success) {
        if (coupon.is_code_required && result.usageId && result.redemptionCode) {
            setSelectedCoupon(coupon);
            setCurrentUsageId(result.usageId);
            setCurrentRedemptionCode(result.redemptionCode);
            setIsRedemptionModalOpen(true);
        }
      }
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleRedemptionModalClose = async (wasRedeemed: boolean = false) => {
    setIsRedemptionModalOpen(false);
    setSelectedCoupon(null);
    setCurrentUsageId(undefined);
    setCurrentRedemptionCode(undefined);
    refreshUsages();
  };
  
  const openDetailsModal = (coupon: PublicCoupon) => {
      setSelectedCoupon(coupon);
      setIsDetailsModalOpen(true);
  };
  
  const closeDetailsModal = () => {
      setIsDetailsModalOpen(false);
      setSelectedCoupon(null);
  };
  
  const modalProps = selectedCoupon ? getRedemptionStatus(selectedCoupon) : { isDisabled: false, buttonText: '', buttonClasses: '', usedUp: false, pending: false, canRedeem: true };


  return (
    <section id="coupons-section" className="py-12 px-6">
      <div className="container mx-auto text-center">
        <Badge className="mb-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0">
          <Gift className="h-4 w-4 mr-2" />
          Aktuális Kuponok
        </Badge>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-cyan-300">
          Spórolj az estéden!
        </h2>
        
        <p className="text-xl text-gray-300 text-center mb-16 max-w-2xl mx-auto">
          Fedezd fel Pécs legjobb akcióit. Jelentkezz be a beváltáshoz!
        </p>

        {(isLoading || isLoadingPoints) ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            <p className="ml-3 text-gray-300">Kuponok betöltése...</p>
          </div>
        ) : coupons.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">Jelenleg nincsenek aktív kuponok.</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-8">
            {coupons.map((coupon) => {
              const { isDisabled, usedUp, pending } = getRedemptionStatus(coupon);
              const logoUrl = (coupon as PublicCoupon).logo_url;
              
              return (
                <div 
                    key={coupon.id} 
                    className={`relative w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1.33rem)] max-w-sm transition-all duration-300 ${isDisabled ? 'opacity-60 grayscale' : 'hover:scale-[1.02]'}`}
                >
                    
                    <Card 
                      className={`bg-black/50 border-cyan-500/30 backdrop-blur-sm text-white transition-shadow duration-300 flex flex-col w-full cursor-pointer ${isDisabled ? '' : 'hover:shadow-lg hover:shadow-cyan-500/20'}`}
                      onClick={() => openDetailsModal(coupon)}
                    >
                      
                      {/* Card Content starts below the space reserved for the logo */}
                      <div className="relative w-full aspect-video overflow-hidden rounded-t-xl">
                        {/* Banner Image (16:9 aspect ratio) - object-cover ensures fixed ratio and no excessive zoom */}
                        {coupon.image_url ? (
                          <img 
                            src={coupon.image_url} 
                            alt={coupon.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <Gift className="h-12 w-12 text-cyan-400" />
                          </div>
                        )}
                        
                        {/* Organization Info Overlay (Top Left & Center) */}
                        <div className="absolute inset-0 z-10 pointer-events-none">
                            {/* Logo (Top Left) */}
                            <Link 
                                to={`/organization/${coupon.organization_name}`}
                                className="absolute top-3 left-3 z-20 flex items-center p-0.5 bg-black/50 rounded-full backdrop-blur-sm border border-cyan-400/50 transition-all duration-300 pointer-events-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-900 p-0.5 border border-cyan-400 overflow-hidden flex-shrink-0">
                                    {logoUrl ? (
                                        <img 
                                            src={logoUrl} 
                                            alt={coupon.organization_name} 
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        <div className="h-full w-full rounded-full bg-gray-800 flex items-center justify-center">
                                            <Building className="h-4 w-4 text-cyan-400" />
                                        </div>
                                    )}
                                </div>
                            </Link>
                            
                            {/* Organization Name (Center Top) */}
                            <Link 
                                to={`/organization/${coupon.organization_name}`}
                                className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20 text-sm font-bold text-white p-2 bg-black/50 rounded-lg backdrop-blur-sm border border-cyan-400/50 transition-all duration-300 hover:text-cyan-300 pointer-events-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {coupon.organization_name}
                            </Link>
                        </div>
                        
                        {/* Overlay Content (Top Right - Status Badge) */}
                        <div className="absolute top-3 right-3 p-1 flex items-start justify-end z-10">
                            {pending ? (
                                <Badge className="bg-yellow-600/70 text-white flex items-center gap-1">
                                    <QrCode className="h-3 w-3" /> Aktív kód
                                </Badge>
                            ) : usedUp ? (
                                <Badge className="bg-red-600/70 text-white flex items-center gap-1">
                                    Limit elérve
                                </Badge>
                            ) : coupon.points_cost > 0 ? (
                                <Badge className="bg-red-600/70 text-white flex items-center gap-1">
                                    <Coins className="h-3 w-3" /> -{coupon.points_cost}
                                </Badge>
                            ) : coupon.points_reward > 0 ? (
                                <Badge className="bg-green-600/70 text-white flex items-center gap-1">
                                    <Coins className="h-3 w-3" /> +{coupon.points_reward}
                                </Badge>
                            ) : null}
                        </div>
                        
                        {/* Title Overlay (Bottom Left) */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent z-10">
                            <CardTitle className="text-lg text-white text-left truncate">{coupon.title}</CardTitle>
                        </div>
                      </div>
                      
                      {/* Card Content (Button) */}
                      <CardContent className="p-3 text-center">
                        <Button 
                            onClick={() => openDetailsModal(coupon)}
                            variant="outline"
                            className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                        >
                            <Gift className="h-4 w-4 mr-2" /> Részletek & Beváltás
                        </Button>
                      </CardContent>
                    </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Redemption Modal (3-minute code) */}
      {selectedCoupon && selectedCoupon.is_code_required && currentUsageId && currentRedemptionCode && (
        <RedemptionModal 
          coupon={selectedCoupon}
          usageId={currentUsageId}
          redemptionCode={currentRedemptionCode}
          isOpen={isRedemptionModalOpen}
          onClose={handleRedemptionModalClose}
        />
      )}
      
      {/* Details Modal (Full description) */}
      {selectedCoupon && (
          <CouponDetailsModal
            coupon={selectedCoupon}
            isOpen={isDetailsModalOpen}
            onClose={closeDetailsModal}
            onRedeemClick={handleRedeemClick}
            isRedeeming={isRedeeming}
            isDisabled={modalProps.isDisabled}
            buttonText={modalProps.buttonText}
          />
      )}
    </section>
  );
};

export default CouponsSection;