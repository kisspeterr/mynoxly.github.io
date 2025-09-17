import { Sparkles, Moon, Bell, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const HeroSection = () => {
  const stats = [
    { number: "500+", label: "Előregisztrált felhasználó" },
    { number: "30+", label: "Érdeklődő partner" },
    { number: "2024", label: "Bemutató éve" },
    { number: "24/7", label: "Támogatás" }
  ];

  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo-section');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-32 pb-20 px-6">
      <div className="container mx-auto text-center">
        <Badge className="mb-6 bg-cyan-500/20 text-cyan-300 border-cyan-400/30 animate-bounce">
          <Sparkles className="h-4 w-4 mr-2" />
          Hamarosan Pécsett!
        </Badge>
        
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative z-10">
              <Moon className="h-20 w-20 text-cyan-400 mx-auto animate-float" />
              <div className="absolute -inset-4 bg-cyan-400/10 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
          NOXLY
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
          Akciók, Kuponok és Kedvezmények
        </p>
        
        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          Fedezd fel Pécs legjobb éjszakai helyeit kedvezményes áron. Exkluzív akciók, 1+1 italok és VIP kedvezmények egy alkalmazásban!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-6 text-lg border-0 rounded-2xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 animate-pulse">
            <Bell className="mr-2 h-5 w-5" />
            Értesítést kérek
          </Button>
          <Button 
            variant="outline" 
            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 px-8 py-6 text-lg rounded-2xl group transition-all duration-300 hover:scale-105"
            onClick={scrollToDemo}
          >
            <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Kipróbálom
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-cyan-300 mb-2 animate-count">
                {stat.number}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;