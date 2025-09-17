"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

const DemoSection = () => {
  return (
    <section id="demo-section" className="section-padding">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            Demo
          </Badge>
          <h2 className="text-4xl font-bold mb-4 text-white">Tekintsd meg az alkalmazást működés közben</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Ismerd meg az intuitív felületet és a hatékony eszközöket, amelyek segítenek a napi teendők kezelésében.
          </p>
        </div>
        
        <div className="relative bg-black/20 rounded-2xl p-8 border border-gray-700 backdrop-blur-sm">
          <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="w-12 h-12 text-amber-500" fill="currentColor" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">Bemutató videó</h3>
              <p className="text-gray-400">Kattints a lejátszáshoz</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              <Play className="w-5 h-5 mr-2" />
              Lejátszás
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;