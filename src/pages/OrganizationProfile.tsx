import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Building, MapPin, Tag, Calendar, Clock, Gift, Home, BarChart2, CheckCircle, LogIn, User, Loader2 as Spinner, Coins, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { showError } from '@/utils/toast';
import { Coupon } from '@/types/coupons';
import { Event } from '@/types/events';
import { format } from 'date-fns';
import Navigation from '@/components/sections/Navigation';
import FooterSection from '@/components/sections/FooterSection';
import { usePublicCoupons } from '@/hooks/use-public-coupons';
import { useAuth } from '@/hooks/use-auth';
import RedemptionModal from '@/components/RedemptionModal';
import FavoriteButton from '@/components/FavoriteButton';
import { useLoyaltyPoints } from '@/hooks/use-loyalty-points';
import { useInterestedEvents } from '@/hooks/use-interested-events'; // Import interested events hook
import EventCountdown from '@/components/EventCountdown'; // Import EventCountdown

interface OrganizationProfileData {
  id: string;
  organization_name: string;
  logo_url: string | null;
}

// NOTE: This definition must match the one in use-public-coupons.ts
interface PublicCoupon extends Coupon {
  logo_url: string | null;
  usage_count: number;
}

// Extend Event type to include logo_url for display
interface PublicEvent extends Event {
  logo_url: string | null;
}

interface OrganizationContent {
  profile: OrganizationProfileData;
  events: PublicEvent[]; // Use PublicEvent here
}

