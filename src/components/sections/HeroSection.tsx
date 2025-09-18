"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Zap, Shield, Users } from "lucide-react";

const HeroSection = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const scrollToWaitlist = () => {
    const waitlistSection = document.getElementById("waitlist");
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-fade-in">
            NOXLY
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-4 text-gray-300 max-w-2xl mx-auto">
            A jövő személyes asszisztense
          </p>
          
          {/* Description */}
          <p className="text-lg mb-12 text-gray-400 max-w-3xl mx-auto">
            Egy mesterséges intelligencia, amely megérti a gondolataidat és segít a produktivitásban. 
            Felejtsd el a bonyolult felületeket - beszélj természetesen az AI-dal.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              onClick={scrollToWaitlist}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-6 text-lg border-0 rounded-2xl shadow-lg shadow-cyan-500/15 hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105 animate-pulse-slow"
            >
              <Bell className="mr-2 h-5 w-5" />
              Értesítést kérek
            </Button>
            <Button 
              onClick={scrollToWaitlist}
              variant="outline" 
              className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10 px-8 py-6 text-lg rounded-2xl transition-all duration-300 hover:scale-105"
            >
              Csatlakozom a várólistához
            </Button>
          </div>
          
          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-black/30 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6">
                <Zap className="h-10 w-10 text-cyan-400 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold mb-2 text-white">Azonnali válaszok</h3>
                <p className="text-gray-400">Kapj azonnali válaszokat kérdéseidre természetes nyelven.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-black/30 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6">
                <Shield className="h-10 w-10 text-cyan-400 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold mb-2 text-white">Biztonságos</h3>
                <p className="text-gray-400">Adataid titkosítva vannak és soha nem osztjuk meg harmadik féllel.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-black/30 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6">
                <Users className="h-10 w-10 text-cyan-400 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold mb-2 text-white">Személyre szabott</h3>
                <p className="text-gray-400">Tanul a viselkedésedből, hogy jobban megértsen.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-cyan-500/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-cyan-500/70 rounded-full mt-2 animate-scroll"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;