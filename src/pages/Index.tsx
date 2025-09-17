import { useState, useEffect } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Star, MapPin, Calendar, Users, Sparkles, Moon, Ticket, Smartphone, BarChart3, Zap, Heart, MessageCircle, Share, Download, ArrowRight, Play, Pause, ChevronLeft, ChevronRight, Search, Filter, Bell, Crown, Gift, Shield, Users2, TrendingUp, Globe, Clock, WifiOff, QrCode, SmartphoneNfc, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const Index = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("events");
  const [email, setEmail] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Élő Térkép",
      description: "Valós idejű információ Pécs legjobb helyeiről"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Eseménynaptár",
      description: "Minden fontos esemény egy helyen"
    },
    {
      icon: <Ticket className="h-6 w-6" />,
      title: "Kuponkezelés",
      description: "QR-kódos egyszerű beváltás"
    },
    {
      icon: <Users2 className="h-6 w-6" />,
      title: "Közösség",
      description: "Találkozz új emberekkel"
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: "Értesítések",
      description: "Személyre szabott figyelmeztetés"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Statisztikák",
      description: "Részletes elemzés a kedvenc helyeidről"
    }
  ];

  const testimonials = [
    {
      name: "Anna",
      role: "Egyetemista",
      text: "A Noxly segítségével mindig megtalálom a legjobb bulikat és spórolok is közben!",
      rating: 5
    },
    {
      name: "Bence",
      role: "Helyi bár tulaj",
      text: "Fantasztikus módja a üzletem népszerűsítésének és az új vendégek megszerzésének!",
      rating: 5
    },
    {
      name: "Csilla",
      role: "Rendezvényszervező",
      text: "Az app tökéletesen segít elérni a célközönséget és növelni a részvételi arányt.",
      rating: 4
    }
  ];

  const stats = [
    { number: "500+", label: "Aktív felhasználó" },
    { number: "50+", label: "Partner hely" },
    { number: "1000+", label: "Beváltott kupon" },
    { number: "24/7", label: "Elérhetőség" }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert(`Köszönjük a feliratkozást! Hamarosan értesítünk: ${email}`);
      setEmail("");
    }
  };

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
              <a href="#testimonials" className="hover:text-cyan-300 transition-colors">Vélemények</a>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-cyan-400 hover:bg-cyan-400/10">
                <Search className="h-5 w-5" />
              </Button>
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 border-0">
                <Download className="h-5 w-5 mr-2" />
                Letöltés
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-cyan-500/20 text-cyan-300 border-cyan-400/30">
            <Sparkles className="h-4 w-4 mr-2" />
            Új Pécsben
          </Badge>
          
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full animate-pulse"></div>
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
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-6 text-lg border-0 rounded-2xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all">
              <Sparkles className="mr-2 h-5 w-5" />
              Kezdjük el
            </Button>
            <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 px-8 py-6 text-lg rounded-2xl group">
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Bemutató videó
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-cyan-300 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Features Grid */}
      <section id="features" className="py-20 px-6 bg-black/30">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-cyan-300">
            Minden, amire szükséged van
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="bg-slate-900/50 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-400/40 transition-all duration-300 hover:scale-105 cursor-pointer group"
              >
                <CardHeader>
                  <div className="text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-cyan-300 group-hover:text-cyan-200 transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Interactive Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
              <TabsTrigger 
                value="events" 
                className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white data-[state=inactive]:text-gray-300 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-cyan-500/20 transition-all"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Események
              </TabsTrigger>
              <TabsTrigger 
                value="deals" 
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=inactive]:text-gray-300 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-purple-500/20 transition-all"
              >
                <Ticket className="h-4 w-4 mr-2" />
                Akciók
              </TabsTrigger>
              <TabsTrigger 
                value="map" 
                className="data-[state=active]:bg-pink-500 data-[state=active]:text-white data-[state=inactive]:text-gray-300 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-pink-500/20 transition-all"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Térkép
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="events" className="mt-6">
              <Card className="bg-slate-800/30 backdrop-blur-sm border-cyan-500/20">
                <CardHeader>
                  <CardTitle className="text-cyan-100">Közelgő Események</CardTitle>
                  <CardDescription className="text-gray-300">Fedezd fel a legfrissebb programokat Pécsen</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <div>
                          <div className="font-semibold text-gray-100">Pécsi Koncert Est {item}</div>
                          <div className="text-sm text-gray-400">2024.03.{15 + item}. 20:00</div>
                        </div>
                        <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                          Részletek
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="deals" className="mt-6">
              <Card className="bg-slate-800/30 backdrop-blur-sm border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-purple-100">Friss Akciók</CardTitle>
                  <CardDescription className="text-gray-300">Spórolj a kedvenc helyeiden</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2].map((item) => (
                      <Card key={item} className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30">
                        <CardHeader>
                          <Badge className="w-fit bg-green-500 text-white">-30%</Badge>
                          <CardTitle className="text-gray-100">1+1 Italakció</CardTitle>
                          <CardDescription className="text-gray-300">Kedvenc bárodban</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Progress value={70} className="mb-2 bg-slate-700" />
                          <div className="text-sm text-gray-300">70% felhasználva</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="map" className="mt-6">
              <Card className="bg-slate-800/30 backdrop-blur-sm border-pink-500/20">
                <CardHeader>
                  <CardTitle className="text-pink-100">Élő Térkép</CardTitle>
                  <CardDescription className="text-gray-300">Fedezd fel Pécs legjobb helyeit</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gradient-to-br from-cyan-600/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-pink-400 mx-auto mb-4" />
                      <p className="text-gray-200">Interaktív térkép betöltése...</p>
                      <Button className="mt-4 bg-pink-500 hover:bg-pink-600 text-white">
                        Térkép megnyitása
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* For Users Section */}
      <section id="users" className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-cyan-300">
            Miért jó a Noxly a felhasználóknak?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-slate-900/50 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-400/40 transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Ticket className="h-12 w-12 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                  <Badge className="bg-green-500">Népszerű</Badge>
                </div>
                <CardTitle className="text-cyan-300">Kedvezmények és akciók</CardTitle>
                <CardDescription className="text-gray-400">
                  Exkluzív kuponok és akciók a kedvenc helyeidben. 1+1 italakciók, happy hour kedvezmények és felfedező akciók.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
                  Akciók böngészése
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300 group">
              <CardHeader>
                <Calendar className="h-12 w-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-purple-300">Események követése</CardTitle>
                <CardDescription className="text-gray-400">
                  Minden pécsi esemény egy helyen. Ne maradj le semmiről, kövesd a legfrissebb koncerteket és bulikat.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-purple-400 text-purple-400 hover:bg-purple-400/10">
                  Naptár megnyitása
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-pink-500/20 backdrop-blur-sm hover:border-pink-400/40 transition-all duration-300 group">
              <CardHeader>
                <QrCode className="h-12 w-12 text-pink-400 mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-pink-300">Egyszerű kuponbeváltás</CardTitle>
                <CardDescription className="text-gray-400">
                  Gyors és kényelmes kuponbeváltás animált felülettel és QR-kódos aktiválással.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-pink-400 text-pink-400 hover:bg-pink-400/10">
                  Kuponom megtekintése
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-blue-500/20 backdrop-blur-sm hover:border-blue-400/40 transition-all duration-300 group">
              <CardHeader>
                <Smartphone className="h-12 w-12 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-blue-300">Modern felhasználói élmény</CardTitle>
                <CardDescription className="text-gray-400">
                  Letisztult, sötét módú dizájn egyedülálló élményért. Intuitív navigáció és szórakoztató felület.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-blue-400 text-blue-400 hover:bg-blue-400/10">
                  App bemutató
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section id="testimonials" className="py-20 px-6 bg-black/30">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-purple-300">
            Mit mondanak rólunk?
          </h2>
          
          <div className="max-w-4xl mx-auto relative">
            <div className="relative bg-slate-900/50 rounded-3xl p-8 border border-purple-500/20 backdrop-blur-sm">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentSlide].rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-yellow-400 mx-1" />
                  ))}
                </div>
                
                <p className="text-xl text-gray-200 mb-6 italic">
                  "{testimonials[currentSlide].text}"
                </p>
                
                <div className="text-cyan-300 font-semibold">
                  {testimonials[currentSlide].name}
                </div>
                <div className="text-gray-400 text-sm">
                  {testimonials[currentSlide].role}
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-8 space-x-4">
              <Button 
                variant="outline" 
                size="icon" 
                className="border-purple-400 text-purple-400 hover:bg-purple-400/10"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide ? 'bg-purple-400' : 'bg-gray-600'
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="icon" 
                className="border-purple-400 text-purple-400 hover:bg-purple-400/10"
                onClick={nextSlide}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <Card className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border-cyan-500/30 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-cyan-300">Maradj naprakész!</CardTitle>
              <CardDescription className="text-gray-300">
                Iratkozz fel hírlevelünkre, és kapj értesítést az legújabb akciókról és eseményekről.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  placeholder="Email címed"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800/50 border-cyan-500/30 text-white placeholder-gray-400"
                  required
                />
                <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600">
                  Feliratkozás
                  <Bell className="h-4 w-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-black/50 border-t border-cyan-500/20">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Moon className="h-8 w-8 text-cyan-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  NOXLY
                </span>
              </div>
              <p className="text-gray-400">
                Pécs éjszakai élete egy modern alkalmazásban.
              </p>
            </div>
            
            <div>
              <h3 className="text-cyan-300 font-semibold mb-4">Linkek</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-cyan-300 transition-colors">Rólunk</a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-300 transition-colors">Kapcsolat</a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-300 transition-colors">Karrier</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-cyan-300 font-semibold mb-4">Jogi</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-cyan-300 transition-colors">Adatvédelem</a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-300 transition-colors">Felhasználási feltételek</a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-300 transition-colors">Cookie szabályzat</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-cyan-300 font-semibold mb-4">Kövess minket</h3>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" className="text-cyan-400 hover:bg-cyan-400/10">
                  <MessageCircle className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-purple-400 hover:bg-purple-400/10">
                  <Share className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-pink-400 hover:bg-pink-400/10">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700/50 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 NOXLY - Pécs éjszakai élete. Minden jog fenntartva.
            </p>
          </div>
        </div>
      </footer>

      <MadeWithDyad />
    </div>
  );
};

export default Index;