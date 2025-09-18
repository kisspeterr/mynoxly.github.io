"use client";

import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertCircle, Home } from 'lucide-react';
import { showError } from '@/utils/toast';

const Admin = () => {
  const { user, profile, signOut, isLoading } = useAuth();

  // Ha még töltődik az auth adat
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/30 border-cyan-500/30 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="animate-spin-slow mx-auto mb-4">
              <Shield className="h-12 w-12 text-cyan-400" />
            </div>
            <p className="text-gray-300">Jogosultság ellenőrzése...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ha nincs bejelentkezve
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

  // Ha nincs admin jogosultság
  if (profile?.role !== 'admin') {
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
              Szerepkör: {profile?.role || 'user'}
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

  // Ha admin jogosultság van
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
              <span className="text-sm text-gray-400">Bejelentkezve: {profile?.email}</span>
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
                Üdvözöljük, {profile.first_name} {profile.last_name}! 
              </p>
              <p className="text-gray-400">
                Email cím: {profile.email}
              </p>
              <p className="text-gray-400">
                Szerepkör: <span className="text-cyan-400 capitalize">{profile.role}</span>
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