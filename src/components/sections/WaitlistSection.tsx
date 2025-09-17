"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const WaitlistSection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Itt lehetne API hívás is
    console.log('Email submitted:', email);
    setIsSubmitted(true);
    setEmail('');
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4 text-white">Csatlakozz a Várólistához</h2>
        <p className="text-xl mb-12 text-gray-300">
          Legyél az elsők között, akik kipróbálhatják az alkalmazásunkat
        </p>
        
        <div className="max-w-md mx-auto">
          {isSubmitted ? (
            <Card className="bg-black/30 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-green-400">Köszönjük!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Sikeresen feliratkoztál a várólistára. Hamarosan küldünk egy e-mailt, amint az alkalmazás elérhető.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-black/30 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-cyan-300">Előregisztráció</CardTitle>
                <CardDescription className="text-gray-300">
                  Add meg az e-mail címed, és értesítünk, amint az alkalmazás elérhető
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">E-mail cím</Label>
                      <Input 
                        id="email"
                        type="email" 
                        placeholder="email@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                    Feliratkozás
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default WaitlistSection;