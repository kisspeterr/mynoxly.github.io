import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

const HungaryMap = () => {
  const [isMapVisible, setIsMapVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMapVisible(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-purple-900/20 via-cyan-900/20 to-blue-900/20 rounded-3xl border-2 border-cyan-400/30 backdrop-blur-sm overflow-hidden">
      {/* Map background with subtle grid */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-cyan-500/5 to-blue-500/5">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle, #00ffff 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      {/* Hungary outline - more detailed shape */}
      <div className="absolute inset-4 flex items-center justify-center">
        <div className="relative w-80 h-56">
          {/* Main Hungary shape */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-cyan-600/10 rounded-lg border-2 border-cyan-400/40 shadow-lg shadow-cyan-400/20">
            {/* Detailed shape points */}
            <div className="absolute top-2 left-4 w-3 h-3 bg-cyan-400/30 rounded-full"></div>
            <div className="absolute top-8 left-12 w-3 h-3 bg-cyan-400/30 rounded-full"></div>
            <div className="absolute bottom-4 left-8 w-3 h-3 bg-cyan-400/30 rounded-full"></div>
            <div className="absolute top-4 right-16 w-3 h-3 bg-cyan-400/30 rounded-full"></div>
            <div className="absolute bottom-8 right-8 w-3 h-3 bg-cyan-400/30 rounded-full"></div>
          </div>
          
          {/* Pécs location marker - more prominent */}
          <div className={`absolute bottom-12 right-16 transition-all duration-1000 ${
            isMapVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}>
            <div className="relative">
              <div className="absolute -inset-6 bg-cyan-400/20 rounded-full animate-ping"></div>
              <div className="w-6 h-6 bg-cyan-400 rounded-full ring-4 ring-cyan-400/40 relative z-10 shadow-lg shadow-cyan-400/30"></div>
            </div>
            <div className={`absolute -top-12 -left-8 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-3 py-2 rounded-lg font-bold text-sm transition-all duration-700 delay-300 ${
              isMapVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              PÉCS
            </div>
          </div>
          
          {/* Other major cities - more visible markers */}
          <div className="absolute top-6 left-20 w-4 h-4 bg-purple-400/40 rounded-full ring-2 ring-purple-400/20"></div>
          <div className="absolute top-16 left-28 w-4 h-4 bg-purple-400/40 rounded-full ring-2 ring-purple-400/20"></div>
          <div className="absolute bottom-16 left-32 w-4 h-4 bg-purple-400/40 rounded-full ring-2 ring-purple-400/20"></div>
          <div className="absolute top-20 right-24 w-4 h-4 bg-purple-400/40 rounded-full ring-2 ring-purple-400/20"></div>
        </div>
      </div>
      
      {/* Connection lines */}
      <div className="absolute inset-0">
        {/* Line from Pécs to other cities */}
        <div className={`absolute bottom-12 right-16 w-20 h-20 border-r-2 border-t-2 border-cyan-400/30 rounded-tr-lg transition-all duration-1000 delay-500 ${
            isMapVisible ? 'opacity-100' : 'opacity-0'
          }`} style={{transform: 'translate(50%, -50%)'}}></div>
      </div>
      
      {/* Animated pulse effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-purple-400/5 to-blue-400/5 animate-pulse"></div>
    </div>
  );
};

const MapSection = () => {
  return (
    <section id="map" className="py-20 px-6">
      <div className="container mx-auto text-center">
        <Badge className="mb-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0">
          <MapPin className="h-4 w-4 mr-2" />
          Elindulás helye
        </Badge>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-cyan-300">
          Pécs lesz az első!
        </h2>
        
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          A NOXLY először Pécsen indítja el szolgáltatását, majd fokozatosan terjeszkedünk<br className="hidden md:block" /> egész Magyarország szerte.
        </p>
        
        <div className="mb-12">
          <HungaryMap />
        </div>
      </div>
    </section>
  );
};

export default MapSection;