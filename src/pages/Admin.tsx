"use client";

import React, { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertCircle, Home, Loader2 } from 'lucide-react';

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (!currentSession?.user) {
          setIsLoading(false);
          return;
        }

        // Try to get user profile - if this fails, we'll use a fallback method
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentSession.user.id)
            .single();

          if (!error && profileData) {
            setIsAdmin(profileData.role === 'admin');
          } else {
            // If we can't access the profile, use email-based admin check as fallback
            const userEmail = currentSession.user.email?.toLowerCase();
            setIsAdmin(userEmail === 'admin@example.com' || userEmail?.includes('admin'));
          }
        } catch (profileError) {
          console.warn('Profile access failed, using fallback method:', profileError);
          const userEmail = currentSession.user.email?.toLowerCase();
          setIsAdmin(userEmail === 'admin@example.com' || userEmail?.includes('admin'));
        }

      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      await checkAuth();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/30 border-cyan-500/30 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Bejelentkezés ellenőrzése...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/30 border-cyan-500/30 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-300 mb-4">Hozzáférés megtagadva</h2>
            <p className="text-gray-300 mb-6">Kérjük, jelentkezz be admin jogosultsággal</p>
            <Button 
              asChild
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
            >
              <a href="/auth">Bejelentkezés</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/30 border-red-500/30 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-300 mb-4">Nincs admin jogosultság</h2>
            <p className="text-gray-300 mb-4">
              A felhasználói fiókod nem rendelkezik admin jogosultsággal.
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Email: {user.email}
            </p>
            <div className="flex flex-col space-y-3">
              <Button 
                asChild
                variant="outline"
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
              >
                <a href="/">Vissza a főoldalra</a>
              </Button>
              <Button 
                onClick={signOut}
                variant="ghost"
                className="text-gray-400 hover:text-red-400 hover:bg-red-400/10"
              >
                Kijelentkezés
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950">
      {/* Header */}
      <header className="bg-black/50 border-b border-cyan-500/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-cyan-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Admin Panel
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">Bejelentkezve: {user.email}</span>
              <Button 
                asChild
                variant="outline"
                size="sm"
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
              >
                <a href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Főoldal
                </a>
              </Button>
              <Button 
                onClick={signOut}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-400 hover:bg-red-400/10"
              >
                Kijelentkezés
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-black/30 border-cyan-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-cyan-300">Üdvözöljük az Admin Panelen!</CardTitle>
            <CardDescription className="text-gray-300">
              Sikeresen bejelentkeztél admin jogosultsággal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-300">
                Üdvözöljük, {user.email}!
              </p>
              <p className="text-gray-400">
                Email cím: {user.email}
              </p>
              <p className="text-gray-400">
                Szerepkör: <span className="text-cyan-400 capitalize">admin</span>
              </p>
              <div className="pt-4">
                <Button 
                  asChild
                  variant="outline"
                  className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                >
                  <a href="/">Vissza a főoldalra</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;