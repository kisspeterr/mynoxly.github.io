import { useState, useEffect } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Star, MapPin, Calendar, Users, Sparkles, Moon, Ticket, Smartphone, BarChart3, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-black/80 backdrop-blur-md" : "bg-transparent"}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Moon className="h-8 w-8 text-cyan-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                NOXLY
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#users" className="hover:text-cyan-300 transition-colors">Felhasználóknak</a>
              <a href="#partners" className="hover:text-cyan-300 transition-colors">Partnereknek</a>
              <a href="#features" className="hover:text-cyan-300 transition-colors">Funkciók</a>
            </div>
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 border-0">
              Letöltés
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full"></div>
              <Moon className="h-20 w-20 text-cyan-400 relative z-10" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            NOXLY
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
            Pécs Éjszakai Élete Egy Helyen
          </p>
          
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Modern platform a legjobb események, akciók és szórakozási lehetőségek követésére Pécsben
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-6 text-lg border-0 rounded-2xl">
              <Sparkles className="mr-2 h-5 w-5" />
              Kezdjük el
            </Button>
            <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 px-8 py-6 text-lg rounded-2xl">
              Tudj meg többet
            </Button>
          </div>
        </div>
      </section>

      {/* For Users Section */}
      <section id="users" className="py-20 px-6 bg-black/30">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-cyan-300">
            Miért jó a Noxly a felhasználóknak?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-slate-900/50 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-400/40 transition-all duration-300">
              <CardHeader>
                <Ticket className="h-12 w-12 text-cyan-400 mb-4" />
                <CardTitle className="text-cyan-300">Kedvezmények és akciók</CardTitle>
                <CardDescription className="text-gray-400">
                  Exkluzív kuponok és akciók a kedvenc helyeidben. 1+1 italakciók, happy hour kedvezmények és felfedező akciók.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300">
              <CardHeader>
                <Calendar className="h-12 w-12 text-purple-400 mb-4" />
                <CardTitle className="text-purple-300">Események követése</CardTitle>
                <CardDescription className="text-gray-400">
                  Minden pécsi esemény egy helyen. Ne maradj le semmiről, kövesd a legfrissebb koncerteket és bulikat.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/50 border-pink-500/20 backdrop-blur-sm hover:border-pink-400/40 transition-all duration-300">
              <CardHeader>
                <Zap className="h-12 w-12 text-pink-400 mb-4" />
                <CardTitle className="text-pink-300">Egyszerű kuponbeváltás</CardTitle>
                <CardDescription className="text-gray-400">
                  Gyors és kényelmes kuponbeváltás animált felülettel és QR-kódos aktiválással.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/50 border-blue-500/20 backdrop-blur-sm hover:border-blue-400/40 transition-all duration-300">
              <CardHeader>
                <Smartphone className="h-12 w-12 text-blue-400 mb-4" />
                <CardTitle className="text-blue-300">Modern felhasználói élmény</CardTitle>
                <CardDescription className="text-gray-400">
                  Letisztult, sötét módú dizájn egyedülálló élményért. Intuitív navigáció és szórakoztató felület.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* For Partners Section */}
      <section id="partners" className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-purple-300">
            Miért érdemes partnernek lenni a Noxly-ban?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-slate-900/50 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-400/40 transition-all duration-300">
              <CardHeader>
                <Users className="h-12 w-12 text-cyan-400 mb-4" />
                <CardTitle className="text-cyan-300">Közvetlen kapcsolat a célcsoporttal</CardTitle>
                <CardDescription className="text-gray-400">
                  Érj el közvetlenül a pécsi éjszakai életet kedvelő fiatal közönséget. Hirdesd akcióidat és rendezvényeidet.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-purple-400 mb-4" />
                <CardTitle className="text-purple-300">Növekvő láthatóság</CardTitle>
                <CardDescription className="text-gray-400">
                  Növeld az online jelenlétedet és látogatószámodat. Folyamatos hirdetés új akciókkal és VIP eseményekkel.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/50 border-pink-500/20 backdrop-blur-sm hover:border-pink-400/40 transition-all duration-300">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-pink-400 mb-4" />
                <CardTitle className="text-pink-300">Akciók és statisztikák</CardTitle>
                <CardDescription className="text-gray-400">
                  Kezeld könnyedén kuponjaidat és akcióidat. Statisztikák a beváltásokról és látogatókról.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/50 border-blue-500/20 backdrop-blur-sm hover:border-blue-400/40 transition-all duration-300">
              <CardHeader>
                <Zap className="h-12 w-12 text-blue-400 mb-4" />
                <CardTitle className="text-blue-300">Egyszerű integráció</CardTitle>
                <CardDescription className="text-gray-400">
                  Felhasználóbarát partnerkezelés fejlesztési ismeretek nélkül. Gyors és kényelmes adminisztráció.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-black/30">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-cyan-300">
            Főbb Funkciók
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-900/50 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-400/40 transition-all duration-300">
              <CardHeader>
                <MapPin className="h-12 w-12 text-cyan-400 mb-4" />
                <CardTitle className="text-cyan-300">Élő Térkép</CardTitle>
                <CardDescription className="text-gray-400">
                  Valós idejű információ Pécs legjobb helyeiről
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300">
              <CardHeader>
                <Calendar className="h-12 w-12 text-purple-400 mb-4" />
                <CardTitle className="text-purple-300">Eseménynaptár</CardTitle>
                <CardDescription className="text-gray-400">
                  Minden fontos esemény egy helyen, időrendi sorrendben
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/50 border-pink-500/20 backdrop-blur-sm hover:border-pink-400/40 transition-all duration-300">
              <CardHeader>
                <Ticket className="h-12 w-12 text-pink-400 mb-4" />
                <CardTitle className="text-pink-300">Kuponkezelés</CardTitle>
                <CardDescription className="text-gray-400">
                  Egyszerű kuponkezelés és QR-kódos beváltás
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* App Showcase */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
            Modern Design,<br />Kivételes Tapasztalat
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Az Apple design filozófiáját követve hoztuk létre a NOXLY-t, hogy minden részlet tökéletes legyen
          </p>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-cyan-500/10 blur-3xl rounded-3xl"></div>
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-cyan-500/20 backdrop-blur-sm">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-cyan-300 mb-4">Intuitív Kezelőfelület</h3>
                  <p className="text-gray-300 mb-6">
                    Gyors és egyszerű navigáció, minden információ az ujjaid hegyén
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-cyan-200">
                      <Star className="h-4 w-4 mr-2 fill-cyan-400" />
                      Valós idejű frissítések
                    </li>
                    <li className="flex items-center text-cyan-200">
                      <Star className="h-4 w-4 mr-2 fill-cyan-400" />
                      Personalizált ajánlások
                    </li>
                    <li className="flex items-center text-cyan-200">
                      <Star className="h-4 w-4 mr-2 fill-cyan-400" />
                      Offline működés
                    </li>
                  </ul>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-2xl rounded-full"></div>
                  <div className="relative bg-slate-800 rounded-2xl p-6 border border-cyan-500/30">
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                        <div className="w-16 h-4 bg-cyan-500/30 rounded-full"></div>
                        <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 bg-cyan-400/40 rounded"></div>
                        <div className="h-4 bg-cyan-400/20 rounded w-3/4"></div>
                        <div className="h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg mt-4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-black/50 border-t border-cyan-500/20">
        <div className="container mx-auto text-center">
          <div className="flex justify-center items-center mb-6">
            <Moon className="h-8 w-8 text-cyan-400 mr-2" />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              NOXLY
            </span>
          </div>
          <p className="text-gray-400 mb-4">
            © 2024 NOXLY - Pécs éjszakai élete. Minden jog fenntartva.
          </p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Adatvédelem</a>
            <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Felhasználási feltételek</a>
            <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Kapcsolat</a>
          </div>
        </div>
      </footer>

      <MadeWithDyad />
    </div>
  );
};

export default Index;