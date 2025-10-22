import { useState, useEffect } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import Navigation from "@/components/sections/Navigation";
import HeroSection from "@/components/sections/HeroSection";
import MapSection from "@/components/sections/MapSection";
import ComingSoonSection from "@/components/sections/ComingSoonSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import FooterSection from "@/components/sections/FooterSection";
import FloatingDemoButton from "@/components/FloatingDemoButton";
import FloatingScrollArrow from "@/components/FloatingScrollArrow";
import CouponsSection from "@/components/sections/CouponsSection";
import EventsSection from "@/components/sections/EventsSection";
import OrganizersSection from "@/components/sections/OrganizersSection";

const Index = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white">
      <Navigation isScrolled={isScrolled} />
      <div id="hero-section">
        <HeroSection />
      </div>
      <div className="bg-black/30">
        <CouponsSection />
        <EventsSection />
        <OrganizersSection />
        <MapSection />
        <ComingSoonSection />
        <TestimonialsSection />
        {/* WaitlistSection removed */}
      </div>
      <FooterSection />
      {/* Floating buttons are now less relevant as they pointed to Demo/Waitlist, but keeping them for now */}
      <FloatingDemoButton />
      <FloatingScrollArrow />
    </div>
  );
};

export default Index;