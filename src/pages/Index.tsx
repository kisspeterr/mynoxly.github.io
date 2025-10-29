import React from 'react';
import HeroSection from '@/components/sections/HeroSection';
import FooterSection from '@/components/sections/FooterSection';
import CouponsSection from '@/components/sections/CouponsSection';
import EventsSection from '@/components/sections/EventsSection';
import OrganizersSection from '@/components/sections/OrganizersSection';
import FaqSection from '@/components/sections/FaqSection';
import PartnerSection from '@/components/sections/PartnerSection'; // Import new section
import Navigation from '@/components/sections/Navigation';
import ChallengesSection from '@/components/sections/ChallengesSection'; // NEW IMPORT

const IndexPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white">
      <Navigation />
      <main>
        <HeroSection />
        <ChallengesSection /> {/* Add Challenges section here */}
        <CouponsSection />
        <EventsSection />
        <OrganizersSection />
        <FaqSection />
        <PartnerSection />
      </main>
      <FooterSection />
    </div>
  );
};

export default IndexPage;