import { TrendingUp, BarChart3, Target, Users2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PartnerCTASection = () => {
  return (
    <section id="partner-cta" className="py-20 px-6">
      <div className="container mx-auto">
        
        {/* Partners Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <TrendingUp className="h-4 w-4 mr-2" />
            Partnereknek
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-purple-300">
            Szeretnél Partner lenni?
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12">
            Növeld az ügyfélforgalmat, érd el a helyi egyetemistákat és kapj részletes analitikát a NOXLY platformon keresztül.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Benefit Card 1: Statistics */}
          <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm group hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-purple-400 mb-4 group-hover:rotate-12 transition-transform duration-500" />
              <CardTitle className="text-purple-300">Részletes Statisztikák</CardTitle>
              <CardDescription className="text-gray-400">
                Valós idejű adatok az üzleted teljesítményéről.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-purple-400 mr-2" />
                  Napi látogatási adatok
                </li>
                <li className="flex items-center">
                  <Target className="h-4 w-4 text-purple-400 mr-2" />
                  Kedvezmények hatékonysága
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Benefit Card 2: Targeted Marketing */}
          <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm group hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <Target className="h-12 w-12 text-purple-400 mb-4 group-hover:rotate-12 transition-transform duration-500" />
              <CardTitle className="text-purple-300">Célzott Marketing</CardTitle>
              <CardDescription className="text-gray-400">
                Érd el a megfelelő közönséget Pécsen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <Users2 className="h-4 w-4 text-purple-400 mr-2" />
                  Helyi egyetemisták elérése
                </li>
                <li className="flex items-center">
                  <Calendar className="h-4 w-4 text-purple-400 mr-2" />
                  Időzített promóciók
                </li>
              </ul>
            </CardContent>
          </Card>
          
          {/* CTA Card */}
          <Card className="bg-gradient-to-br from-pink-900/50 to-purple-900/50 border-pink-500/50 backdrop-blur-sm flex flex-col justify-center items-center p-8 text-center shadow-2xl shadow-pink-500/20">
            <h4 className="text-2xl font-bold text-pink-300 mb-4">Kezdjük el!</h4>
            <p className="text-gray-300 mb-6">
              Vedd fel velünk a kapcsolatot, és egyeztessünk egy ingyenes demót.
            </p>
            <Button 
              asChild
              className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white px-8 py-3 text-lg"
            >
              <Link to="/partner-signup">
                <Send className="mr-2 h-5 w-5" />
                Jelentkezem Partnernek
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PartnerCTASection;