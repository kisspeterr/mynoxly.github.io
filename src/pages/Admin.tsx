"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, BarChart3, Settings, AlertCircle, Home } from 'lucide-react';
import { showError } from '@/utils/toast';

const Admin = () => {
  const { user, profile, signOut, isLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading && user && profile) {
      if (profile.role === 'admin') {
        setIsAuthorized(true);
      } else {
        showError('Nincs jogosultságod az admin oldal megtekintéséhez');
      }
      setIsChecking(false);
    } else if (!isLoading && !user) {
      setIsChecking(false);
    }
  }, [user, profile, isLoading]);

  if (isChecking) {
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

  if (!isAuthorized) {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Statisztika kártya */}
          <Card className="bg-black/30 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-500/40 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-cyan-300">Felhasználók</CardTitle>
                <Users className="h-5 w-5 text-cyan-400" />
              </div>
              <CardDescription className="text-gray-400">Összes regisztrált felhasználó</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">1,247</div>
              <p className="text-sm text-green-400 mt-2">+12% az elmúlt hónapban</p>
            </CardContent>
          </Card>

          {/* Statisztika kártya */}
          <Card className="bg-black/30 border-purple-500/20 backdrop-blur-sm hover:border-purple-500/40 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-purple-300">Partner üzletek</CardTitle>
                <BarChart3 className="h-5 w-5 text-purple-400" />
              </div>
              <CardDescription className="text-gray-400">Aktív partner üzletek száma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">89</div>
              <p className="text-sm text-green-400 mt-2">+5 új az elmúlt héten</p>
            </CardContent>
          </Card>

          {/* Statisztika kártya */}
          <Card className="bg-black/30 border-pink-500/20 backdrop-blur-sm hover:border-pink-500/40 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-pink-300">Kupon beváltások</CardTitle>
                <Settings className="h-5 w-5 text-pink-400" />
              </div>
              <CardDescription className="text-gray-400">Napi átlagos beváltások</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">324</div>
              <p className="text-sm text-green-400 mt-2">+8% az elmúlt hétben</p>
            </CardContent>
          </Card>
        </div>

        {/* Üdvözlő üzenet */}
        <Card className="bg-black/30 border-cyan-500/20 backdrop-blur-sm mt-8">
          <CardHeader>
            <CardTitle className="text-cyan-300">Üdvözöljük az admin panelben!</CardTitle>
            <CardDescription className="text-gray-300">
              Itt kezelheted a rendszer összes fontos elemét és statisztikáját.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-white">Felhasználói adatok</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• Email: {profile?.email}</li>
                  <li>• Név: {profile?.first_name} {profile?.last_name}</li>
                  <li>• Szerepkör: <span className="text-cyan-400 capitalize">{profile?.role}</span></li>
                  <li>• Regisztráció: {new Date(profile?.created_at || '').toLocaleDateString('hu-HU')}</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-white">Gyors műveletek</h3>
                <div className="flex flex-col space-y-2">
                  <Button variant="outline" className="justify-start text-gray-300 hover:text-cyan-300">
                    Felhasználók kezelése
                  </Button>
                  <Button variant="outline" className="justify-start text-gray-300 hover:text-purple-300">
                    Partner üzletek
                  </Button>
                  <Button variant="outline" className="justify-start text-gray-300 hover:text-pink-300">
                    Statisztikák megtekintése
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;