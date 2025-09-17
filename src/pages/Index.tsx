import { useState, useEffect } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Star, MapPin, Calendar, Sparkles, Moon, Ticket, Smartphone, Bell, Users2, TrendingUp, QrCode, Clock, Zap, Heart, MessageCircle, Share, Download, ArrowRight, Play, ChevronLeft, ChevronRight, Search, Crown, Gift, Shield, Globe, WifiOff, SmartphoneNfc, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const Index = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMapVisible, setIsMapVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Map animation trigger
    const timer = setTimeout(() => {
      setIsMapVisible(true);
    }, 1000);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, []);

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

  const testimonials = [
    {
      name: "Anna",
      role: "Egyetemista",
      text: "Alig várom, hogy kipróbálhassam! Pontosan ez hiányzott városunk éjszakai életéből.",
      rating: 5
    },
    {
      name: "Bence",
      role: "Helyi bár tulajdonos",
      text: "Remek ötlet! Már most jeleztem érdeklődésemet, hogy partner lehessek.",
      rating: 5
    },
    {
      name: "Csilla",
      role: "Rendezvényszervező",
      text: "Végre egy modern platform, ami tényleg összehozza a közösséget!",
      rating: 5
    }
  ];

  const stats = [
    { number: "500+", label: "Előregisztrált felhasználó" },
    { number: "30+", label: "Érdeklődő partner" },
    { number: "2024", label: "Bemutató éve" },
    { number: "24/7", label: "Támogatás" }
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
      alert(`Köszönjük az érdeklődést! Hamarosan értesítünk a bemutatóról: ${email}`);
      setEmail("");
    }
  };

  // Simplified Hungary map with Pécs highlighted
  const HungaryMap = () => (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative bg-slate-800/30 rounded-2xl p-8 border border-cyan-500/20 backdrop-blur-sm">
        {/* Hungary outline */}
        <div className="relative mx-auto w-48 h-32 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 rounded-lg border border-purple-400/30">
          {/* Pécs location marker */}
          <div className={`absolute bottom-8 right-12 transition-all duration-1000 ${
            isMapVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}>
            <div className="relative">
              <div className="absolute -inset-4 bg-cyan-400/20 rounded-full animate-ping"></div>
              <div className="w-4 h-4 bg-cyan-400 rounded-full ring-4 ring-cyan-400/30 relative z-10"></div>
            </div>
            <div className={`absolute -top-8 -left-4 bg-cyan-500 text-white text-xs px-2 py-1 rounded-md font-semibold transition-all duration-700 delay-300 ${
              isMapVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Pécs
            </div>
          </div>
          
          {/* Other major cities - faint markers */}
          <div className="absolute top-4 left-8 w-2 h-2 bg-gray-400/30 rounded-full"></div>
          <div className="absolute top-12 left-16 w-2 h-2 bg-gray-400/30 rounded-full"></div>
          <div className="absolute bottom-4 left-20 w-2 h-2 bg-gray-400/30 rounded-full"></div>
        </div>
        
        {/* Map legend */}
        <div className={`mt-4 text-center transition-all duration-700 delay-500 ${
          isMapVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="inline-flex items-center space-x-2 bg-black/30 px-3 py-2 rounded-lg">
            <div className="w-3 h-3 bg-cyan-400 rounded-full ring-2 ring-cyan-400/30"></div>
            <span className="text-sm text-cyan-300 font-medium">Első város: Pécs</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-black/80 backdrop-blur-md" : "bg-transparent"}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Moon className="h-8 w-8 text-cyan-400 animate-pulse" />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                NOXLY
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-cyan-300 transition-colors duration-300">Funkciók</a>
              <a href="#map" className="hover:text-cyan-300 transition-colors duration-300">Térkép</a>
              <a href="#testimonials" className="hover:text-cyan-300 transition-colors duration-300">Vélemények</a>
              <a href="#waitlist" className="hover:text-cyan-300 transition-colors duration-300">Várólista</a>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition-all duration-300 hover:scale-105">
                Partnerként
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-cyan-500/20 text-cyan-300 border-cyan-400/30 animate-bounce">
            <Sparkles className="h-4 w-4 mr-2" />
            Hamarosan itt!
          </Badge>
          
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full animate-pulse"></div>
              <div className="relative z-10">
                <Moon className="h-20 w-20 text-cyan-400 mx-auto animate-float" />
                <div className="absolute -inset-4 bg-cyan-400/10 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
            NOXLY
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
            Városod Éjszakai Élete Egy Modern Platformon
          </p>
          
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Az első intelligens alkalmazás, ami összeköti a helyi szórakozóhelyeket, eseményeket és a közösséget. Hamarosan elérhető!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-6 text-lg border-0 rounded-2xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 animate-pulse">
              <Bell className="mr-2 h-5 w-5" />
              Értesítést kérek
            </Button>
            <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 px-8 py-6 text-lg rounded-2xl group transition-all duration-300 hover:scale-105">
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Bemutató videó
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-cyan-300 mb-2 animate-count">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section - Pécs as first city */}
      <section id="map" className="py-20 px-6 bg-black/30">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-400/30">
            <MapPin className="h-4 w-4 mr-2" />
            Elindulás helye
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-cyan-300">
            Pécs lesz az első!
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            A NOXLY először Pécsen indítja el szolgáltatását, majd fokozatosan terjeszkedünk<br className="hidden md:block" /> egész Magyarország szerte.
          </p>
          
          <HungaryMap />
          
          <div className="mt-8 max-w-2xl mx-auto">
            <Card className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-2xl text-cyan-300">Miért Pécs?</CardTitle>
                <CardDescription className="text-gray-300">
                  A diákváros vibráló éjszakai élete és aktív közössége ideális terep az innováció bemutatására.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-cyan-500/10 rounded-lg">
                    <Users2 className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                    <div className="text-cyan-300 font-semibold">Aktív közösség</div>
                  </div>
                  <div className="p-4 bg-purple-500/10 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-purple-300 font-semibold">Növekvő piac</div>
                  </div>
                  <div className="p-4 bg-pink-500/10 rounded-lg">
                    <Heart className="h-8 w-8 text-pink-400 mx-auto mb-2" />
                    <div className="text-pink-300 font-semibold">Innovációbarát</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
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

      {/* Features Preview */}
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

      {/* Benefits Section */}
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

      {/* Testimonials Carousel */}
      <section id="testimonials" className="py-20 px-6 bg-black/30">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-cyan-300">
            Mit mondanak az érdeklődők?
          </h2>
          
          <div className="max-w-4xl mx-auto relative">
            <div className="relative bg-slate-900/50 rounded-3xl p-8 border border-cyan-500/20 backdrop-blur-sm hover:scale-102 transition-transform duration-300">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentSlide].rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-yellow-400 mx-1 animate-bounce" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
                
                <p className="text-xl text-gray-200 mb-6 italic animate-fade-in">
                  "{testimonials[currentSlide].text}"
                </p>
                
                <div className="text-cyan-300 font-semibold animate-fade-in">
                  {testimonials[currentSlide].name}
                </div>
                <div className="text-gray-400 text-sm animate-fade-in">
                  {testimonials[currentSlide].role}
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-8 space-x-4">
              <Button 
                variant="outline" 
                size="icon" 
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition-all duration-300 hover:scale-110"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-cyan-400 scale-125' : 'bg-gray-600'
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="icon" 
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition-all duration-300 hover:scale-110"
                onClick={nextSlide}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <Badge className="mb-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0 animate-pulse">
              <Gift className="h-4 w-4 mr-2" />
              Korai hozzáférés
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-cyan-300">
              Legyen az elsők között Pécsen!
            </h2>
            
            <p className="text-xl text-gray-300 mb-8">
              Iratkozzon fel a várólistára, és kapjon exkluzív kedvezményt<br className="hidden md:block" /> az alkalmazás megjelenésekor!
            </p>
            
            <Card className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border-cyan-500/30 hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-cyan-300">Előregisztráció</CardTitle>
                <CardDescription className="text-gray-300">
                  Add meg az email címed, és értesítünk amint elindul a NOXLY Pécsen!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="email"
                    placeholder="Email címed"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-800/50 border-cyan-500/30 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
                    required
                  />
                  <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white transition-all duration-300 hover:scale-105">
                    <Bell className="h-4 w-4 mr-2" />
                    Feliratkozás
                  </Button>
                </form>
                <p className="text-sm text-gray-400 mt-4">
                  Az első 100 regisztrált felhasználó 50% kedvezményt kap az első havi prémium szolgáltatásunkra!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-black/50 border-t border-cyan-500/20">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Moon className="h-8 w-8 text-cyan-400 animate-pulse" />
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  NOXLY
                </span>
              </div>
              <p className="text-gray-400">
                Városod éjszakai élete egy modern alkalmazásban. Hamarosan!
              </p>
            </div>
            
            <div>
              <h3 className="text-cyan-300 font-semibold mb-4">Kapcsolat</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-cyan-300 transition-colors duration-300">info@noxly.hu</a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-300 transition-colors duration-300">+36 70 123 4567</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-cyan-300 font-semibold mb-4">Partnereknek</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-cyan-300 transition-colors duration-300">Partneri program</a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-300 transition-colors duration-300">Árak</a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-300 transition-colors duration-300">Demo igénylés</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-cyan-300 font-semibold mb-4">Kövess minket</h3>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" className="text-cyan-400 hover:bg-cyan-400/10 hover:scale-110 transition-all duration-300">
                  <MessageCircle className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-purple-400 hover:bg-purple-400/10 hover:scale-110 transition-all duration-300">
                  <Share className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-pink-400 hover:bg-pink-400/10 hover:scale-110 transition-all duration-300">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700/50 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 NOXLY - Városod éjszakai élete. Minden jog fenntartva. | Hamarosan Pécsen!
            </p>
          </div>
        </div>
      </footer>

      <MadeWithDyad />
      
      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient 3s ease infinite; 
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-fade-in { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        .animate-count { 
          animation: fadeInUp 1s ease-out forwards;
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
};

export default Index;