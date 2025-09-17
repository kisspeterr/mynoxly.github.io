"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Zap } from 'lucide-react';

const DemoSection = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-white">Tekintsd meg a Demo-t</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Ismerd meg az alkalmazásunk főbb funkcióit és hogyan segíthet a mindennapi teendőid kezelésében
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-cyan-300">Előzetes betekintés</h3>
            <p className="text-gray-300">
              Az alkalmazásunk intuitív felülettel és okos funkciókkal segít a napi feladataid hatékony kezelésében.
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <Zap className="w-5 h-5 text-cyan-400 mr-3" />
                Valós idejű szinkronizáció
              </li>
              <li className="flex items-center">
                <Zap className="w-5 h-5 text-cyan-400 mr-3" />
                Okos értesítési rendszer
              </li>
              <li className="flex items-center">
                <Zap className="w-5 h-5 text-cyan-400 mr-3" />
                Testreszabható felület
              </li>
              <li className="flex items-center">
                <Zap className="w-5 h-5 text-cyan-400 mr-3" />
                Többeszköz támogatás
              </li>
            </ul>
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
              <Play className="w-4 h-4 mr-2" />
              Demo Megtekintése
            </Button>
          </div>

          <div className="max-w-md mx-auto">
            <Card className="bg-black/30 border-gray-700 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Play className="w-8 h-8 text-cyan-300" />
                      </div>
                      <p className="text-cyan-200 font-medium">Interaktív Demo</p>
                    </div>
                  </div>
                </div>
                <CardTitle className="text-xl text-white">Élő Bemutató</CardTitle>
                <CardDescription className="text-gray-400">
                  Tekintsd meg az alkalmazás működését egy interaktív demóban
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">
                  A demo bemutatja az alkalmazás főbb funkcióit és hogyan használhatod hatékonyan a mindennapokban.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;