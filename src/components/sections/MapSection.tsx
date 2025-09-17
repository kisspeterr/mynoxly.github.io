import { MapPin, Users2, TrendingUp, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative bg-slate-800/30 rounded-2xl p-8 border border-cyan-500/20 backdrop-blur-sm">
        {/* Hungary outline */}
        <div className="relative mx-auto w-48 h-32 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 rounded-lg border border-purple-400/30">
          {/* Pécs location marker */}
          <div className={`absolute bottom-8 right-12 transition-all duration-1000 ${
            isMapVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}>
            <div className="relative">
              <div className="absolute -inset-4 bg-cyan-400/20 rounded-full animate-ping"></div>
              <div className="w-4 h-4 bg-cyan-400 rounded-full ring-4 ring-cyan-400/30 relative z-10"></div>
            </div>
            <div className={`absolute -top-8 -left-4 bg-cyan-500 text-white text-xs px-2 py-1 rounded-md font-semibold transition-all duration-700 delay-300 ${
              isMapVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Pécs
            </div>
          </div>
          
          {/* Other major cities - faint markers */}
          <div className="absolute top-4 left-8 w-2 h-2 bg-gray-400/30 rounded-full"></div>
          <div className="absolute top-12 left-16 w-2 h-2 bg-gray-400/30 rounded-full"></div>
          <div className="absolute bottom-4 left-20 w-2 h-2 bg-gray-400/30 rounded-full"></div>
        </div>
        
        {/* Map legend */}
        <div className={`mt-4 text-center transition-all duration-700 delay-500 ${
          isMapVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="inline-flex items-center space-x-2 bg-black/30 px-3 py-2 rounded-lg">
            <div className="w-3 h-3 bg-cyan-400 rounded-full ring-2 ring-cyan-400/30"></div>
            <span className="text-sm text-cyan-300 font-medium">Első város: Pécs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MapSection = () => {
  return (
    <section id="map" className="py-20 px-6 bg-black/30">
      <div className="container mx-auto text-center">
        <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-400/30">
          <MapPin className="h-4 w-4 mr-2" />
          Elindulás helye
        </Badge>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-cyan-300">
          Pécs lesz az első!
        </h2>
        
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          A NOXLY először Pécsen indítja el szolgáltatását, majd fokozatosan terjeszkedünk<br className="hidden md:block" /> egész Magyarország szerte.
        </p>
        
        <HungaryMap />
        
        <div className="mt-8 max-w-2xl mx-auto">
          <Card className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-2xl text-cyan-300">Miért Pécs?</CardTitle>
              <CardDescription className="text-gray-300">
                A diákváros vibráló éjszakai élete és aktív közössége ideális terep az innováció bemutatására.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-cyan-500/10 rounded-lg">
                  <Users2 className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                  <div className="text-cyan-300 font-semibold">Aktív közösség</div>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-purple-300 font-semibold">Növekvő piac</div>
                </div>
                <div className="p-4 bg-pink-500/10 rounded-lg">
                  <Heart className="h-8 w-8 text-pink-400 mx-auto mb-2" />
                  <div className="text-pink-300 font-semibold">Innovációbarát</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default MapSection;