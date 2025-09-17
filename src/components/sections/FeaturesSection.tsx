import { Calendar, MapPin, Clock, Users, Star, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FeaturesSection = () => {
  const features = [
    {
      icon: <Calendar className="h-12 w-12 text-cyan-400 transition-transform duration-300 group-hover:scale-110" />,
      title: "Okos foglalás",
      description: "Intelligens rendszer, amely az időjárást, forgalmat és eseményeket figyelembe véve javasolja a legjobb időpontokat."
    },
    {
      icon: <MapPin className="h-12 w-12 text-purple-400 transition-transform duration-300 group-hover:scale-110" />,
      title: "Térképes navigáció",
      description: "Valós idejű térkép az elérhető szolgáltatásokkal és a leggyorsabb útvonalakat mutatja."
    },
    {
      icon: <Clock className="h-12 w-12 text-pink-400 transition-transform duration-300 group-hover:scale-110" />,
      title: "Időpont kezelés",
      description: "Automatikus időpont-kezelés, amely optimalizálja az ügyfélforgalmat és csökkenti a várakozási időt."
    },
    {
      icon: <Users className="h-12 w-12 text-blue-400 transition-transform duration-300 group-hover:scale-110" />,
      title: "Közösségi élmény",
      description: "Értékelések, visszajelzések és közösségi funkciók, amelyek segítenek megtalálni a legjobb szolgáltatókat."
    },
    {
      icon: <Star className="h-12 w-12 text-yellow-400 transition-transform duration-300 group-hover:scale-110" />,
      title: "Minőség garancia",
      description: "Szigorú minőségi követelményeknek megfelelő partnerek és átlátható értékelési rendszer."
    },
    {
      icon: <Zap className="h-12 w-12 text-green-400 transition-transform duration-300 group-hover:scale-110" />,
      title: "Gyors szolgáltatás",
      description: "Prioritásos foglalási rendszer, amely biztosítja a gyors és hatékony szolgáltatásnyújtást."
    }
  ];

  return (
    <section id="features" className="py-20 px-6">
      <div className="container mx-auto">
        <Badge className="mb-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0">
          <Zap className="h-4 w-4 mr-2" />
          Funkciók
        </Badge>
        
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-cyan-300">
          Mit kínál majd a NOXLY?
        </h2>
        
        <p className="text-xl text-gray-300 text-center mb-16 max-w-2xl mx-auto">
          Forradalmi megoldások, amelyek megkönnyítik az éjszakai életet<br className="hidden md:block" /> és emellett időt és pénzt is spórolhatsz.
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