import { Sparkles, Gift, Calendar, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const HeroSection = () => {
  const scrollToCoupons = () => {
    const couponsSection = document.getElementById('coupons-section');
    if (couponsSection) {
      couponsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToEvents = () => {
    const eventsSection = document.getElementById('events-section');
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const scrollToOrganizers = () => {
    const organizersSection = document.getElementById('organizers-section');
    if (organizersSection) {
      organizersSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero-section" className="pt-32 pb-20 px-6 relative overflow-hidden">
      
      {/* --- Pécs TV Tower Neon Background --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-auto opacity-20 md:opacity-30 lg:opacity-40" 
          viewBox="0 0 800 600" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Base Tower Structure (Stilized) */}
          <path 
            d="M400 600 L380 150 L420 150 L400 600 Z" 
            stroke="url(#neonGradient)" 
            strokeWidth="10" 
            strokeLinecap="round"
            className="animate-fade-in"
            style={{ animationDelay: '0.5s' }}
          />
          {/* Observation Deck (Stilized) */}
          <circle 
            cx="400" 
            cy="150" 
            r="50" 
            stroke="url(#neonGradient)" 
            strokeWidth="10" 
            fill="none"
            className="animate-fade-in"
            style={{ animationDelay: '0.8s' }}
          />
          {/* Antenna */}
          <path 
            d="M400 100 L400 0" 
            stroke="url(#neonGradient)" 
            strokeWidth="5" 
            strokeLinecap="round"
            className="animate-fade-in"
            style={{ animationDelay: '1.1s' }}
          />
          
          {/* Neon Gradient Definition */}
          <defs>
            <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'rgb(0, 255, 255)', stopOpacity: 1 }} /> {/* Cyan */}
              <stop offset="100%" style={{ stopColor: 'rgb(192, 0, 255)', stopOpacity: 1 }} /> {/* Purple */}
            </linearGradient>
          </defs>
        </svg>
        
        {/* Subtle glow effect at the base */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-40 bg-cyan-500/10 blur-3xl animate-pulse-slow"></div>
      </div>
      {/* --- End Background --- */}
      
      <div className="container mx-auto text-center relative z-10">
        <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-400/30 animate-bounce">
          <Sparkles className="h-4 w-4 mr-2" />
          Pécsi Egyetemisták Kedvence
        </Badge>
        
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative z-10 p-4 bg-black/30 rounded-full border border-purple-500/50 shadow-xl shadow-purple-500/20">
              <Sparkles className="h-16 w-16 text-purple-400 mx-auto animate-spin-slow" />
            </div>
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
          NOXLY
        </h1>
        
        <p className="text-xl md:text-3xl font-semibold text-white mb-4 max-w-4xl mx-auto">
          Ahol az éjszaka kezdődik. Exkluzív kuponok, események és hűségpontok Pécsen.
        </p>
        
        <p className="text-lg text-gray-400 mb-8 max-w-3xl mx-auto">
          Spórolj a bulikon, gyűjts pontokat a kedvenc helyeiden, és fedezd fel a város legjobb akcióit. Ne maradj le a NOXLY-val!
        </p>
        
        {/* Responsive Button Group: Stacks on mobile, horizontal on larger screens */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button 
            onClick={scrollToCoupons}
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-6 text-lg border-0 rounded-2xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105"
          >
            <Gift className="mr-2 h-5 w-5" />
            Kuponok
          </Button>
          <Button 
            onClick={scrollToEvents}
            variant="outline" 
            className="w-full sm:w-auto border-purple-400 text-purple-400 hover:bg-purple-400/10 px-8 py-6 text-lg rounded-2xl group transition-all duration-300 hover:scale-105"
          >
            <Calendar className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Események
          </Button>
          <Button 
            onClick={scrollToOrganizers}
            variant="outline" 
            className="w-full sm:w-auto border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 px-8 py-6 text-lg rounded-2xl group transition-all duration-300 hover:scale-105"
          >
            <Building className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Partnerek
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;