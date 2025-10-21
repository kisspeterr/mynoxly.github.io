import React, { useState } from 'react';
import { Gift, Tag, Loader2, LogIn, CheckCircle, Calendar, Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePublicCoupons } from '@/hooks/use-public-coupons';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import RedemptionModal from '@/components/RedemptionModal';
import { showError } from '@/utils/toast';
import { Coupon } from '@/types/coupons'; // Import Coupon type

const PublicCouponsSection = () => {
  const { coupons, isLoading, redeemCoupon, isCouponUsedUp, isCouponPending, refreshUsages, deletePendingUsage } = usePublicCoupons();
  const { isAuthenticated } = useAuth();
  
  const [isRedeeming, setIsRedeeming] = useState(false); // Local loading state for redemption
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [currentUsageId, setCurrentUsageId] = useState<string | undefined>(undefined);
  const [currentRedemptionCode, setCurrentRedemptionCode] = useState<string | undefined>(undefined);

  const handleRedeemClick = async (coupon: Coupon) => {
    if (!isAuthenticated) {
      showError('Kérjük, jelentkezz be a kupon beváltásához.');
      return;
    }
    
    if (isRedeeming) return; // Prevent double click

    // Check local state before attempting redemption
    if (isCouponUsedUp(coupon.id, coupon.max_uses_per_user)) {
      showError(`Ezt a kupont már beváltottad ${coupon.max_uses_per_user} alkalommal.`);
      return;
    }
    
    if (isCouponPending(coupon.id)) {
      showError('Már generáltál egy beváltási kódot ehhez a kuponhoz. Kérjük, használd azt.');
      return;
    }

    setIsRedeeming(true);
    try {
      // 1. Attempt to record usage and generate code
      const result = await redeemCoupon(coupon);

      if (result.success && result.usageId && result.redemptionCode) {
        setSelectedCoupon(coupon);
        setCurrentUsageId(result.usageId);
        setCurrentRedemptionCode(result.redemptionCode);
        setIsModalOpen(true);
      }
      // Error handling is done inside redeemCoupon hook
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleModalClose = async (wasRedeemed: boolean = false) => {
    const usageIdToClear = currentUsageId;
    
    setIsModalOpen(false);
    setSelectedCoupon(null);
    setCurrentUsageId(undefined);
    setCurrentRedemptionCode(undefined);
    
    if (wasRedeemed) {
      // If redeemed by admin (via Realtime), refresh usages to update button state
      refreshUsages(); 
    } else if (usageIdToClear) {
      // If closed by user AND not redeemed, delete the pending usage record
      await deletePendingUsage(usageIdToClear);
      // The deletion triggers Realtime, which calls refreshUsages internally, 
      // but we call it explicitly here for immediate UI feedback if Realtime is slow.
      refreshUsages(); 
    }
  };

  return (
    <section id="coupons-section" className="py-20 px-6">
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

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            <p className="ml-3 text-gray-300">Kuponok betöltése...</p>
          </div>
        ) : coupons.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">Jelenleg nincsenek aktív kuponok.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coupons.map((coupon) => {
              const usedUp = isAuthenticated && isCouponUsedUp(coupon.id, coupon.max_uses_per_user);
              const pending = isAuthenticated && isCouponPending(coupon.id);
              const isDisabled = usedUp || pending || isRedeeming; // Disable if redeeming globally
              
              return (
                <Card 
                  key={coupon.id} 
                  className={`bg-black/50 border-cyan-500/30 backdrop-blur-sm text-white transition-shadow duration-300 flex flex-col ${usedUp ? 'opacity-60 grayscale' : 'hover:shadow-lg hover:shadow-cyan-500/20'}`}
                >
                  <CardHeader className="pb-4">
                    {coupon.image_url && (
                      <div className="h-40 w-full overflow-hidden rounded-lg mb-4">
                        <img 
                          src={coupon.image_url} 
                          alt={coupon.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardTitle className="text-2xl text-cyan-300">{coupon.title}</CardTitle>
                    <CardDescription className="text-gray-400">{coupon.organization_name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-grow text-left">
                    <p className="text-gray-300">{coupon.description || 'Nincs leírás.'}</p>
                    
                    {coupon.expiry_date && (
                      <div className="flex items-center text-sm text-gray-300 pt-2 border-t border-gray-700/50">
                        <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                        Lejárat: {format(new Date(coupon.expiry_date), 'yyyy. MM. dd.')}
                      </div>
                    )}

                    <div className="pt-4 space-y-2">
                      {isAuthenticated ? (
                        <>
                          {pending ? (
                            // Reverting to vertical stacking on mobile (flex-col)
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button 
                                className="w-full bg-gray-600/50 text-gray-300 border border-gray-700 cursor-not-allowed"
                                disabled
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Kód generálva
                              </Button>
                              <Button 
                                asChild
                                variant="outline"
                                className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                              >
                                <Link to="/profile" className="flex items-center justify-center">
                                  <User className="h-4 w-4 mr-2" />
                                  {/* Use short text for all small screens */}
                                  Fiók megtekintése
                                </Link>
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              onClick={() => handleRedeemClick(coupon)}
                              className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
                              disabled={isDisabled}
                            >
                              {isRedeeming ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Generálás...
                                </>
                              ) : usedUp ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Beváltva ({coupon.max_uses_per_user} / {coupon.max_uses_per_user})
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Beváltás
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
      
      {selectedCoupon && currentUsageId && currentRedemptionCode && (
        <RedemptionModal 
          coupon={selectedCoupon}
          usageId={currentUsageId}
          redemptionCode={currentRedemptionCode}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      )}
    </section>
  );
};

export default PublicCouponsSection;