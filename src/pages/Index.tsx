import { useState, useEffect } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Star, MapPin, Calendar, Users, Sparkles, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-black/80 backdrop-blur-md" : "bg-transparent"}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Moon className="h-8 w-8 text-cyan-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                NOXLY
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-cyan-300 transition-colors">Funkciók</a>
              <a href="#about" className="hover:text-cyan-300 transition-colors">Rólunk</a>
              <a href="#contact" className="hover:text-cyan-300 transition-colors">Kapcsolat</a>
            </div>
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 border-0">
              Letöltés
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Pécs Skyline */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Pécs Skyline Neon Outline */}
        <div className="absolute inset-0 z-0">
          <div className="absolute bottom-0 left-0 right-0 h-80">
            {/* Székesegyház és belváros neon körvonalak */}
            <svg viewBox="0 0 1200 300" className="w-full h-full">
              {/* Székesegyház körvonal */}
              <path 
                d="M500,200 L520,170 L540,150 L560,130 L580,120 L600,110 L620,120 L640,130 L660,150 L680,170 L700,200 Z" 
                fill="none" 
                stroke="url(#neonGradient)" 
                strokeWidth="4"
                strokeLinejoin="round"
                className="drop-shadow-glow"
              />
              
              {/* Egyháztornyok */}
              <path 
                d="M580,120 L580,80 L600,70 L620,80 L620,120" 
                fill="none" 
                stroke="url(#neonGradient)" 
                strokeWidth="3"
                className="drop-shadow-glow"
              />
              
              {/* Belváros épületek bal oldalon */}
              <path 
                d="M200,200 L220,180 L240,160 L260,140 L280,130 L300,120 L320,130 L340,140 L360,160 L380,180 L400,200" 
                fill="none" 
                stroke="url(#neonPurple)" 
                strokeWidth="3"
                className="drop-shadow-glow"
              />
              
              {/* Belváros épületek jobb oldalon */}
              <path 
                d="M800,200 L820,180 L840,160 L860,140 L880,130 L900,120 L920,130 L940,140 L960,160 L980,180 L1000,200" 
                fill="none" 
                stroke="url(#neonPink)" 
                strokeWidth="3"
                className="drop-shadow-glow"
              />
              
              {/* További épületek a középen */}
              <path 
                d="M450,200 L460,190 L470,180 L480,170 L490,160 L500,150 L510,160 L520,170 L530,180 L540,190 L550,200" 
                fill="none" 
                stroke="url(#neonCyan)" 
                strokeWidth="2"
                className="drop-shadow-glow"
              />
              
              <path 
                d="M650,200 L660,190 L670,180 L680,170 L690,160 L700,150 L710,160 L720,170 L730,180 L740,190 L750,200" 
                fill="none" 
                stroke="url(#neonCyan)" 
                strokeWidth="2"
                className="drop-shadow-glow"
              />
              
              {/* Gradiens definíciók */}
              <defs>
                <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00FFFF" />
                  <stop offset="100%" stopColor="#FF00FF" />
                </linearGradient>
                <linearGradient id="neonPurple" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9333EA" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
                <linearGradient id="neonPink" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#F97316" />
                </linearGradient>
                <linearGradient id="neonCyan" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00FFFF" />
                  <stop offset="100%" stopColor="#0EA5E9" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full"></div>
              <Moon className="h-20 w-20 text-cyan-400 relative z-10" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            NOXLY
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Fedezd fel Pécs éjszakai életét egy modern, letisztult alkalmazással
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-6 text-lg border-0 rounded-2xl">
              <Sparkles className="mr-2 h-5 w-5" />
              Kezdjük el
            </Button>
            <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 px-8 py-6 text-lg rounded-2xl">
              Tudj meg többet
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-black/30">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-cyan-300">
            Miért válaszd a NOXLY-t?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-slate-900/50 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-400/40 transition-all duration-300">
              <CardHeader>
                <MapPin className="h-12 w-12 text-cyan-400 mb-4" />
                <CardTitle className="text-cyan-300">Élő Térkép</CardTitle>
                <CardDescription className="text-gray-400">
                  Valós idejű információ Pécs legjobb helyeiről
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300">
              <CardHeader>
                <Calendar className="h-12 w-12 text-purple-400 mb-4" />
                <CardTitle className="text-purple-300">Események</CardTitle>
                <CardDescription className="text-gray-400">
                  Minden fontos esemény egy helyen
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/50 border-pink-500/20 backdrop-blur-sm hover:border-pink-400/40 transition-all duration-300">
              <CardHeader>
                <Users className="h-12 w-12 text-pink-400 mb-4" />
                <CardTitle className="text-pink-300">Közösség</CardTitle>
                <CardDescription className="text-gray-400">
                  Találkozz új emberekkel és barátokkal
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* App Showcase */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
            Modern Design,<br />Kivételes Tapasztalat
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Az Apple design filozófiáját követve hoztuk létre a NOXLY-t, hogy minden részlet tökéletes legyen
          </p>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-cyan-500/10 blur-3xl rounded-3xl"></div>
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-cyan-500/20 backdrop-blur-sm">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-cyan-300 mb-4">Intuitív Kezelőfelület</h3>
                  <p className="text-gray-300 mb-6">
                    Gyors és egyszerű navigáció, minden információ az ujjaid hegyén
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-cyan-200">
                      <Star className="h-4 w-4 mr-2 fill-cyan-400" />
                      Valós idejű frissítések
                    </li>
                    <li className="flex items-center text-cyan-200">
                      <Star className="h-4 w-4 mr-2 fill-cyan-400" />
                      Personalizált ajánlások
                    </li>
                    <li className="flex items-center text-cyan-200">
                      <Star className="h-4 w-4 mr-2 fill-cyan-400" />
                      Offline működés
                    </li>
                  </ul>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-2xl rounded-full"></div>
                  <div className="relative bg-slate-800 rounded-2xl p-6 border border-cyan-500/30">
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                        <div className="w-16 h-4 bg-cyan-500/30 rounded-full"></div>
                        <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 bg-cyan-400/40 rounded"></div>
                        <div className="h-4 bg-cyan-400/20 rounded w-3/4"></div>
                        <div className="h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg mt-4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-black/50 border-t border-cyan-500/20">
        <div className="container mx-auto text-center">
          <div className="flex justify-center items-center mb-6">
            <Moon className="h-8 w-8 text-cyan-400 mr-2" />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              NOXLY
            </span>
          </div>
          <p className="text-gray-400 mb-4">
            © 2024 NOXLY - Pécs éjszakai élete. Minden jog fenntartva.
          </p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Adatvédelem</a>
            <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Felhasználási feltételek</a>
            <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Kapcsolat</a>
          </div>
        </div>
      </footer>

      <MadeWithDyad />
    </div>
  );
};

export default Index;