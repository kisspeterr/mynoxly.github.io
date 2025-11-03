import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Building, MapPin, Tag, Calendar, Clock, Gift, Home, BarChart2, CheckCircle, LogIn, User, Loader2 as Spinner, Coins, Heart, QrCode, Eye, ArrowRight, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { showError } from '@/utils/toast';
import { Coupon } from '@/types/coupons';
import { Event } from '@/types/events';
import { format } from 'date-fns';
import Navigation from '@/components/sections/Navigation'; // IMPORT NAVIGATION
import FooterSection from '@/components/sections/FooterSection';
import { usePublicCoupons } from '@/hooks/use-public-coupons';
import { useAuth, OrganizationProfileData } from '@/hooks/use-auth';
import RedemptionModal from '@/components/RedemptionModal';
import CouponDetailsModal from '@/components/CouponDetailsModal'; // NEW IMPORT
import EventDetailsModal from '@/components/EventDetailsModal'; // NEW IMPORT
import FavoriteButton from '@/components/FavoriteButton';
import { useLoyaltyPoints } from '@/hooks/use-loyalty-points';
import { useInterestedEvents } from '@/hooks/use-interested-events'; // Import interested events hook
import EventCountdown, { isEventFinished } from '@/components/EventCountdown'; // Import EventCountdown and status check
import { Badge } from '@/components/ui/badge';
import { useChallenges } from '@/hooks/use-challenges'; // NEW IMPORT

// NOTE: This definition must match the one in use-public-coupons.ts
interface PublicCoupon extends Coupon {
  logo_url: string | null;
  organization_id: string;
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
  const { points, isLoading: isLoadingPoints, getPointsForOrganization, fetchPoints } = useLoyaltyPoints(); // Get fetchPoints
  const { isInterested, toggleInterest } = useInterestedEvents(); // Use interested events hook
  const { fetchChallenges } = useChallenges(); // NEW: Get challenge refresh function
  
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
  const [isCouponDetailsModalOpen, setIsCouponDetailsModalOpen] = useState(false); // For the full description modal
  const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState(false); // NEW: For event details modal
  const [selectedCoupon, setSelectedCoupon] = useState<PublicCoupon | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<PublicEvent | null>(null); // NEW: Selected event
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
    
    // Check if coupon is expired
    const isExpired = coupon.expiry_date ? new Date(coupon.expiry_date) < new Date() : false;
    
    const isPointCoupon = coupon.points_cost > 0;
    let canRedeem = true;
    let pointStatusText = '';
    
    if (isAuthenticated && isPointCoupon) {
        // CRITICAL FIX: Use organization_id from the coupon object
        const organizationId = coupon.organization_id;
        const currentPoints = organizationId ? getPointsForOrganization(organizationId) : 0;
        
        if (currentPoints < coupon.points_cost) {
            canRedeem = false;
            pointStatusText = `Nincs elegendő pont (${currentPoints}/${coupon.points_cost})`;
        }
    }
    
    const isDisabled = usedUp || pending || isRedeeming || !canRedeem || isExpired;
    
