import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Clock, TrendingUp } from "lucide-react";

const ComingSoonSection = () => {
  const [progressValue, setProgressValue] = useState(0);
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setProgressValue(75);
        
        // Animate the counter from 0 to 75
        let start = 0;
        const end = 75;
        const duration = 3500;
        const steps = duration / (1000 / 30);
        const stepValue = end / steps;
        
        const counter = setInterval(() => {
          start += stepValue;
          if (start >= end) {
            setDisplayValue(end);
            clearInterval(counter);
          } else {
            setDisplayValue(Math.floor(start));
          }
        }, 1000 / 30);
        
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleRestartAnimation = () => {
    setProgressValue(0);
    setDisplayValue(0);
    setTimeout(() => {
      setProgressValue(75);
      
      let start = 0;
      const end = 75;
      const duration = 3500;
      const steps = duration / (1000 / 30);
      const stepValue = end / steps;
      
      const counter = setInterval(() => {
        start += stepValue;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(counter);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 1000 / 30);
    }, 300);
  };

  return (
    <section id="coming-soon" className="py-20 px-6 bg-black/30" ref={sectionRef}>
      <div className="container mx-auto text-center">
        <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 animate-pulse">
          <Sparkles className="h-4 w-4 mr-2" />
          Hamarosan
        </Badge>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent animate-gradient">
          Készülj fel az élményre!
        </h2>
        
        <p className="text-xl text-gray-300 mb-16 max-w-2xl mx-auto animate-fade-in-up">
          A NOXLY hamarosan elérhető lesz Pécsen.<br className="hidden md:block" /> Kövesd a fejlesztésünket és légy az első, aki kipróbálja!
        </p>
        
        <div className="max-w-2xl mx-auto">
          <div 
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl p-8 md:p-12 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-2">
                <TrendingUp className="h-6 w-6 text-blue-300 animate-bounce" />
                Fejlesztési állapot
                <TrendingUp className="h-6 w-6 text-purple-300 animate-bounce" />
              </h3>
              
              <div className="mb-6 relative">
                <div className="h-4 bg-slate-700/50 rounded-full mb-2 overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-3500 ease-out rounded-full relative overflow-hidden"
                    style={{ width: `${progressValue}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">0%</span>
                  <span className="text-sm font-bold text-blue-300 animate-pulse">
                    {displayValue}% - Fejlesztés folyamatban
                  </span>
                  <span className="text-sm text-gray-400">100%</span>
                </div>
                
                {/* Animated particles */}
                <div className="absolute -top-2 left-0 right-0 h-4">
                  {[0, 25, 50, 75, 100].map((position) => (
                    <div
                      key={position}
                      className="absolute w-2 h-2 bg-white rounded-full transform -translate-y-1/2 opacity-60"
                      style={{ left: `${position}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-8">
              <div className="bg-gradient-to-br from-blue-600/30 to-blue-800/30 p-6 rounded-2xl border border-blue-500/30 hover:scale-105 transition-transform duration-300 group">
                <div className="text-3xl font-bold text-blue-300 mb-2 group-hover:scale-110 transition-transform duration-300">1.0</div>
                <p className="text-gray-300">Verzió</p>
                <div className="absolute -top-2 -right-2">
                  <Zap className="h-4 w-4 text-blue-400 animate-ping" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-600/30 to-purple-800/30 p-6 rounded-2xl border border-purple-500/30 hover:scale-105 transition-transform duration-300 group">
                <div className="text-3xl font-bold text-purple-300 mb-2 group-hover:scale-110 transition-transform duration-300">100+</div>
                <p className="text-gray-300">Partner</p>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-4 w-4 text-purple-400 animate-ping" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-pink-600/30 to-pink-800/30 p-6 rounded-2xl border border-pink-500/30 hover:scale-105 transition-transform duration-300 group">
                <div className="text-3xl font-bold text-pink-300 mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
                <p className="text-gray-300">Támogatás</p>
                <div className="absolute -top-2 -right-2">
                  <Clock className="h-4 w-4 text-pink-400 animate-ping" />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleRestartAnimation}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 group"
              >
                <Zap className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                Animáció újraindítása
              </Button>
              
              <Button 
                variant="outline" 
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 px-6 py-3 rounded-xl group transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Értesítést kérek
              </Button>
            </div>
            
            {/* Interactive hover effect */}
            {isHovered && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl pointer-events-none"></div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComingSoonSection;