import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Building, MapPin, Tag, Calendar, Clock, Gift, Home, BarChart2, CheckCircle, LogIn, User, Loader2 as Spinner, Coins, Heart, QrCode, Eye } from 'lucide-react';
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
import CouponDetailsModal from '@/components/CouponDetailsModal'; // NEW IMPORT
import FavoriteButton from '@/components/FavoriteButton';
import { useLoyaltyPoints } from '@/hooks/use-loyalty-points';
import { useInterestedEvents } from '@/hooks/use-interested-events'; // Import interested events hook
import EventCountdown from '@/components/EventCountdown'; // Import EventCountdown
import { Badge } from '@/components/ui/badge';

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
  const [isRedemptionModalOpen, setIsRedemptionModalOpen] = useState(false); // For the 3-minute code modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // For the full description modal
  const [selectedCoupon, setSelectedCoupon] = useState<PublicCoupon | null>(null);
  const [currentUsageId, setCurrentUsageId] = useState<string | undefined>(undefined);
  const [currentRedemptionCode, setCurrentRedemptionCode] = useState<string | undefined>(undefined);
  const [isTogglingInterest, setIsTogglingInterest] = useState<string | null>(null); // Local state for interest button loading

  // Filter coupons relevant to this organization
  const organizationCoupons = organizationName 
    ? (allPublicCoupons as PublicCoupon[]).filter(c => c.organization_name === organizationName)
    : [];
  
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

    // Re-check status before starting redemption
    const { isDisabled: preCheckDisabled } = getRedemptionStatus(coupon);
    if (preCheckDisabled) {
        // If disabled, the status text should already be set by getRedemptionStatus
        showError(getRedemptionStatus(coupon).buttonText);
        return;
    }

    setIsRedeeming(true);
    try {
      const result = await redeemCoupon(coupon); 

      if (result.success) {
        if (coupon.is_code_required && result.usageId && result.redemptionCode) {
            // Code Redemption: Open modal
            setSelectedCoupon(coupon); 
            setCurrentUsageId(result.usageId);
            setCurrentRedemptionCode(result.redemptionCode);
            setIsRedemptionModalOpen(true);
        } else if (!coupon.is_code_required) {
            // Simple Redemption: Success message already shown by hook
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

  // Calculate modal props based on selectedCoupon state
  const modalProps = selectedCoupon ? getRedemptionStatus(selectedCoupon) : { isDisabled: false, buttonText: '', buttonClasses: '', usedUp: false, pending: false, canRedeem: true };


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
                const { isDisabled, usedUp, pending } = getRedemptionStatus(coupon);
                const logoUrl = profile.logo_url; // Use organization profile logo
                
                return (
                  <Card 
                    key={coupon.id} 
                    className={`bg-black/50 border-purple-500/30 backdrop-blur-sm text-white transition-all duration-300 flex flex-col cursor-pointer hover:scale-[1.05] ${isDisabled ? 'opacity-60 grayscale' : 'hover:shadow-lg hover:shadow-purple-500/20'}`}
                    onClick={() => openDetailsModal(coupon)}
                  >
                    
                    {/* NEW CARD DESIGN: Banner Image with Overlay */}
                    <div className="relative w-full aspect-video overflow-hidden rounded-xl">
                        {/* Banner Image (16:9 aspect ratio) */}
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
                        
                        {/* Overlay Content (Top Left) */}
                        <div className="absolute inset-0 p-3 flex items-start justify-between bg-gradient-to-b from-black/50 to-transparent">
                            <Link 
                                to={`/organization/${coupon.organization_name}`}
                                className="flex items-center space-x-2 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Logo */}
                                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center border border-cyan-400 overflow-hidden">
                                    {logoUrl ? (
                                        <img 
                                            src={logoUrl} 
                                            alt={coupon.organization_name} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Building className="h-4 w-4 text-cyan-400" />
                                    )}
                                </div>
                                {/* Organization Name */}
                                <span className="text-sm font-semibold text-white truncate max-w-[100px] md:max-w-[150px]">
                                    {coupon.organization_name}
                                </span>
                            </Link>
                            
                            {/* Status Badge (Top Right) */}
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
                                    <Coins className="h-3 w-3" /> {coupon.points_cost} pont
                                </Badge>
                            ) : coupon.points_reward > 0 ? (
                                <Badge className="bg-green-600/70 text-white flex items-center gap-1">
                                    <Coins className="h-3 w-3" /> +{coupon.points_reward} pont
                                </Badge>
                            ) : null}
                        </div>
                        
                        {/* Title Overlay (Bottom Left) */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                            <CardTitle className="text-xl text-white text-left truncate">{coupon.title}</CardTitle>
                        </div>
                    </div>
                    
                    {/* Card Content (Empty, only for padding/structure) */}
                    <CardContent className="p-3 text-center">
                        <Button 
                            onClick={() => openDetailsModal(coupon)}
                            variant="outline"
                            className="w-full border-purple-400 text-purple-400 hover:bg-purple-400/10"
                        >
                            <Gift className="h-4 w-4 mr-2" /> Részletek & Beváltás
                        </Button>
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
                      
                      {/* Centered Logo */}
                      <div className="flex justify-center -mt-10 mb-4">
                          <Link 
                              to={`/organization/${event.organization_name}`}
                              className="relative w-20 h-20 rounded-full bg-gray-900 p-1 border-4 border-purple-400 shadow-lg group hover:scale-105 transition-transform duration-300"
                          >
                              {profile.logo_url ? (
                                  <img 
                                      src={profile.logo_url} 
                                      alt={profile.organization_name} 
                                      className="h-full w-full rounded-full object-cover"
                                  />
                              ) : (
                                  <div className="h-full w-full rounded-full bg-gray-800 flex items-center justify-center">
                                      <Building className="h-8 w-8 text-purple-400" />
                                  </div>
                              )}
                          </Link>
                      </div>
                      
                      {/* Title and Countdown - Now stacked */}
                      <div className="flex flex-col items-center text-center mb-2">
                        <CardTitle className="text-2xl text-purple-300 w-full break-words">{event.title}</CardTitle>
                        <div className="mt-2">
                            <EventCountdown startTime={event.start_time} endTime={event.end_time} />
                        </div>
                      </div>
                      
                      <CardDescription className="text-gray-400 text-center">
                        {event.organization_name}
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
    </div>
  );
};

export default OrganizationProfile;