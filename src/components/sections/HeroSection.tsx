"use client";

import { Button } from "@/components/ui/button";
import { Bell, Play } from "lucide-react";

const HeroSection = () => {
  const scrollToWaitlist = () => {
    const waitlistSection = document.getElementById("waitlist");
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.1)_0%,rgba(0,0,0,0)_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(139,92,246,0.1)_0%,rgba(0,0,0,0)_70%)]"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-fade-in">
            NOXLY
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light">
            Éjszakai élet a Pécsi Egyetem szívében
          </p>
          
          {/* Description */}
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Fedezd fel Pécs legjobb bulihelyeit, DJ-ket és eseményeket egy alkalmazásban. 
            Kapcsolódj be a város éjszakai ritmusába!
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              onClick={scrollToWaitlist}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-6 text-lg border-0 rounded-2xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 animate-pulse"
              style={{ 
                animation: 'pulse 3s infinite',
                animationTimingFunction: 'ease-in-out'
              }}
            >
              <Bell className="mr-2 h-5 w-5" />
              Értesítést kérek
            </Button>
            
            <Button 
              variant="outline" 
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 px-8 py-6 text-lg rounded-2xl transition-all duration-300 hover:scale-105"
            >
              <Play className="mr-2 h-5 w-5" />
              Bemutató
            </Button>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-cyan-400">50+</div>
              <div className="text-gray-400">Helyszín</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">30+</div>
              <div className="text-gray-400">DJ</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400">100+</div>
              <div className="text-gray-400">Esemény</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
      <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
      <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
    </section>
  );
};

export default HeroSection;