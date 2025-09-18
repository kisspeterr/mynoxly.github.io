"use client";

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';

interface PasswordStrength {
  hasLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [isLoginMode, setIsLoginMode] = useState(false);

  const checkPasswordStrength = (pwd: string): PasswordStrength => ({
    hasLength: pwd.length >= 8,
    hasUppercase: /[A-Z]/.test(pwd),
    hasLowercase: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  });

  const passwordStrength = checkPasswordStrength(password);
  const isPasswordStrong = Object.values(passwordStrength).every(Boolean);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const checkEmailExists = async (email: string) => {
    setIsCheckingEmail(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase())
        .single();

      setEmailExists(!!data && !error);
    } catch (error) {
      setEmailExists(false);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  useEffect(() => {
    if (email && email.includes('@')) {
      const timer = setTimeout(() => {
        checkEmailExists(email);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setEmailExists(null);
    }
  }, [email]);

  useEffect(() => {
    if (emailExists !== null) {
      setIsLoginMode(emailExists);
    }
  }, [emailExists]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLoginMode) {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password,
        });

        if (error) {
          showError('Hibás email vagy jelszó');
          return;
        }

        showSuccess('Sikeres bejelentkezés!');
      } else {
        // Register
        if (!isPasswordStrong) {
          showError('A jelszó nem elég erős');
          return;
        }

        if (!passwordsMatch) {
          showError('A jelszavak nem egyeznek');
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.toLowerCase(),
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            },
          },
        });

        if (error) {
          showError('Hiba történt a regisztráció során');
          return;
        }

        showSuccess('Sikeres regisztráció! Kérjük, ellenőrizd az emailed a megerősítéshez.');
      }
    } catch (error) {
      showError('Váratlan hiba történt');
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center space-x-2 text-sm">
      {met ? (
        <CheckCircle className="h-4 w-4 text-green-400" />
      ) : (
        <XCircle className="h-4 w-4 text-red-400" />
      )}
      <span className={met ? 'text-green-400' : 'text-red-400'}>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/30 border-cyan-500/30 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-cyan-300">
            {isLoginMode ? 'Bejelentkezés' : 'Regisztráció'}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {isLoginMode 
              ? 'Jelentkezz be a NOXLY fiókodba' 
              : 'Hozz létre egy NOXLY fiókot'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email cím</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 pr-12"
                />
                {isCheckingEmail && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                  </div>
                )}
                {emailExists !== null && !isCheckingEmail && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {emailExists ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                )}
              </div>
              {emailExists !== null && !isCheckingEmail && (
                <p className="text-sm text-gray-400">
                  {emailExists 
                    ? 'Ez az email cím már regisztrálva van' 
                    : 'Ez az email cím még szabad'
                  }
                </p>
              )}
            </div>

            {/* Name Fields - Only show for registration */}
            {!isLoginMode && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-300">Keresztnév</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Keresztnév"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required={!isLoginMode}
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
                    required={!isLoginMode}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Jelszó</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Jelszó"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 pr-12"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password - Only show for registration */}
            {!isLoginMode && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">Jelszó megerősítése</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Jelszó újra"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={!isLoginMode}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                />
                {!passwordsMatch && confirmPassword && (
                  <p className="text-sm text-red-400">A jelszavak nem egyeznek</p>
                )}
              </div>
            )}

            {/* Password Strength - Only show for registration */}
            {!isLoginMode && password && (
              <div className="space-y-2 p-4 bg-gray-800/30 rounded-lg">
                <p className="text-sm text-gray-300 font-medium">Jelszó erőssége:</p>
                <div className="space-y-1">
                  <PasswordRequirement met={passwordStrength.hasLength} text="Legalább 8 karakter" />
                  <PasswordRequirement met={passwordStrength.hasUppercase} text="Tartalmaz nagybetűt" />
                  <PasswordRequirement met={passwordStrength.hasLowercase} text="Tartalmaz kisbetűt" />
                  <PasswordRequirement met={passwordStrength.hasNumber} text="Tartalmaz számot" />
                  <PasswordRequirement met={passwordStrength.hasSpecial} text="Tartalmaz speciális karaktert" />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white py-6 text-lg"
              disabled={isLoading || (isLoginMode ? !email || !password : !isPasswordStrong || !passwordsMatch)}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : null}
              {isLoginMode ? 'Bejelentkezés' : 'Regisztráció'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;