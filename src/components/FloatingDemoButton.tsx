"use client";

import { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const FloatingDemoButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById('hero-section');
      const demoSection = document.getElementById('demo-section');
      
      if (heroSection && demoSection) {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        const demoTop = demoSection.getBoundingClientRect().top;
        
        // Show button when scrolled past hero section
        setIsScrolledPastHero(window.scrollY > heroSection.offsetHeight);
        
        // Hide button when demo section is in view
        setIsVisible(window.scrollY > heroSection.offsetHeight && demoTop > window.innerHeight);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo-section');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isScrolledPastHero) return null;

  return (
    <div className={`fixed z-50 transition-all duration-500 ease-in-out ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
    } ${isMobile ? 'bottom-6 right-6' : 'bottom-8 right-8'}`}>
      <Button
        onClick={scrollToDemo}
        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-full shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 transition-all duration-300 hover:scale-110 group animate-bounce"
        size={isMobile ? "icon" : "lg"}
      >
        <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
        {!isMobile && (
          <span className="ml-2 font-semibold">Kipróbálom</span>
        )}
      </Button>
    </div>
  );
};

export default FloatingDemoButton;