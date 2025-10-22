import { TrendingUp, Users2, BarChart3, Target, MapPin, Calendar, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React from 'react';

const PartnerBenefitsCards = () => {
  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <Badge className="mb-4 bg-green-500 text-white">
          <TrendingUp className="h-4 w-4 mr-2" />
          Partnereknek
        </Badge>
        <h3 className="text-3xl font-bold mb-6 text-purple-300">
          Növeld az Ügyfeleid Számát
        </h3>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Modern marketing megoldások és részletes analitika a helyi üzletek számára.
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
        
        <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm group hover:scale-105 transition-transform duration-300 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <Users2 className="h-12 w-12 text-purple-400 mb-4 group-hover:rotate-12 transition-transform duration-500" />
            <CardTitle className="text-purple-300">Közösségi Elérés</CardTitle>
            <CardDescription className="text-gray-400">
              Légy része Pécs legdinamikusabb éjszakai közösségének.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300">
                <MapPin className="h-4 w-4 text-purple-400 mr-2" />
                Kiemelt megjelenés a térképen
              </li>
              <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300 delay-100">
                <Calendar className="h-4 w-4 text-purple-400 mr-2" />
                Események promóciója
              </li>
              <li className="flex items-center group-hover:translate-x-2 transition-transform duration-300 delay-200">
                <Star className="h-4 w-4 text-purple-400 mr-2" />
                Hosszú távú partnerség
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PartnerBenefitsCards;