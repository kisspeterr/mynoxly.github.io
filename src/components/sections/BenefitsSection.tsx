import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, TrendingUp, Users, Calendar, Star } from "lucide-react";

const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Miért válassz minket?
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Fedezd fel az előnyöket, amiket a modern kuponkezelés hoz számodra
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-slate-900/50 border-cyan-500/20 backdrop-blur-sm group hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <Shield className="h-12 w-12 text-cyan-400 mb-4 group-hover:rotate-12 transition-transform duration-500" />
              <CardTitle className="text-cyan-300">Biztonság & Könnyedség</CardTitle>
              <CardDescription className="text-slate-400">
                Digitális kuponokkal nincs többé papírhulladék vagy elvesztett kupongok
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                  <span>QR kód alapú azonosítás</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                  <span>Automatikus érvényesség ellenőrzés</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                  <span>Pillanatok alatt beváltás</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm group hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <Zap className="h-12 w-12 text-purple-400 mb-4 group-hover:rotate-12 transition-transform duration-500" />
              <CardTitle className="text-purple-300">Azonnali Élmény</CardTitle>
              <CardDescription className="text-slate-400">
                Gyorsabb és egyszerűbb folyamat a vendégek számára
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  <span>Nincs többé sorbanállás</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  <span>Azonnali visszajelzés</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  <span>Intuitív felhasználói felület</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-blue-500/20 backdrop-blur-sm group hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-blue-400 mb-4 group-hover:rotate-12 transition-transform duration-500" />
              <CardTitle className="text-blue-300">Növeld az Átváltási Arányt</CardTitle>
              <CardDescription className="text-slate-400">
                Több kupon váltódik be a könnyű használatnak köszönhetően
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>Akár 40%-kal magasabb átváltási arány</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>Jobb vendégelégedettség</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>Növekvő visszatérő vendégek</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-green-500/20 backdrop-blur-sm group hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <Users className="h-12 w-12 text-green-400 mb-4 group-hover:rotate-12 transition-transform duration-500" />
              <CardTitle className="text-green-300">Környezetbarát Megoldás</CardTitle>
              <CardDescription className="text-slate-400">
                Csökkentsd az ökológiai lábnyomod papírmentes megoldással
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>Zero papírhulladék</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>Csökkentett környezeti terhelés</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>Modern, fenntartható kép</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-orange-500/20 backdrop-blur-sm group hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <Calendar className="h-12 w-12 text-orange-400 mb-4 group-hover:rotate-12 transition-transform duration-500" />
              <CardTitle className="text-orange-300">Rugalmas Kampánykezelés</CardTitle>
              <CardDescription className="text-slate-400">
                Könnyedén hozz létre és kezelj különböző promóciókat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                  <span>Valós idejű kampánystátusz</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                  <span>Korlátlan kupon mennyiség</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                  <span>Egyszerű menedzsment</span>
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