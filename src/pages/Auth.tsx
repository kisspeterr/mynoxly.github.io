"use client";

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle, Loader2, ArrowLeft, Mail, UserPlus, Home, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';
import { useAuth } from '@/components/auth/AuthProvider';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'login' | 'register'>('login');
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect immediately
    if (user && !authLoading) {
      window.location.href = '/';
      return;
    }
    
    // If auth loading takes too long, set a timeout
    const timeout = setTimeout(() => {
      if (authLoading) {
        console.log('Auth loading timeout - forcing state');
        // We can't directly change the context state, but we can log this
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [user, authLoading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        showError(error.message);
        return;
      }

      showSuccess('Sikeres bejelentkezés!');
      // The auth state change will handle the redirect
    } catch (error) {
      showError('Bejelentkezési hiba');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      showError('A jelszavak nem egyeznek');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
        },
      });

      if (error) {
        showError(error.message);
        return;
      }

      showSuccess('Sikeres regisztráció! Kérjük, erősítsd meg az email címed.');
      setStep('login');
    } catch (error) {
      showError('Regisztrációs hiba');
      console.error('Register error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Betöltés...</p>
          <p className="text-sm text-gray-500 mt-2">Ha ez túl sokáig tart, próbáld meg frissíteni az oldalt</p>
        </div>
      </div>
    );
  }

  if (user) {
    // This should redirect automatically, but just in case
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300">Átirányítás...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/30 border-cyan-500/30 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Lock className="h-12 w-12 text-cyan-400" />
          </div>
          <CardTitle className="text-2xl text-cyan-300">
            {step === 'login' ? 'Bejelentkezés' : 'Regisztráció'}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {step === 'login' 
              ? 'Add meg az adataidat a belépéshez' 
              : 'Hozz létre egy új fiókot'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={step === 'login' ? handleLogin : handleRegister}>
            {step === 'register' && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-300">Keresztnév</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Keresztnév"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-300">Vezetéknév</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Vezetéknév"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email cím</Label>
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

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Jelszó</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Jelszó"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {step === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-300">Jelszó megerősítése</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Jelszó újra"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : step === 'login' ? (
                  <Mail className="h-4 w-4 mr-2" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Feldolgozás...' : step === 'login' ? 'Bejelentkezés' : 'Regisztráció'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setStep(step === 'login' ? 'register' : 'login')}
              className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
            >
              {step === 'login' 
                ? 'Nincs még fiókod? Regisztrálj!' 
                : 'Már van fiókod? Jelentkezz be!'
              }
            </button>
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              asChild
              className="text-gray-400 hover:text-gray-300"
            >
              <a href="/">
                <Home className="h-4 w-4 mr-2" />
                Vissza a főoldalra
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;