"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const FloatingScrollArrow = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const isMobile = useIsMobile();

  const sections = [
    'hero-section',
    'features',
    'map',
    'benefits',
    'demo-section',
    'coming-soon',
    'testimonials',
    'waitlist'
  ];

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById('hero-section');
      const demoSection = document.getElementById('demo-section');
      
      if (heroSection && demoSection) {
        const scrollPosition = window.scrollY;
        const sectionPositions = sections.map(id => {
          const element = document.getElementById(id);
          return element ? element.offsetTop : 0;
        });

        // Find current section based on scroll position
        let current = 0;
        for (let i = sections.length - 1; i >= 0; i--) {
          if (scrollPosition >= sectionPositions[i] - 100) {
            current = i;
            break;
          }
        }

        setCurrentSection(current);
        
        // Show button when scrolled past hero section
        setIsScrolledPastHero(window.scrollY > heroSection.offsetHeight);
        
        // Show button when demo section is NOT in view
        setIsVisible(window.scrollY > heroSection.offsetHeight && demoSection.getBoundingClientRect().top > window.innerHeight);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToNextSection = () => {
    const nextSection = currentSection + 1;
    
    if (nextSection < sections.length) {
      const element = document.getElementById(sections[nextSection]);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Scroll to top when at bottom
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isAtBottom = currentSection === sections.length - 1;

  if (!isScrolledPastHero) return null;

  return (
    <div className={`fixed z-40 transition-all duration-500 ease-in-out ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
    } ${isMobile ? 'bottom-20 left-6' : 'bottom-32 left-8'}`}>
      <Button
        onClick={scrollToNextSection}
        className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white rounded-full shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all duration-300 hover:scale-110 group"
        size="icon"
      >
        {isAtBottom ? (
          <ChevronUp className="h-6 w-6 group-hover:scale-110 transition-transform" />
        ) : (
          <ChevronDown className="h-6 w-6 group-hover:scale-110 transition-transform" />
        )}
      </Button>
    </div>
  );
};

export default FloatingScrollArrow;