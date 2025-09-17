import { Crown, TrendingUp, Sparkles, Calendar, MapPin, Users2, QrCode, Star, Shield, BarChart3, Target, Heart, Gift, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-20 px-6">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-purple-300">
          Ki mit nyer a NOXLY-val?
        </h2>
        
        {/* Users Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-amber-500 animate-pulse text-white">
              <Crown className="h-4 w-4 mr-2" />
              Felhasználóknak
            </Badge>
            <h3 className="text-3xl font-bold mb-6 text-cyan-300">
              Több Élmény, Kevesebb Kiadás
            </h3>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Fedezd fel Pécs éjszakai életét előnyös áron és élvezd az exkluzív kedvezményeket
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-slate-900/50 border-cyan-500/20 backdrop-blur-sm group hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <Sparkles className="h-12 w-12 text-cyan-400 mb-4 group-hover:rotate-12 transition-transform duration-500" />
                <CardTitle className="text-cyan-300">Ingyenes Kuponok</CardTitle>
                <CardDescription className="text-gray-400">
                  1+1 ital akciók és exkluzív kedvezmények
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300">
                    <Star className="h-4 w-4 text-cyan-400 mr-2" />
                    Napi frissülő ajánlatok
                  </li>
                  <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300 delay-100">
                    <Gift className="h-4 w-4 text-cyan-400 mr-2" />
                    VIP kuponok kiemelt helyeken
                  </li>
                  <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300 delay-200">
                    <Heart className="h-4 w-4 text-cyan-400 mr-2" />
                    Kedvenc helyeid személyre szabott ajánlatai
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-cyan-500/20 backdrop-blur-sm group hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <MapPin className="h-12 w-12 text-cyan-400 mb-4 group-hover:rotate-12 transition-transform duration-500" />
                <CardTitle className="text-cyan-300">Új Helyek Fedezése</CardTitle>
                <CardDescription className="text-gray-400">
                  Ismerd meg Pécs rejtett kincseit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300">
                    <Target className="h-4 w-4 text-cyan-400 mr-2" />
                    Célzott ajánlások az ízlésed alapján
                  </li>
                  <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300 delay-100">
                    <Calendar className="h-4 w-4 text-cyan-400 mr-2" />
                    Események és különleges programok
                  </li>
                  <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300 delay-200">
                    <Users2 className="h-4 w-4 text-cyan-400 mr-2" />
                    Barátaiddal közös felfedezés
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-cyan-500/20 backdrop-blur-sm group hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <Shield className="h-12 w-12 text-cyan-400 mb-4 group-hover:rotate-12 transition-transform duration-500" />
                <CardTitle className="text-cyan-300">Biztonság & Könnyedség</CardTitle>
                <CardDescription className="text-gray-400">
                  Zökkenőmentes élmény minden lépésben
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300">
                    <QrCode className="h-4 w-4 text-cyan-400 mr-2" />
                    Azonnali kuponbeváltás
                  </li>
                  <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300 delay-100">
                    <Sparkles className="h-4 w-4 text-cyan-400 mr-2" />
                    Egyszerű és intuitív felület
                  </li>
                  <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300 delay-200">
                    <Shield className="h-4 w-4 text-cyan-400 mr-2" />
                    Biztonságos fizetési lehetőségek
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Partners Section */}
        <div>
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-500 animate-pulse text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Partnereknek
            </Badge>
            <h3 className="text-3xl font-bold mb-6 text-purple-300">
              Növeld az Ügyfeleid Számát
            </h3>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Modern marketing megoldások és részletes analitika a helyi üzletek számára
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm group hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-purple-400 mb-4 group-hover:rotate-12 transition-transform duration-500" />
                <CardTitle className="text-purple-300">Részletes Statisztikák</CardTitle>
                <CardDescription className="text-gray-400">
                  Valós idejű adatok az üzleted teljesítményéről
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300">
                    <TrendingUp className="h-4 w-4 text-purple-400 mr-2" />
                    Napi látogatási adatok
                  </li>
                  <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300 delay-100">
                    <Target className="h-4 w-4 text-purple-400 mr-2" />
                    Kedvezmények hatékonysága
                  </li>
                  <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300 delay-200">
                    <Users2 className="h-4 w-4 text-purple-400 mr-2" />
                    Visszatérő vendégek nyomon követése
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm group hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <Target className="h-12 w-12 text-purple-400 mb-4 group-hover:rotate-12 transition-transform duration-500" />
                <CardTitle className="text-purple-300">Célzott Marketing</CardTitle>
                <CardDescription className="text-gray-400">
                  Érd el a megfelelő közönséget
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300">
                    <MapPin className="h-4 w-4 text-purple-400 mr-2" />
                    Helyi közönség elérése
                  </li>
                  <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300 delay-100">
                    <Calendar className="h-4 w-4 text-purple-400 mr-2" />
                    Időzített promóciók
                  </li>
                  <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300 delay-200">
                    <Star className="h-4 w-4 text-purple-400 mr-2" />
                    Exkluzív partneri lehetőségek
                  </li>
                </ul>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;