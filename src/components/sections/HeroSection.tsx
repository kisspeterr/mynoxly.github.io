"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const HeroSection = () => {
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNotifyMe = () => {
    toast({
      title: "Értesítés beállítva!",
      description: "Értesíteni fogunk, amint az alkalmazás elérhető.",
    });
    setIsSubscribed(true);
  };

  const handleBecomePartner = () => {
    toast({
      title: "Köszönjük az érdeklődést!",
      description: "Felvesszük veled a kapcsolatot a partnerséggel kapcsolatban.",
    });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      
      {/* Animated background elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
            NOXLY
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
            Forradalmi <span className="text-cyan-400 font-semibold">AI</span> megoldás
          </p>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            a hatékonyabb <span className="text-purple-400 font-semibold">munkavégzéshez</span>
          </p>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-6 text-lg border-0 rounded-2xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 animate-pulse"
              onClick={handleNotifyMe}
              disabled={isSubscribed}
            >
              <Bell className="mr-2 h-5 w-5" />
              {isSubscribed ? "Értesítés beállítva" : "Értesítést kérek"}
            </Button>
            
            <Button 
              variant="outline"
              className="bg-transparent border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 px-8 py-6 text-lg rounded-2xl transition-all duration-300 hover:scale-105"
              onClick={handleBecomePartner}
            >
              <Users className="mr-2 h-5 w-5" />
              Legyél partner
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">1000+</div>
              <div className="text-gray-400">Előregisztrált felhasználó</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">50+</div>
              <div className="text-gray-400">Funkció fejlesztés alatt</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-400 mb-2">24/7</div>
              <div className="text-gray-400">AI támogatás</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;