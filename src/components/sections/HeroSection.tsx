import { Sparkles, Gift, Calendar, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

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
      
      {/* Dynamic Neon Background Layer (Simulating Pécs Mosque Silhouette) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10" 
          style={{ 
            // Using a placeholder image URL that visually suggests a city landmark/silhouette
            backgroundImage: `url('/api/placeholder/1920/1080')`,
            backgroundPosition: 'center bottom',
            backgroundSize: 'cover',
            filter: 'grayscale(100%) blur(2px)'
          }}
        ></div>
        
        {/* Neon Outline Effect Container */}
        <div className="absolute inset-0 flex items-end justify-center">
          <div className="relative w-full max-w-4xl h-64 mb-10">
            {/* Simulated Mosque Silhouette (using a simple shape for illustration) */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-full">
              
              {/* Neon Glow Effect (Outer) */}
              <div className="absolute inset-0 border-4 border-cyan-400/50 rounded-t-[50%] shadow-[0_0_40px_rgba(52,211,255,0.8)] animate-pulse-slow"></div>
              
              {/* Neon Moving Light (Inner) - Simulating the light going around the outline */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-cyan-400 rounded-t-[50%] opacity-0 animate-neon-sweep"></div>
              </div>
              
              {/* Text Overlay to ensure readability */}
              <div className="absolute inset-0 bg-slate-950/50"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Layer (Z-10) */}
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