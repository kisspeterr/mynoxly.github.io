import React, { useState } from 'react';
import { Gift, Tag, Loader2, LogIn, CheckCircle, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePublicCoupons } from '@/hooks/use-public-coupons';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import RedemptionModal from '@/components/RedemptionModal';
import { showError } from '@/utils/toast';

const PublicCouponsSection = () => {
  const { coupons, isLoading, redeemCoupon } = usePublicCoupons();
  const { isAuthenticated } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [currentUsageId, setCurrentUsageId] = useState<string | undefined>(undefined);

  const handleRedeemClick = async (coupon: Coupon) => {
    if (!isAuthenticated) {
      showError('Kérjük, jelentkezz be a kupon beváltásához.');
      return;
    }

    // 1. Attempt to record usage and check limits
    const result = await redeemCoupon(coupon);

    if (result.success && result.usageId) {
      setSelectedCoupon(coupon);
      setCurrentUsageId(result.usageId);
      setIsModalOpen(true);
    }
    // Error handling is done inside redeemCoupon hook
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCoupon(null);
    setCurrentUsageId(undefined);
    // Note: The RedemptionModal handles the final invalidation logic (time/exit based)
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
            {coupons.map((coupon) => (
              <Card 
                key={coupon.id} 
                className="bg-black/50 border-cyan-500/30 backdrop-blur-sm text-white hover:shadow-lg hover:shadow-cyan-500/20 transition-shadow duration-300 flex flex-col"
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
                  
                  <div className="flex items-center text-sm text-gray-300 pt-2 border-t border-gray-700/50">
                    <Tag className="h-4 w-4 mr-2 text-purple-400" />
                    Kód: <span className="font-mono ml-1 text-cyan-300">{coupon.coupon_code}</span>
                  </div>
                  
                  {coupon.expiry_date && (
                    <div className="flex items-center text-sm text-gray-300">
                      <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                      Lejárat: {format(new Date(coupon.expiry_date), 'yyyy. MM. dd.')}
                    </div>
                  )}

                  <div className="pt-4">
                    {isAuthenticated ? (
                      <Button 
                        onClick={() => handleRedeemClick(coupon)}
                        className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Beváltás
                      </Button>
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
            ))}
          </div>
        )}
      </div>
      
      {selectedCoupon && currentUsageId && (
        <RedemptionModal 
          coupon={selectedCoupon}
          usageId={currentUsageId}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      )}
    </section>
  );
};

export default PublicCouponsSection;