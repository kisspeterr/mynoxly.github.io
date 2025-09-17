import { Crown, TrendingUp, Sparkles, Calendar, MapPin, Users2, QrCode } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-20 px-6">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-purple-300">
          Miért érdemes várni a NOXLY-ra?
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="bg-slate-900/50 border-cyan-500/20 backdrop-blur-sm group hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Crown className="h-12 w-12 text-cyan-400 mb-4 group-hover:rotate-12 transition-transform duration-500" />
                <Badge className="bg-amber-500 animate-pulse">Prémium</Badge>
              </div>
              <CardTitle className="text-cyan-300">Felhasználóknak</CardTitle>
              <CardDescription className="text-gray-400">
                Exkluzív kedvezmények, élő eseménykövetés és intelligens ajánlók egy helyen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  <Sparkles className="h-4 w-4 text-cyan-400 mr-2" />
                  Ingyenes kuponok és akciók
                </li>
                <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300 delay-100">
                  <Calendar className="h-4 w-4 text-cyan-400 mr-2" />
                  Személyre szabott eseményajánlók
                </li>
                <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300 delay-200">
                  <MapPin className="h-4 w-4 text-cyan-400 mr-2" />
                  Valós idejű térkép és információk
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm group hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <TrendingUp className="h-12 w-12 text-purple-400 mb-4 group-hover:rotate-12 transition-transform duration-500" />
                <Badge className="bg-green-500 animate-pulse">Business</Badge>
              </div>
              <CardTitle className="text-purple-300">Partnereknek</CardTitle>
              <CardDescription className="text-gray-400">
                Modern marketing megoldások és részletes analitika a helyi üzletek számára
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  <TrendingUp className="h-4 w-4 text-purple-400 mr-2" />
                  Részletes üzleti statisztikák
                </li>
                <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300 delay-100">
                  <Users2 className="h-4 w-4 text-purple-400 mr-2" />
                  Célzott közönségelérés
                </li>
                <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300 delay-200">
                  <QrCode className="h-4 w-4 text-purple-400 mr-2" />
                  Modern kuponkezelési rendszer
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;