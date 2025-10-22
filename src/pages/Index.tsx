import React from 'react';
import HeroSection from '@/components/sections/HeroSection';
import BenefitsSection from '@/components/sections/BenefitsSection';
import FooterSection from '@/components/sections/FooterSection';
import CouponsSection from '@/components/sections/CouponsSection';
import EventsSection from '@/components/sections/EventsSection';
import OrganizersSection from '@/components/sections/OrganizersSection';

const IndexPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
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