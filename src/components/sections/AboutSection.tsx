import { Badge } from "@/components/ui/badge";
import { Zap, MapPin, Heart } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-20 px-6 bg-black/50 border-t border-b border-purple-500/20">
      <div className="container mx-auto max-w-4xl">
        <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <Zap className="h-4 w-4 mr-2" />
          A NOXLY-ról
        </Badge>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-purple-300 text-center">
          A Pécsi Éjszakai Élet Újragondolva
        </h2>
        
        <p className="text-xl text-gray-300 mb-12 text-center">
          A NOXLY egy mobilalkalmazás, amely összeköti a pécsi szórakozóhelyeket, éttermeket és programokat a helyi egyetemistákkal és lakosokkal. Célunk, hogy minden este felejthetetlen legyen, kedvezményekkel és exkluzív ajánlatokkal.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-xl bg-purple-900/30 border border-purple-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10">
            <MapPin className="h-10 w-10 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">Helyi Fókusz</h3>
            <p className="text-gray-400 text-sm">
              Kizárólag Pécsre koncentrálunk, hogy a legpontosabb és legrelevánsabb információkat nyújthassuk a város éjszakai életéről.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-cyan-900/30 border border-cyan-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/10">
            <Gift className="h-10 w-10 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-purple-300 mb-2">Exkluzív Kuponok</h3>
            <p className="text-gray-400 text-sm">
              Csak a NOXLY felhasználói számára elérhető 1+1 akciók, ingyenes belépők és hűségpont alapú kedvezmények.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-pink-900/30 border border-pink-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-500/10">
            <Heart className="h-10 w-10 text-pink-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-pink-300 mb-2">Közösségi Élmény</h3>
            <p className="text-gray-400 text-sm">
              Kövesd kedvenc helyeidet, gyűjts hűségpontokat és oszd meg a legjobb pillanatokat barátaiddal.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;