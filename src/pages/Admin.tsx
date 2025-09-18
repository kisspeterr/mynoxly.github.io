"use client";

import React, { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertCircle, Home, Loader2, Users, Settings, Database } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [showUsers, setShowUsers] = useState(false);

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

        // Get user profile to check admin status
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();

        if (error) {
          console.error('Profile access error:', error);
          setIsAdmin(false);
        } else if (profileData) {
          setProfile(profileData as Profile);
          setIsAdmin(profileData.role === 'admin');
        }

      } catch (error) {
        console.error('Auth check error:', error);
        setIsAdmin(false);
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

  const fetchAllUsers = async () => {
    if (!isAdmin) return;
    
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setAllUsers(users as Profile[]);
        setShowUsers(true);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/30 border-cyan-500/30 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mx-auto mb-4" />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Admin Info Card */}
          <Card className="bg-black/30 border-cyan-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-300">Admin Információk</CardTitle>
              <CardDescription className="text-gray-300">
                Felhasználói adataid és admin jogosultság
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Név:</span>
                  <span className="text-white">
                    {profile?.first_name} {profile?.last_name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white">{user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Szerepkör:</span>
                  <span className="text-cyan-400 capitalize">{profile?.role}</span>
                </div>
                {profile?.created_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Regisztráció:</span>
                    <span className="text-white">
                      {new Date(profile.created_at).toLocaleDateString('hu-HU')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Admin Actions Card */}
          <Card className="bg-black/30 border-purple-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-purple-300">Admin Műveletek</CardTitle>
              <CardDescription className="text-gray-300">
                Rendszerfelügyeleti eszközök
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={fetchAllUsers}
                  className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Felhasználók Listázása
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                  disabled
                >
                  <Database className="h-4 w-4 mr-2" />
                  Adatbázis Statisztikák (hamarosan)
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full border-purple-400 text-purple-400 hover:bg-purple-400/10"
                  disabled
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Rendszerbeállítások (hamarosan)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        {showUsers && (
          <Card className="bg-black/30 border-green-500/20 backdrop-blur-sm mt-8">
            <CardHeader>
              <CardTitle className="text-green-300">Felhasználók Listája</CardTitle>
              <CardDescription className="text-gray-300">
                Összes regisztrált felhasználó
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-gray-400 p-2">Név</th>
                      <th className="text-left text-gray-400 p-2">Email</th>
                      <th className="text-left text-gray-400 p-2">Szerepkör</th>
                      <th className="text-left text-gray-400 p-2">Regisztráció</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="p-2 text-white">
                          {user.first_name} {user.last_name}
                        </td>
                        <td className="p-2 text-gray-300">{user.email}</td>
                        <td className="p-2">
                          <span className={`capitalize ${
                            user.role === 'admin' ? 'text-cyan-400' : 'text-gray-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-2 text-gray-400">
                          {new Date(user.created_at).toLocaleDateString('hu-HU')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-sm text-gray-400">
                Összesen: {allUsers.length} felhasználó
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Admin;