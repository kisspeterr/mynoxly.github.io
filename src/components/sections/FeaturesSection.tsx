import { MapPin, Calendar, Ticket, Users2, Bell, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FeaturesSection = () => {
  const features = [
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Élő Térkép",
      description: "Valós idejű információ városod legjobb helyeiről"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Eseménynaptár",
      description: "Minden fontos esemény egy helyen"
    },
    {
      icon: <Ticket className="h-8 w-8" />,
      title: "Kuponkezelés",
      description: "QR-kódos egyszerű beváltás"
    },
    {
      icon: <Users2 className="h-8 w-8" />,
      title: "Közösség",
      description: "Találkozz új emberekkel"
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: "Értesítések",
      description: "Személyre szabott figyelmeztetések"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Statisztikák",
      description: "Részletes elemzés a kedvenc helyeidről"
    }
  ];

  return (
    <section id="features" className="py-20 px-6 bg-black/30">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-cyan-300">
          Mit kínál majd a NOXLY?
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm hover:border-cyan-400/40 transition-all duration-300 group hover:scale-105 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="text-cyan-400 mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12">
                  {feature.icon}
                </div>
                <CardTitle className="text-cyan-300 group-hover:text-cyan-200 transition-colors duration-300">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="bg-cyan-500/10 text-cyan-300 border-cyan-400/30 group-hover:bg-cyan-500/20 transition-colors">
                  Hamarosan
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;