import { Gift, MapPin, Star, Zap, Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FeaturesSection = () => {
  const features = [
    {
      icon: <Gift className="h-12 w-12 text-cyan-400 transition-transform duration-300 group-hover:scale-110" />,
      title: "Kuponok & Akciók",
      description: "Exkluzív kedvezmények és 1+1 ital akciók a legjobb helyeken. Mindig friss ajánlatok várnak rád!"
    },
    {
      icon: <MapPin className="h-12 w-12 text-purple-400 transition-transform duration-300 group-hover:scale-110" />,
      title: "Új Helyek Fedezése",
      description: "Ismerd meg Pécs rejtett kincseit kedvezményes áron. Mindig találsz valami újat és izgalmasat!"
    },
    {
      icon: <Star className="h-12 w-12 text-pink-400 transition-transform duration-300 group-hover:scale-110" />,
      title: "Prémium Kedvezmények",
      description: "VIP akciók és speciális ajánlatok csak a NOXLY felhasználóinak. Jobb, mint bármi más!"
    },
    {
      icon: <Zap className="h-12 w-12 text-blue-400 transition-transform duration-300 group-hover:scale-110" />,
      title: "Gyors Beváltás",
      description: "QR kód beolvasás és azonnali kuponaktiválás. Nem kell várnod, azonnal élvezheted az akciót!"
    },
    {
      icon: <Users className="h-12 w-12 text-yellow-400 transition-transform duration-300 group-hover:scale-110" />,
      title: "Közösségi Ajánlatok",
      description: "Több fős csoportos kedvezmények. Minél többen vagytok, annál jobb az akció!"
    },
    {
      icon: <Calendar className="h-12 w-12 text-green-400 transition-transform duration-300 group-hover:scale-110" />,
      title: "Heti Akciók",
      description: "Rendszeresen frissülő ajánlatok és heti kiemelt helyek. Soha nem unatkozol a hétvégén!"
    }
  ];

  return (
    <section id="features" className="py-20 px-6">
      <div className="container mx-auto">
        <Badge className="mb-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0">
          <Gift className="h-4 w-4 mr-2" />
          Akciók & Kedvezmények
        </Badge>
        
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-cyan-300">
          Hogyan spórolj az éjszakai életben?
        </h2>
        
        <p className="text-xl text-gray-300 text-center mb-16 max-w-2xl mx-auto">
          Fedezd fel Pécs legjobb helyeit kedvezményes áron!<br className="hidden md:block" /> Ingyenes italok, csoportos akciók és exkluzív ajánlatok.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-8 rounded-2xl border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 backdrop-blur-sm"
            >
              <div className="mb-6">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-cyan-300 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;