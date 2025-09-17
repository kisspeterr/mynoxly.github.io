import { Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const ComingSoonSection = () => {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-cyan-500/20 text-cyan-300 border-cyan-400/30">
            <Clock className="h-4 w-4 mr-2" />
            Előkészületben
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-purple-300">
            Készüljön fel valami nagyszerűre!
          </h2>
          
          <p className="text-xl text-gray-300 mb-8">
            A NOXLY csapata keményen dolgozik azon, hogy hamarosan bemutathassuk Önöknek<br className="hidden md:block" /> a legmodernebb platformot városod éjszakai életéhez.
          </p>
          
          <div className="bg-slate-900/50 rounded-2xl p-8 border border-cyan-500/20 backdrop-blur-sm hover:scale-105 transition-transform duration-500">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center animate-spin-slow">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -inset-2 bg-cyan-500/20 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-cyan-300 mb-4">Közeledik a bemutató!</h3>
            <p className="text-gray-400 mb-6">
              Iratkozzon fel értesítőnkre, és legyen az első, aki kipróbálja a NOXLY-t Pécsen!
            </p>
            
            <Progress value={75} className="mb-4 bg-slate-700" />
            <p className="text-sm text-gray-400">75% - Fejlesztés folyamatban</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComingSoonSection;