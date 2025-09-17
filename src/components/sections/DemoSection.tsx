import { useState } from "react";
import { MapPin, Gift, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const DemoSection = () => {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRedeem = () => {
    setIsRedeeming(true);
    setTimeout(() => {
      setIsRedeeming(false);
      setShowSuccess(true);
    }, 2000);
  };

  const emojis = ['🍹', '🍸', '🥂', '🍷', '🍺', '🎉', '✨', '🌟', '💫', '🎊'];

  return (
    <section id="demo-section" className="py-20 px-6 neon-section-bg">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 neon-text-cyan">
            <Gift className="h-4 w-4 mr-2" />
            Próbáld Ki
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-cyan-300 neon-text-cyan">
            Élő Bemutató
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Tekintsd meg, hogyan működik a NOXLY kuponbeváltási rendszere valós időben!
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="neon-card-bg hover:scale-105 transition-transform duration-500">
            <CardHeader className="pb-4">
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-r from-purple-600/30 to-cyan-600/30 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-6xl">🍻</div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-red-500/80 text-white animate-pulse">
                      🔥 Akció
                    </Badge>
                  </div>
                </div>
              </div>
              <CardTitle className="text-2xl text-white flex items-center gap-2 neon-text-cyan">
                <MapPin className="h-5 w-5 text-cyan-400" />
                Noxly Bár
              </CardTitle>
              <div className="text-xl font-bold text-amber-300 mb-2 neon-text-cyan">
                1+1 Ital Akció
              </div>
              <CardDescription className="text-gray-400">
                Válaszd ki kedvenc italodat és kapj egy másikat ingyen! 
                Perfect for sharing with friends or enjoying twice the fun.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleRedeem}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-6 text-lg transition-all duration-300 hover:scale-105 neon-text-cyan"
                disabled={isRedeeming}
              >
                {isRedeeming ? (
                  <>
                    <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                    Feldolgozás...
                  </>
                ) : (
                  <>
                    <Gift className="h-5 w-5 mr-2" />
                    Kupon Beváltása
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className="neon-card-bg max-w-md border-cyan-500/30">
            <DialogHeader>
              <DialogTitle className="text-2xl text-cyan-300 text-center flex items-center justify-center gap-2 neon-text-cyan">
                <CheckCircle className="h-6 w-6 text-green-400" />
                Sikeres Beváltás!
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-center mt-4">
                Mutasd fel ezt a képernyőt a pultnál a kupon beváltásához!
              </DialogDescription>
            </DialogHeader>
            
            <div className="relative h-48 bg-black/20 rounded-lg border border-cyan-500/20 mt-6 overflow-hidden">
              {/* Floating emojis */}
              {emojis.map((emoji, index) => (
                <div
                  key={index}
                  className="absolute text-3xl animate-float"
                  style={{
                    left: `${Math.random() * 80}%`,
                    animationDelay: `${index * 0.2}s`,
                    animationDuration: `${3 + Math.random() * 2}s`
                  }}
                >
                  {emoji}
                </div>
              ))}
              
              {/* Success message */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <p className="text-lg font-semibold text-white neon-text-cyan">
                    Mutasd fel a pultnál!
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <Button 
                onClick={() => setShowSuccess(false)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white neon-text-cyan"
              >
                Bezárás
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default DemoSection;