"use client";

import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Mail, User, Shield } from 'lucide-react';

const Profile = () => {
  const { user, profile, signOut } = useAuth();

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/30 border-cyan-500/30 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <p className="text-gray-300">Kérjük, jelentkezz be a profil megtekintéséhez.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-black/30 border-cyan-500/30 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-cyan-300">Profil</CardTitle>
            <CardDescription className="text-gray-300">
              Felhasználói adataid
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg">
                <User className="h-5 w-5 text-cyan-400" />
                <div>
                  <p className="text-sm text-gray-400">Név</p>
                  <p className="text-white">
                    {profile.first_name && profile.last_name 
                      ? `${profile.first_name} ${profile.last_name}`
                      : 'Nincs megadva'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg">
                <Mail className="h-5 w-5 text-cyan-400" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg">
                <Shield className="h-5 w-5 text-cyan-400" />
                <div>
                  <p className="text-sm text-gray-400">Szerepkör</p>
                  <p className="text-white capitalize">{profile.role}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg">
                <Calendar className="h-5 w-5 text-cyan-400" />
                <div>
                  <p className="text-sm text-gray-400">Regisztráció dátuma</p>
                  <p className="text-white">
                    {new Date(profile.created_at).toLocaleDateString('hu-HU')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <Button 
                onClick={signOut}
                variant="outline" 
                className="border-red-500 text-red-400 hover:bg-red-500/10"
              >
                Kijelentkezés
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;