import { useState, useEffect } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import Navigation from "@/components/sections/Navigation";
import HeroSection from "@/components/sections/HeroSection";
import MapSection from "@/components/sections/MapSection";
import ComingSoonSection from "@/components/sections/ComingSoonSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import BenefitsSection from "@/components/sections/BenefitsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import WaitlistSection from "@/components/sections/WaitlistSection";
import FooterSection from "@/components/sections/FooterSection";
import DemoSection from "@/components/sections/DemoSection";
import FloatingDemoButton from "@/components/FloatingDemoButton";

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
        <FeaturesSection />
        <MapSection />
        <BenefitsSection />
        <div id="demo-section">
          <DemoSection />
        </div>
        <ComingSoonSection />
        <TestimonialsSection />
        <WaitlistSection />
      </div>
      <FooterSection />
      <FloatingDemoButton />
    </div>
  );
};

export default Index;