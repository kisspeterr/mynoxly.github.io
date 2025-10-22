import React from 'react';
import HeroSection from '@/components/sections/HeroSection';
import BenefitsSection from '@/components/sections/BenefitsSection';
import FooterSection from '@/components/sections/FooterSection';
import CouponsSection from '@/components/sections/CouponsSection';
import EventsSection from '@/components/sections/EventsSection';
import OrganizersSection from '@/components/sections/OrganizersSection';
import Navigation from '@/components/sections/Navigation'; // Import Navigation

const IndexPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation /> {/* Add Navigation here */}
      <main>
        <HeroSection />
        <CouponsSection />
        <EventsSection />
        <OrganizersSection />
        <BenefitsSection />
      </main>
      <FooterSection />
    </div>
  );
};

export default IndexPage;