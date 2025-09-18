"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWaitlist } from '@/hooks/use-waitlist';

const WaitlistSection = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const { subscribeToWaitlist, isLoading } = useWaitlist();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      return;
    }

    const result = await subscribeToWaitlist({
      email: email.trim(),
      name: name.trim() || undefined
    });

    if (result.success) {
      setEmail('');
      setName('');
    }
  };

  return (
    <section id="waitlist" className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4 text-white">Csatlakozz a Várólistához</h2>
        <p className="text-xl mb-12 text-gray-300">
          Legyél az elsők között, akik kipróbálhatják az alkalmazásunkat
        </p>
        
        <div className="max-w-md mx-auto">
          <Card className="bg-black/30 border-cyan-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-cyan-300">Előregisztráció</CardTitle>
              <CardDescription className="text-gray-300">
                Add meg az adataidat, és értesítünk, amint az alkalmazás elérhető
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">Név (opcionális)</Label>
                  <Input 
                    id="name"
                    type="text" 
                    placeholder="Add meg a neved"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">E-mail cím *</Label>
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
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Feldolgozás...' : 'Feliratkozás'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default WaitlistSection;