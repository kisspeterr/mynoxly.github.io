import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Play, Users, Zap } from "lucide-react";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-60 h-60 bg-cyan-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto text-center relative z-10 px-4">
        <Badge className="mb-6 bg-cyan-500/20 text-cyan-300 border-cyan-400/30 animate-bounce">
          <Sparkles className="h-4 w-4 mr-2" />
          Hamarosan Pécsett
        </Badge>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
          NOXLY
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
          Forradalmasítsd az éjszakád Pécs legújabb eseményhelyszínén. 
          Egyedi hangulat, kifinomult technológia és felejthetetlen élmények.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-6 text-lg rounded-2xl">
            <Play className="mr-2 h-5 w-5" />
            Virtuális túra
          </Button>
          <Button variant="outline" className="border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10 px-8 py-6 text-lg rounded-2xl">
            <Users className="mr-2 h-5 w-5" />
            Értesítést kérek
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-gray-900/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
            <Zap className="h-10 w-10 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Prémium hangtechnika</h3>
            <p className="text-gray-400">Csúcstechnológiás hangrendszer az élvezeti kategóriában</p>
          </div>
          
          <div className="bg-gray-900/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
            <div className="h-10 w-10 text-cyan-400 mx-auto mb-4 flex items-center justify-center">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse mx-1 animation-delay-200"></div>
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse animation-delay-400"></div>
            </div>
            <h3 className="text-xl font-bold mb-2">Interaktív világítás</h3>
            <p className="text-gray-400">LED rendszer, ami reagál a zene ritmusára</p>
          </div>
          
          <div className="bg-gray-900/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
            <Users className="h-10 w-10 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Privát események</h3>
            <p className="text-gray-400">Személyre szabott élmények barátaiddal</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;