const OrganizationProfile = () => {
  const params = useParams<{ organizationName: string }>();
  const organizationName = params.organizationName;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { points, isLoading: isLoadingPoints, getPointsForOrganization } = useLoyaltyPoints();
  const { isInterested, toggleInterest } = useInterestedEvents(); // Use interested events hook
  
  const [organizationData, setOrganizationData] = useState<OrganizationContent | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use public coupons hook to get all coupons, usages, and redemption logic
  const { 
    coupons: allPublicCoupons, 
    isLoading: isLoadingCoupons, 
    redeemCoupon, 
    isCouponUsedUp, 
    isCouponPending, 
    refreshUsages, 
  } = usePublicCoupons();
  
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [currentUsageId, setCurrentUsageId] = useState<string | undefined>(undefined);
  const [currentRedemptionCode, setCurrentRedemptionCode] = useState<string | undefined>(undefined);
  const [isTogglingInterest, setIsTogglingInterest] = useState<string | null>(null); // Local state for interest button loading

  // Filter coupons relevant to this organization
  const organizationCoupons = organizationName 
    ? (allPublicCoupons as PublicCoupon[]).filter(c => c.organization_name === organizationName)
    : [];
  
  // --- Data Fetching ---
  const fetchOrganizationData = useCallback(async () => {
    if (!organizationName) {
      setError('Hiányzó szervezet neve.');
      setIsLoadingProfile(false);
      return;
    }

    setIsLoadingProfile(true);
    setError(null);
    
    try {
      // 1. Fetch Organization Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, organization_name, logo_url')
        .eq('organization_name', organizationName)
        .single();

      if (profileError || !profileData) {
        if (profileError?.code === 'PGRST116') {
          setError('A szervezet nem található.');
        } else {
          showError('Hiba történt a szervezet adatainak betöltésekor.');
          setError('Hiba történt a szervezet adatainak betöltésekor.');
          console.error('Profile fetch error:', profileError);
        }
        setOrganizationData(null);
        return;
      }
      
      // 2. Fetch Events
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          coupon:coupon_id (id, title, coupon_code)
        `)
        .eq('organization_name', organizationName)
        .order('start_time', { ascending: true });

      if (eventError) {
        console.error('Event fetch error:', eventError);
      }
      
      // 3. Combine events with logo data (since we have the profile data here)
      const eventsWithLogo: PublicEvent[] = (eventData || []).map(event => ({
          ...(event as Event),
          logo_url: profileData.logo_url, // Use the fetched organization logo
      }));

      setOrganizationData({
        profile: profileData as OrganizationProfileData,
        events: eventsWithLogo,
      });

    } catch (e) {
      setError('Váratlan hiba történt.');
      console.error('Unexpected fetch error:', e);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [organizationName]);

  useEffect(() => {
    if (organizationName) {
      fetchOrganizationData();
    } else {
      setIsLoadingProfile(false);
      setError('Hiányzó szervezet neve a URL-ben.');
    }
  }, [fetchOrganizationData, organizationName]);
  
  // --- Redemption Logic ---
  const handleRedeemClick = async (coupon: PublicCoupon) => {
    if (!isAuthenticated) {
      showError('Kérjük, jelentkezz be a kupon beváltásához.');
      navigate('/login');
      return;
    }
    
    if (isRedeeming) return;

    if (isCouponUsedUp(coupon.id, coupon.max_uses_per_user)) {
      showError(`Ezt a kupont már beváltottad ${coupon.max_uses_per_user} alkalommal (beleértve a lejárt kódokat is).`);
      return;
    }
    
    if (isCouponPending(coupon.id)) {
      showError('Már generáltál egy beváltási kódot ehhez a kuponhoz. Kérjük, használd azt.');
      return;
    }
    
    // Check points cost (The actual check is done in redeemCoupon, but we check here for immediate UI feedback)
    if (coupon.points_cost > 0) {
        const organizationRecord = points.find(p => p.profile.organization_name === coupon.organization_name);
        const organizationId = organizationRecord?.organization_id;
        const currentPoints = organizationId ? getPointsForOrganization(organizationId) : 0;
        
        if (currentPoints < coupon.points_cost) {
            showError(`Nincs elegendő hűségpontod (${currentPoints}/${coupon.points_cost}).`);
            return;
        }
    }

    setIsRedeeming(true);
    try {
      const result = await redeemCoupon(coupon); 

      if (result.success && result.usageId && result.redemptionCode) {
        setSelectedCoupon(coupon); 
        setCurrentUsageId(result.usageId);
        setCurrentRedemptionCode(result.redemptionCode);
        setIsModalOpen(true);
      }
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
      refreshUsages(); 
    } else if (usageIdToClear) {
      refreshUsages(); // Refresh to update button state
    }
  };
  
  // --- Interest Toggle Logic ---
  const handleToggleInterest = async (event: PublicEvent) => {
    if (!isAuthenticated) {
      showError('Kérjük, jelentkezz be az érdeklődés jelöléséhez.');
      return;
    }
    setIsTogglingInterest(event.id);
    await toggleInterest(event.id, event.title);
    setIsTogglingInterest(null);
  };
  // --- End Redemption Logic ---


  if (isLoadingProfile || isLoadingCoupons || isLoadingPoints) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mr-3" />
        <p className="text-cyan-400">Szervezeti profil betöltése...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 p-4 text-white">
        <h1 className="text-4xl font-bold text-red-400 mb-4">Hiba</h1>
        <p className="text-xl text-gray-300 mb-8">{error}</p>
        <Button asChild variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
          <Link to="/">
            <Home className="h-4 w-4 mr-2" />
            Vissza a főoldalra
          </Link>
        </Button>
      </div>
    );
  }
  
  if (!organizationData) return null;

  const { profile, events } = organizationData;
  
  // Get current user points for this organization
  const organizationRecord = points.find(p => p.profile.organization_name === organizationName);
  const currentPoints = organizationRecord ? getPointsForOrganization(organizationRecord.organization_id) : 0;


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white">
      <Navigation />
      <div className="pt-24 pb-12 px-6 container mx-auto max-w-7xl">
        
        {/* Header Card */}
        <Card className="bg-black/50 border-cyan-500/30 backdrop-blur-sm p-6 mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              {profile.logo_url ? (
                <img 
                  src={profile.logo_url} 
                  alt={profile.organization_name} 
                  className="h-20 w-20 rounded-full object-cover border-4 border-cyan-400 shadow-lg"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gray-800 flex items-center justify-center border-4 border-cyan-400">
                  <Building className="h-10 w-10 text-cyan-400" />
                </div>
              )}
              <div>
                <h1 className="text-4xl font-bold text-cyan-300">{profile.organization_name}</h1>
                <p className="text-gray-400 mt-1">Hivatalos partner profil</p>
              </div>
            </div>
            
            {/* Favorite Button and Points Display */}
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
                {isAuthenticated && (
                    <div className="flex items-center text-lg font-semibold text-purple-300 bg-purple-900/30 border border-purple-500/50 rounded-full px-4 py-2">
                        <Coins className="h-5 w-5 mr-2" />
                        {currentPoints} pont
                    </div>
                )}
                {isAuthenticated && (
                    <FavoriteButton 
                        organizationId={profile.id} 
                        organizationName={profile.organization_name} 
                        className="mt-0"
                    />
                )}
            </div>
          </div>
        </Card>

        {/* Coupons Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-purple-300 mb-6 flex items-center gap-2">
            <Gift className="h-6 w-6" /> Aktív Kuponok ({organizationCoupons.length})
          </h2>
          {organizationCoupons.length === 0 ? (
            <p className="text-gray-400">Jelenleg nincsenek aktív kuponok ehhez a szervezethez.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizationCoupons.map(coupon => {
                const usedUp = isAuthenticated && isCouponUsedUp(coupon.id, coupon.max_uses_per_user);
                const pending = isAuthenticated && isCouponPending(coupon.id);
                
                // Loyalty logic
                const isPointCoupon = coupon.points_cost > 0;
                const isRewardCoupon = coupon.points_reward > 0;
                let canRedeem = true;
                let pointStatusText = '';
                
                if (isAuthenticated && isPointCoupon) {
                    if (currentPoints < coupon.points_cost) {
                        canRedeem = false;
                        pointStatusText = `Nincs elegendő pont (${currentPoints}/${coupon.points_cost})`;
                    } else {
                        pointStatusText = `Pontok levonása: ${coupon.points_cost}`;
                    }
                }
                
                const isDisabled = usedUp || pending || isRedeeming || !canRedeem;
                
                // Determine button text based on status
                let buttonText = 'Beváltás';
                if (isRedeeming) {
                    buttonText = 'Generálás...';
                } else if (usedUp) {
                    buttonText = `Limit elérve (${coupon.max_uses_per_user} / ${coupon.max_uses_per_user})`;
                } else if (!canRedeem) {
                    buttonText = pointStatusText;
                }
                
                return (
                  <Card key={coupon.id} className={`bg-black/50 border-purple-500/30 backdrop-blur-sm text-white flex flex-col ${usedUp || !canRedeem ? 'opacity-60 grayscale' : 'hover:shadow-lg hover:shadow-purple-500/20'}`}>
                    <CardHeader>
                      <CardTitle className="text-xl text-cyan-300">{coupon.title}</CardTitle>
                      <CardDescription className="text-gray-400">{coupon.coupon_code}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm flex-grow">
                      <p className="text-gray-300">{coupon.description || 'Nincs leírás.'}</p>
                      
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
                        <div className="flex items-center text-gray-400">
                          <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                          Lejárat: {format(new Date(coupon.expiry_date), 'yyyy. MM. dd.')}
                        </div>
                      )}
                      
                      {/* Redemption Button */}
                      <div className="pt-4">
                        {isAuthenticated ? (
                          <>
                            {pending ? (
                              <div className="flex gap-2 items-center">
                                <Button 
                                  className="flex-grow bg-gray-600/50 text-gray-300 border border-gray-700 cursor-not-allowed"
                                  disabled
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  Aktív kód
                                </Button>
                                <Button 
                                  asChild
                                  variant="outline"
                                  size="icon"
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
                                className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
                                disabled={isDisabled}
                              >
                                {isRedeeming ? (
                                  <>
                                    <Spinner className="h-4 w-4 mr-2 animate-spin" />
                                    {buttonText}
                                  </>
                                ) : usedUp ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {buttonText}
                                  </>
                                ) : !canRedeem ? (
                                  <>
                                    <Coins className="h-4 w-4 mr-2" />
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
                              <LogIn className="h-4 w-4 mr-2" />
                              Bejelentkezés a beváltáshoz
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

        {/* Events Section (remains the same) */}
        <div>
          <h2 className="text-3xl font-bold text-cyan-300 mb-6 flex items-center gap-2">
            <Calendar className="h-6 w-6" /> Közelgő Események ({events.length})
          </h2>
          {events.length === 0 ? (
            <p className="text-gray-400">Jelenleg nincsenek meghirdetett események ehhez a szervezethez.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => {
                const interested = isInterested(event.id);
                const isCurrentToggling = isTogglingInterest === event.id;
                
                return (
                  <Card key={event.id} className="bg-black/50 border-cyan-500/30 backdrop-blur-sm text-white flex flex-col">
                    {event.image_url && (
                      <div className="h-40 w-full overflow-hidden rounded-t-xl">
                        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl text-purple-300 mr-2">{event.title}</CardTitle>
                        <EventCountdown startTime={event.start_time} endTime={event.end_time} />
                      </div>
                      <CardDescription className="text-gray-400 flex items-center text-sm">
                        <Building className="h-4 w-4 mr-1" /> {event.organization_name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm flex-grow">
                      <p className="text-gray-300">{event.description || 'Nincs leírás.'}</p>
                      
                      <div className="flex items-center text-gray-400 pt-2 border-t border-gray-700/50">
                        <Clock className="h-4 w-4 mr-2 text-cyan-400" />
                        Kezdés: {format(new Date(event.start_time), 'yyyy. MM. dd. HH:mm')}
                        {event.end_time && (
                          <span className="ml-2 text-gray-500"> - {format(new Date(event.end_time), 'HH:mm')}</span>
                        )}
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center text-gray-400">
                          <MapPin className="h-4 w-4 mr-2 text-cyan-400" />
                          Helyszín: {event.location}
                        </div>
                      )}
                      
                      {event.coupon_id && (
                        <div className="flex items-center text-green-400">
                          <Tag className="h-4 w-4 mr-2" />
                          Kupon csatolva
                        </div>
                      )}
                      
                      {/* Interest Button */}
                      {isAuthenticated && (
                          <Button
                              variant="outline"
                              onClick={() => handleToggleInterest(event)}
                              disabled={isCurrentToggling}
                              className={`w-full mt-4 transition-colors duration-300 ${
                                  interested 
                                      ? 'bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30' 
                                      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-700/50 hover:text-red-400'
                              }`}
                          >
                              {isCurrentToggling ? (
                                  <Spinner className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                  <Heart className={`h-4 w-4 mr-2 ${interested ? 'fill-red-400' : ''}`} />
                              )}
                              {interested ? 'Érdeklődés eltávolítása' : 'Érdekel'}
                          </Button>
                      )}
                      {!isAuthenticated && (
                          <Button 
                            asChild
                            className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                          >
                            <Link to="/login" className="flex items-center justify-center">
                              <LogIn className="h-4 w-4 mr-2" />
                              Bejelentkezés
                            </Link>
                          </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <FooterSection />
      
      {selectedCoupon && currentUsageId && currentRedemptionCode && (
        <RedemptionModal 
          coupon={selectedCoupon}
          usageId={currentUsageId}
          redemptionCode={currentRedemptionCode}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default OrganizationProfile;