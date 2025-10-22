import React from 'react';
import HeroSection from '@/components/sections/HeroSection';
import FooterSection from '@/components/sections/FooterSection';
import CouponsSection from '@/components/sections/CouponsSection';
import EventsSection from '@/components/sections/EventsSection';
import OrganizersSection from '@/components/sections/OrganizersSection';
import FaqSection from '@/components/sections/FaqSection';
import PartnerSection from '@/components/sections/PartnerSection';
import Navigation from '@/components/sections/Navigation';
import FloatingDemoButton from '@/components/FloatingDemoButton';
import FloatingScrollArrow from '@/components/FloatingScrollArrow';
import { Loader2 } from 'lucide-react';
import { usePublicCoupons } from '@/hooks/use-public-coupons';
import { usePublicEvents } from '@/hooks/use-public-events';
import { useLoyaltyPoints } from '@/hooks/use-loyalty-points';

const IndexPage = () => {
  // Call public data hooks here to initiate fetching immediately after AuthLoader finishes.
  // This ensures the data fetching starts early and the hooks cache the loading state.
  const { isLoading: isLoadingCoupons } = usePublicCoupons();
  const { isLoading: isLoadingEvents } = usePublicEvents();
  const { isLoading: isLoadingPoints } = useLoyaltyPoints(); 

  // We consider the page loaded only when all critical public data is fetched.
  const isLoadingPublicData = isLoadingCoupons || isLoadingEvents || isLoadingPoints;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white">
      <Navigation />
      <main>
        <HeroSection />
        
        {/* Conditional rendering based on public data loading */}
        {isLoadingPublicData ? (
          <div className="flex flex-col items-center justify-center h-96 py-20">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-400 mb-4" />
            <p className="text-xl text-gray-300">Kuponok és események betöltése...</p>
          </div>
        ) : (
          <>
            <CouponsSection />
            <EventsSection />
            <OrganizersSection />
            <FaqSection />
            <PartnerSection />
          </>
        )}
      </main>
      <FooterSection />
      
      {/* Floating elements (always visible if scrolled past hero) */}
      <FloatingDemoButton />
      <FloatingScrollArrow />
    </div>
  );
};

export default IndexPage;