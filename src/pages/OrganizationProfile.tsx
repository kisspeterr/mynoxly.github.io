import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Building, MapPin, Tag, Calendar, Clock, Gift, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { showError } from '@/utils/toast';
import { Coupon } from '@/types/coupons';
import { Event } from '@/types/events';
import { format } from 'date-fns';
import Navigation from '@/components/sections/Navigation';
import FooterSection from '@/components/sections/FooterSection';

interface OrganizationProfileData {
  id: string;
  organization_name: string;
  logo_url: string | null;
  // Add other public profile fields here if needed
}

interface OrganizationContent {
  profile: OrganizationProfileData;
  coupons: Coupon[];
  events: Event[];
}

const OrganizationProfile = () => {
  const { organizationName } = useParams<{ organizationName: string }>();
  const [data, setData] = useState<OrganizationContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationName) {
      setError('Hiányzó szervezet neve.');
      setIsLoading(false);
      return;
    }

    const fetchOrganizationData = async () => {
      setIsLoading(true);
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
          setIsLoading(false);
          return;
        }
        
        // 2. Fetch Coupons (RLS allows public read)
        const { data: couponData, error: couponError } = await supabase
          .from('coupons')
          .select('*')
          .eq('organization_name', organizationName)
          .order('created_at', { ascending: false });

        if (couponError) {
          console.error('Coupon fetch error:', couponError);
        }

        // 3. Fetch Events (RLS allows public read)
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('organization_name', organizationName)
          .order('start_time', { ascending: true });

        if (eventError) {
          console.error('Event fetch error:', eventError);
        }

        setData({
          profile: profileData as OrganizationProfileData,
          coupons: (couponData || []) as Coupon[],
          events: (eventData || []) as Event[],
        });

      } catch (e) {
        setError('Váratlan hiba történt.');
        console.error('Unexpected fetch error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizationData();
  }, [organizationName]);

  if (isLoading) {
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
  
  if (!data) return null; // Should be covered by error handling, but for safety

  const { profile, coupons, events } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white">
      <Navigation />
      <div className="pt-24 pb-12 px-6 container mx-auto max-w-7xl">
        
        {/* Header Card */}
        <Card className="bg-black/50 border-cyan-500/30 backdrop-blur-sm p-6 mb-12">
          <div className="flex items-center space-x-4">
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
        </Card>

        {/* Coupons Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-purple-300 mb-6 flex items-center gap-2">
            <Gift className="h-6 w-6" /> Aktív Kuponok ({coupons.length})
          </h2>
          {coupons.length === 0 ? (
            <p className="text-gray-400">Jelenleg nincsenek aktív kuponok ehhez a szervezethez.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map(coupon => (
                <Card key={coupon.id} className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-white">
                  <CardHeader>
                    <CardTitle className="text-xl text-cyan-300">{coupon.title}</CardTitle>
                    <CardDescription className="text-gray-400">{coupon.coupon_code}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-gray-300">{coupon.description || 'Nincs leírás.'}</p>
                    {coupon.expiry_date && (
                      <div className="flex items-center text-gray-400 pt-2 border-t border-gray-700/50">
                        <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                        Lejárat: {format(new Date(coupon.expiry_date), 'yyyy. MM. dd.')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Events Section */}
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
    </div>
  );
};

export default OrganizationProfile;