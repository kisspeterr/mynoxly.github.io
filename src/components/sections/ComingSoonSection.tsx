import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const ComingSoonSection = () => {
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressValue(75);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="coming-soon" className="py-20 px-6 bg-gradient-to-b from-gray-900 via-black to-black">
      <div className="container mx-auto text-center">
        <Badge className="mb-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0">
          Hamarosan
        </Badge>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-cyan-300">
          Készülj fel az élményre!
        </h2>
        
        <p className="text-xl text-gray-300 mb-16 max-w-2xl mx-auto">
          A NOXLY hamarosan elérhető lesz Pécsen.<br className="hidden md:block" /> Kövesd a fejlesztésünket és légy az első, aki kipróbálja!
        </p>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">Fejlesztési állapot</h3>
              
              <div className="mb-6">
                <Progress 
                  value={progressValue} 
                  className="h-3 bg-slate-700 mb-2"
                  indicatorClassName="bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-1000 ease-out"
                />
                <p className="text-sm text-gray-400">
                  {progressValue}% - Fejlesztés folyamatban
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
                <div className="text-3xl font-bold text-cyan-300 mb-2">1.0</div>
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
              <button className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
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