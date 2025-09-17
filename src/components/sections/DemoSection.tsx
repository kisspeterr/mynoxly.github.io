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
          <h2 className="text-4xl font-bold mb-4 text-white">Tekintsd meg a Demót</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Fedezd fel, hogyan működik az alkalmazásunk egy gyors bemutató segítségével
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-white">Főbb jellemzők</h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></div>
                Valós idejű térképes követés
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></div>
                Intuitív felhasználói felület
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></div>
                Haladó analitikai eszközök
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></div>
                Testreszabható jelentések
              </li>
            </ul>
            
            <div className="flex gap-4 mt-8">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Play className="w-4 h-4 mr-2" />
                Demo Megtekintése
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                <Zap className="w-4 h-4 mr-2" />
                További információk
              </Button>
            </div>
          </div>
          
          <div className="max-w-md mx-auto">
            <Card className="bg-black/30 border-gray-700 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Play className="w-8 h-8 text-cyan-400" fill="currentColor" />
                      </div>
                      <p className="text-sm text-cyan-300 font-medium">Interaktív Demo</p>
                    </div>
                  </div>
                </div>
                <CardTitle className="text-xl text-white">Interaktív Bemutató</CardTitle>
                <CardDescription className="text-gray-400">
                  Kattints a lejátszás gombra az alkalmazás működésének megtekintéséhez
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300">
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