    let buttonText = coupon.is_code_required ? 'Kód generálása' : 'Beváltás';
    if (isExpired) {
        buttonText = 'Lejárt';
    } else if (isRedeeming) {
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
      
    return { isDisabled, buttonText, buttonClasses, usedUp, pending, canRedeem, isExpired };
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
      // 1. Fetch Organization Profile from the new 'organizations' table
      const { data: profileData, error: profileError } = await supabase
        .from('organizations')
        .select('id, organization_name, logo_url, is_public, owner_id, category, formatted_address') // ADDED category, formatted_address
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
      
      // 2. Fetch Events (Only ACTIVE and NON-ARCHIVED)
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          coupon:coupon_id (id, title, coupon_code)
        `)
        .eq('organization_name', organizationName)
        .eq('is_active', true) // <-- NEW FILTER
        .eq('is_archived', false) // <-- NEW FILTER
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
    const { isDisabled: preCheckDisabled, isExpired } = getRedemptionStatus(coupon);
    if (preCheckDisabled) {
        if (isExpired) {
            showError('Ez a kupon lejárt.');
        } else {
            showError(getRedemptionStatus(coupon).buttonText);
        }
        return;
    }

    setIsRedeeming(true);
    try {
      // Pass fetchPoints AND fetchChallenges to redeemCoupon
      const result = await redeemCoupon(coupon, fetchPoints, fetchChallenges); 

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
    
    // Always refresh everything after modal close, regardless of Realtime status
    refreshUsages();
    fetchChallenges();
    fetchPoints(); 
  };
  
  const openCouponDetailsModal = (coupon: PublicCoupon) => {
      setSelectedCoupon(coupon);
      setIsCouponDetailsModalOpen(true);
  };
  
  const closeCouponDetailsModal = () => {
      setIsCouponDetailsModalOpen(false);
      setSelectedCoupon(null);
  };
  
  const openEventDetailsModal = (event: PublicEvent) => {
      setSelectedEvent(event);
      setIsEventDetailsModalOpen(true);
  };
  
  const closeEventDetailsModal = () => {
      setIsEventDetailsModalOpen(false);
      setSelectedEvent(null);
  };
  
  // --- Interest Toggle Logic ---
  const handleToggleInterest = async (event: PublicEvent) => {
    if (!isAuthenticated) {
      showError('Kérjük, jelentkezz be az érdeklődés jelöléséhez.');
      return;
    }
    const finished = isEventFinished(new Date(event.start_time), event.end_time ? new Date(event.end_time) : null);
    if (finished) {
        showError('Ez az esemény már lejárt.');
        return;
    }
    setIsTogglingInterest(event.id);
    await toggleInterest(event.id, event.title);
    setIsTogglingInterest(null);
  };
  // --- End Redemption Logic ---

  // Calculate modal props based on selectedCoupon state
  const modalProps = selectedCoupon ? getRedemptionStatus(selectedCoupon) : { isDisabled: false, buttonText: '', buttonClasses: '', usedUp: false, pending: false, canRedeem: true, isExpired: false };


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
  // CRITICAL FIX: Use profile.id (organization_id) to look up points
  const currentPoints = getPointsForOrganization(profile.id);


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
                <p className="text-gray-400 mt-1 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-purple-400" />
                    Kategória: <span className="font-semibold text-white">{profile.category || 'Nincs megadva'}</span>
                </p>
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
          
          {/* Address Display */}
          {profile.formatted_address && (
            <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center text-gray-300">
                <MapPin className="h-5 w-5 mr-3 text-cyan-400 flex-shrink-0" />
                <span className="font-medium">Cím:</span> <span className="ml-1 break-words">{profile.formatted_address}</span>
            </div>
          )}
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
                const { isDisabled, usedUp, pending, isExpired } = getRedemptionStatus(coupon);
                const logoUrl = profile.logo_url; // Use organization profile logo
                
                return (
                  <div 
                    key={coupon.id} 
                    className={`relative w-full sm:w-full lg:w-full max-w-sm transition-all duration-300 ${isDisabled ? 'opacity-60 grayscale' : 'hover:scale-[1.05]'}`}
                  >
                    
                    <Card 
                      className={`bg-black/50 border-purple-500/30 backdrop-blur-sm text-white transition-shadow duration-300 flex flex-col w-full cursor-pointer ${isDisabled ? '' : 'hover:shadow-lg hover:shadow-purple-500/20'}`}
                      onClick={() => openCouponDetailsModal(coupon)}
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
                                className="absolute top-3 left-3 z-20 flex items-center p-0.5 bg-black/50 rounded-full backdrop-blur-sm border border-purple-400/50 transition-all duration-300 pointer-events-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-900 p-0.5 border border-purple-400 overflow-hidden flex-shrink-0">
                                    {profile.logo_url ? (
                                        <img 
                                            src={profile.logo_url} 
                                            alt={profile.organization_name} 
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        <div className="h-full w-full rounded-full bg-gray-800 flex items-center justify-center">
                                            <Building className="h-4 w-4 text-purple-400" />
                                        </div>
                                    )}
                                </div>
                            </Link>
                            
                            {/* Organization Name (Center Top) */}
                            <Link 
                                to={`/organization/${coupon.organization_name}`}
                                className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20 text-sm font-bold text-white p-2 bg-black/50 rounded-lg backdrop-blur-sm border border-purple-400/50 transition-all duration-300 hover:text-purple-300 pointer-events-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {profile.organization_name}
                            </Link>
                        </div>
                        
                        {/* Overlay Content (Top Right - Status Badge) */}
                        <div className="absolute top-3 right-3 p-1 flex items-start justify-end z-10">
                            {isExpired ? (
                                <Badge className="bg-gray-600/70 text-white flex items-center gap-1">
                                    <XCircle className="h-3 w-3" /> Lejárt
                                </Badge>
                            ) : pending ? (
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
                            onClick={() => openCouponDetailsModal(coupon)}
                            variant="outline"
                            className="w-full border-purple-400 text-purple-400 hover:bg-purple-400/10"
                            disabled={isExpired}
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

        {/* Events Section (Updated) */}
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
                const logoUrl = profile.logo_url; // Use organization profile logo
                const isFinished = isEventFinished(new Date(event.start_time), event.end_time ? new Date(event.end_time) : null);
                
                return (
                  <div 
                    key={event.id} 
                    className={`relative w-full sm:w-full lg:w-full max-w-sm transition-all duration-300 ${isFinished ? 'opacity-60 grayscale' : 'hover:scale-[1.05]'}`}
                  >
                    
                    <Card 
                        className="bg-black/50 border-cyan-500/30 backdrop-blur-sm text-white flex flex-col w-full cursor-pointer"
                        onClick={() => openEventDetailsModal(event)}
                    >
                      <div className="relative h-40 w-full overflow-hidden rounded-t-xl">
                        {event.image_url ? (
                          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <Calendar className="h-12 w-12 text-cyan-400" />
                            </div>
                        )}
                        
                        {/* Organization Info Overlay (Top Left & Center) */}
                        <div className="absolute inset-0 z-10 pointer-events-none">
                            {/* Logo (Top Left) */}
                            <Link 
                                to={`/organization/${event.organization_name}`}
                                className="absolute top-3 left-3 z-20 flex items-center p-0.5 bg-black/50 rounded-full backdrop-blur-sm border border-cyan-400/50 transition-all duration-300 pointer-events-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-900 p-0.5 border border-cyan-400 overflow-hidden flex-shrink-0">
                                    {profile.logo_url ? (
                                        <img 
                                            src={profile.logo_url} 
                                            alt={profile.organization_name} 
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
                                to={`/organization/${event.organization_name}`}
                                className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20 text-sm font-bold text-white p-2 bg-black/50 rounded-lg backdrop-blur-sm border border-cyan-400/50 transition-all duration-300 hover:text-cyan-300 pointer-events-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {profile.organization_name}
                            </Link>
                        </div>
                        
                        {/* Countdown Overlay (Top Right) */}
                        <div className="absolute top-3 right-3 z-10">
                            <EventCountdown startTime={event.start_time} endTime={event.end_time} />
                        </div>
                      </div>
                      
                      <CardHeader className="pb-4 pt-4">
                        <CardTitle className="text-lg text-purple-300 w-full break-words text-left">{event.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm flex-grow">
                        
                        <div className="flex items-center text-gray-400">
                          <Clock className="h-4 w-4 mr-2 text-cyan-400" />
                          Kezdés: {format(new Date(event.start_time), 'yyyy. MM. dd. HH:mm')}
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
                        
                        {/* Details Button */}
                        <Button
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); openEventDetailsModal(event); }}
                            className="w-full mt-4 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                            disabled={isFinished}
                        >
                            Részletek <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
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
      
      {/* Coupon Details Modal (Full description) */}
      {selectedCoupon && (
          <CouponDetailsModal
            coupon={selectedCoupon}
            isOpen={isCouponDetailsModalOpen}
            onClose={closeCouponDetailsModal}
            onRedeemClick={(c) => handleRedeemClick(c as PublicCoupon)}
            isRedeeming={isRedeeming}
            isDisabled={modalProps.isDisabled}
            buttonText={modalProps.buttonText}
          />
      )}
      
      {/* Event Details Modal */}
      {selectedEvent && (
          <EventDetailsModal
            event={selectedEvent}
            isOpen={isEventDetailsModalOpen}
            onClose={closeEventDetailsModal}
          />
      )}
    </div>
  );
};

export default OrganizationProfile;