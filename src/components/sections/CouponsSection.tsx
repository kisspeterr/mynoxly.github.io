import React, { useState } from 'react';
import { Gift, Tag, Loader2, LogIn, CheckCircle, Calendar, Clock, User, Building, BarChart2, Coins, QrCode, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePublicCoupons } from '@/hooks/use-public-coupons';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import RedemptionModal from '@/components/RedemptionModal';
import CouponDetailsModal from '@/components/CouponDetailsModal'; // NEW IMPORT
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
    deletePendingUsage 
  } = usePublicCoupons();
  const { isAuthenticated, profile } = useAuth();
  const { points, isLoading: isLoadingPoints, getPointsForOrganization } = useLoyaltyPoints();
  
  const [isRedeeming, setIsRedeeming] = useState(false); // Local loading state for redemption
  const [isRedemptionModalOpen, setIsRedemptionModalOpen] = useState(false); // For the 3-minute code modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // For the full description modal
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
        } else {
            pointStatusText = `Pontok levonása: ${coupon.points_cost}`;
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

  const handleRedeemClick = async (coupon: PublicCoupon) => {
    if (!isAuthenticated) {
      showError('Kérjük, jelentkezz be a kupon beváltásához.');
      return;
    }
    
    if (isRedeeming) return; // Prevent double click

    // Re-check status before starting redemption
    const { isDisabled: preCheckDisabled } = getRedemptionStatus(coupon);
    if (preCheckDisabled) {
        // If disabled, the status text should already be set by getRedemptionStatus
        showError(getRedemptionStatus(coupon).buttonText);
        return;
    }

    setIsRedeeming(true);
    try {
      // 1. Attempt to record usage and generate code/redeem immediately
      const result = await redeemCoupon(coupon);

      if (result.success) {
        if (coupon.is_code_required && result.usageId && result.redemptionCode) {
            // Code Redemption: Open modal
            setSelectedCoupon(coupon);
            setCurrentUsageId(result.usageId);
            setCurrentRedemptionCode(result.redemptionCode);
            setIsRedemptionModalOpen(true);
        } else if (!coupon.is_code_required) {
            // Simple Redemption: Success message already shown by hook, just refresh UI
            // No modal needed
        }
      }
      // Error handling is done inside redeemCoupon hook
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
  
  // Calculate modal props based on selectedCoupon state
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
              const { isDisabled, buttonText, buttonClasses, usedUp, pending, canRedeem } = getRedemptionStatus(coupon);
              const logoUrl = (coupon as PublicCoupon).logo_url;
              const isPointCoupon = coupon.points_cost > 0;
              const isRewardCoupon = coupon.points_reward > 0;
              
              return (
                <Card 
                  key={coupon.id} 
                  className={`bg-black/50 border-cyan-500/30 backdrop-blur-sm text-white transition-shadow duration-300 flex flex-col w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)] max-w-sm ${isDisabled ? 'opacity-60 grayscale' : 'hover:shadow-lg hover:shadow-cyan-500/20'}`}
                >
                  {/* Card Content Area */}
                  <div className="flex flex-col flex-grow">
                    <CardHeader className="pb-4">
                      {coupon.image_url && (
                        <div className="h-40 w-full overflow-hidden rounded-t-xl">
                          <img 
                            src={coupon.image_url} 
                            alt={coupon.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* NEW: Centered Logo */}
                      <div className="flex justify-center -mt-10 mb-4">
                          <Link 
                              to={`/organization/${coupon.organization_name}`}
                              className="relative w-20 h-20 rounded-full bg-gray-900 p-1 border-4 border-cyan-400 shadow-lg group hover:scale-105 transition-transform duration-300"
                          >
                              {logoUrl ? (
                                  <img 
                                      src={logoUrl} 
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
                      
                      <CardTitle className="text-2xl text-cyan-300">{coupon.title}</CardTitle>
                      
                      {/* Organization Name Link (now below the title) */}
                      <Link 
                        to={`/organization/${coupon.organization_name}`}
                        className="flex items-center justify-center text-gray-400 hover:text-cyan-300 transition-colors duration-300 group"
                      >
                        <CardDescription className="text-gray-400 group-hover:text-cyan-300 transition-colors duration-300">
                          {coupon.organization_name}
                        </CardDescription>
                      </Link>
                    </CardHeader>
                    <CardContent className="space-y-3 flex-grow text-left">
                      {/* Use short_description here, only if it exists */}
                      {coupon.short_description && coupon.short_description.trim() !== '' && (
                        <p className="text-gray-300 flex-grow">{coupon.short_description}</p>
                      )}
                      
                      {/* Redemption Type Badge */}
                      <div className="flex items-center text-sm">
                          {coupon.is_code_required ? (
                              <Badge variant="outline" className="bg-cyan-900/50 text-cyan-300 border-cyan-500/50">
                                  <QrCode className="h-3 w-3 mr-1" /> Kódos beváltás
                              </Badge>
                          ) : (
                              <Badge variant="outline" className="bg-green-900/50 text-green-300 border-green-500/50">
                                  <CheckCircle className="h-3 w-3 mr-1" /> Azonnali beváltás
                              </Badge>
                          )}
                      </div>
                      
                      {/* Loyalty Status/Reward */}
                      {(isPointCoupon || isRewardCoupon) && (
                          <div className="flex items-center text-sm pt-2 border-t border-gray-700/50">
                              <Coins className={`h-4 w-4 mr-2 ${isPointCoupon ? 'text-red-400' : 'text-green-400'}`} />
                              {isPointCoupon ? (
                                  <span className={`font-semibold ${canRedeem ? 'text-red-300' : 'text-red-500'}`}>
                                      Költség: {coupon.points_cost} pont
                                  </span>
                              ) : (
                                  <span className="font-semibold text-green-300">
                                      Jutalom: +{coupon.points_reward} pont
                                  </span>
                              )}
                          </div>
                      )}
                      
                      {/* Usage Count Display */}
                      <div className="flex items-center text-sm text-gray-300">
                        <BarChart2 className="h-4 w-4 mr-2 text-pink-400" />
                        Beváltva: <span className="font-semibold ml-1 text-white">{coupon.usage_count} alkalommal</span>
                      </div>
                      
                      {coupon.expiry_date && (
                        <div className="flex items-center text-sm text-gray-300">
                          <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                          Lejárat: {format(new Date(coupon.expiry_date), 'yyyy. MM. dd.')}
                        </div>
                      )}
                    </CardContent>
                  </div>
                  
                  {/* Action Buttons (Details + Redeem) */}
                  <CardContent className="pt-0">
                    <div className="pt-4 space-y-2 border-t border-gray-700/50">
                      {/* NEW: Details Button */}
                      <Button 
                        onClick={() => openDetailsModal(coupon)}
                        variant="outline"
                        className="w-full border-gray-700 text-gray-400 hover:bg-gray-800"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Részletek
                      </Button>
                      
                      {isAuthenticated ? (
                        <>
                          {pending ? (
                            // Horizontal layout for pending buttons (only for code-required coupons)
                            <div className="flex gap-2 items-center">
                              <Button 
                                className="flex-grow bg-gray-600/50 text-gray-300 border border-gray-700 cursor-not-allowed"
                                disabled
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Kód generálva</span>
                                <span className="sm:hidden">Aktív kód</span>
                              </Button>
                              <Button 
                                asChild
                                variant="outline"
                                size="icon" // Small, circular button
                                className="flex-shrink-0 rounded-full border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                              >
                                <Link to="/profile" className="flex items-center justify-center">
                                  <User className="h-5 w-5" />
                                </Link>
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              onClick={() => handleRedeemClick(coupon)}
                              className={`w-full text-white ${buttonClasses}`}
                              disabled={isDisabled}
                            >
                              {isRedeeming ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  {buttonText}
                                </>
                              ) : usedUp || !canRedeem ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {buttonText}
                                </>
                              ) : coupon.is_code_required ? (
                                <>
                                  <QrCode className="h-4 w-4 mr-2" />
                                  {buttonText}
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {buttonText}
                                </>
                              )}
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button 
                          asChild
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        >
                          <Link to="/login" className="flex items-center justify-center">
                            <LogIn className="h-4 w-4 mr-2 sm:mr-2" />
                            <span className="hidden sm:inline">Bejelentkezés a beváltáshoz</span>
                            <span className="sm:hidden">Bejelentkezés</span>
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
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
            isDisabled={modalProps.isDisabled} // Use calculated modal prop
            buttonText={modalProps.buttonText} // Use calculated modal prop
          />
      )}
    </section>
  );
};

export default CouponsSection;