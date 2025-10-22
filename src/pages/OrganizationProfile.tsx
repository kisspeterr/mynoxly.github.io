import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Building, MapPin, Tag, Calendar, Clock, Gift, Home, BarChart2, CheckCircle, LogIn, User, Loader2 as Spinner } from 'lucide-react';
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

interface OrganizationContent {
  profile: OrganizationProfileData;
  events: Event[];
}

const OrganizationProfile = () => {
  const params = useParams<{ organizationName: string }>();
  const organizationName = params.organizationName;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
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
    deletePendingUsage 
  } = usePublicCoupons();
  
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [currentUsageId, setCurrentUsageId] = useState<string | undefined>(undefined);
  const [currentRedemptionCode, setCurrentRedemptionCode] = useState<string | undefined>(undefined);

  // Filter coupons relevant to this organization
  // We ensure organizationName is defined before filtering
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
      // 1. Fetch Organization Profile (using RLS policy that allows public read on profiles)
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
      
      // 2. Fetch Events (RLS allows public read)
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('organization_name', organizationName)
        .order('start_time', { ascending: true });

      if (eventError) {
        console.error('Event fetch error:', eventError);
      }

      setOrganizationData({
        profile: profileData as OrganizationProfileData,
        events: (eventData || []) as Event[],
      });

    } catch (e) {
      setError('Váratlan hiba történt.');
      console.error('Unexpected fetch error:', e);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [organizationName]);

  useEffect(() => {
    // Only attempt to fetch if organizationName is present
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
      showError(`Ezt a kupont már beváltottad ${coupon.max_uses_per_user} alkalommal.`);
      return;
    }
    
    if (isCouponPending(coupon.id)) {
      showError('Már generáltál egy beváltási kódot ehhez a kuponhoz. Kérjük, használd azt.');
      return;
    }

    setIsRedeeming(true);
    try {
      // Pass the coupon object (which is PublicCoupon, but redeemCoupon only uses Coupon fields)
      const result = await redeemCoupon(coupon); 

      if (result.success && result.usageId && result.redemptionCode) {
        // Store the base Coupon data for the modal
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
      // If closed by user AND not redeemed, delete the pending usage record
      await deletePendingUsage(usageIdToClear);
      refreshUsages(); // Refresh after manual deletion
    }
  };
  // --- End Redemption Logic ---


  if (isLoadingProfile || isLoadingCoupons) {
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
            
            {/* Favorite Button */}
            {isAuthenticated && (
              <FavoriteButton 
                organizationId={profile.id} 
                organizationName={profile.organization_name} 
                className="mt-4 md:mt-0"
              />
            )}
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
                const isDisabled = usedUp || pending || isRedeeming;
                
                return (
                  <Card key={coupon.id} className={`bg-black/50 border-purple-500/30 backdrop-blur-sm text-white flex flex-col ${usedUp ? 'opacity-60 grayscale' : 'hover:shadow-lg hover:shadow-purple-500/20'}`}>
                    <CardHeader>
                      <CardTitle className="text-xl text-cyan-300">{coupon.title}</CardTitle>
                      <CardDescription className="text-gray-400">{coupon.coupon_code}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm flex-grow">
                      <p className="text-gray-300">{coupon.description || 'Nincs leírás.'}</p>
                      
                      {/* Usage Count Display */}
                      <div className="flex items-center text-sm text-gray-300 pt-2 border-t border-gray-700/50">
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
              {events.map(event => (
                <Card key={event.id} className="bg-black/50 border-cyan-500/30 backdrop-blur-sm text-white">
                  {event.image_url && (
                    <div className="h-40 w-full overflow-hidden rounded-t-xl">
                      <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl text-purple-300">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-gray-300">{event.description || 'Nincs leírás.'}</p>
                    <div className="flex items-center text-gray-400 pt-2 border-t border-gray-700/50">
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
                  </CardContent>
                </Card>
              ))}
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