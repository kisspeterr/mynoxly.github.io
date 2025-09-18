"use client";

import React, { useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Home, Users, Settings, Database, LogOut } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

const AdminPanel = () => {
  const { user, profile, signOut } = useAuth();
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const fetchAllUsers = async () => {
    setIsLoadingUsers(true);
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
    } finally {
      setIsLoadingUsers(false);
    }
  };

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
              <span className="text-sm text-gray-400">Bejelentkezve: {user?.email}</span>
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
                <LogOut className="h-4 w-4" />
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
                  <span className="text-white">{user?.email}</span>
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
                  disabled={isLoadingUsers}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {isLoadingUsers ? 'Betöltés...' : 'Felhasználók Listázása'}
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

export default AdminPanel;