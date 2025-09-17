import { Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
      
      {/* Stars */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center">
          {/* Logo/Brand */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-2xl shadow-blue-500/25">
              <Moon className="h-8 w-8 mr-3" />
              <span className="text-3xl font-bold tracking-tight">NOXLY</span>
            </div>
          </div>

          {/* Main headline */}
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
            Éjjel <span className="text-white">is</span> nyitva
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Fedezd fel Pécs éjjeli életét egy helyen. Bárok, klubok, és éjszakai szórakozás – minden, ami kell az tökéletes éjszakához.
          </p>

          {/* Animated coming soon text */}
          <div className="mb-12">
            <div className="inline-flex items-center bg-black/30 backdrop-blur-sm border border-blue-500/30 rounded-2xl px-6 py-3">
              <span className="text-lg font-semibold text-blue-300 animate-pulse">
                Hamarosan Pécsen
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-6 text-lg rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25">
              Értesítést kérek
            </Button>
            <Button variant="outline" className="border-blue-400 text-blue-300 px-8 py-6 text-lg rounded-2xl hover:bg-blue-400/10 transition-all duration-300">
              Tudj meg többet
            </Button>
          </div>

          {/* Animated moon icon */}
          <div className="mt-20">
            <div className="relative">
              <div className="relative">
                <Moon className="h-20 w-20 text-cyan-400 mx-auto animate-float" />
                <div className="absolute -inset-4 bg-cyan-400/10 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;