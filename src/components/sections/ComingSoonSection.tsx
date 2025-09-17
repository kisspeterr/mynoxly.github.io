import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const ComingSoonSection = () => {
  const [progressValue, setProgressValue] = useState(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressValue(75);
      
      // Animate the counter from 0 to 75
      let start = 0;
      const end = 75;
      const duration = 1000; // 1 second
      const increment = 1;
      const steps = duration / (1000 / 30); // 30fps
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
  }, []);

  return (
    <section id="coming-soon" className="py-20 px-6 bg-black/30">
      <div className="container mx-auto text-center">
        <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
          Hamarosan
        </Badge>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-blue-300">
          Készülj fel az élményre!
        </h2>
        
        <p className="text-xl text-gray-300 mb-16 max-w-2xl mx-auto">
          A NOXLY hamarosan elérhető lesz Pécsen.<br className="hidden md:block" /> Kövesd a fejlesztésünket és légy az első, aki kipróbálja!
        </p>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl p-8 md:p-12 backdrop-blul-sm">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">Fejlesztési állapot</h3>
              
              <div className="mb-6">
                <Progress 
                  value={progressValue} 
                  className="h-3 bg-slate-700 mb-2"
                  indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-out"
                />
                <p className="text-sm text-gray-400">
                  {displayValue}% - Fejlesztés folyamatban
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
                <div className="text-3xl font-bold text-blue-300 mb-2">1.0</div>
                <p className="text-gray-300">Verzió</p>
              </div>
              
              <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
                <div className="text-3xl font-bold text-purple-300 mb-2">100+</div>
                <p className="text-gray-300">Partner</p>
              </div>
              
              <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
                <div className="text-3xl font-bold text-pink-300 mb-2">24/7</div>
                <p className="text-gray-300">Támogatás</p>
              </div>
            </div>
            
            <div className="mt-8">
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
                Értesítést kérek
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComingSoonSection;