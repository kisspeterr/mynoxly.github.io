import HeroSection from "@/components/sections/HeroSection";
import BenefitsSection from "@/components/sections/BenefitsSection";
import Footer from "@/components/sections/Footer";
import Navigation from "@/components/sections/Navigation";
import CouponsSection from "@/components/sections/CouponsSection";
import EventsSection from "@/components/sections/EventsSection";
import OrganizersSection from "@/components/sections/OrganizersSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      <main>
        <HeroSection />
        <CouponsSection />
        <EventsSection />
        <OrganizersSection />
        <BenefitsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;