"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle, Loader2, ArrowLeft, Mail, UserPlus, Home, Lock } from 'lucide-react';
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
  const [step, setStep] = useState<'login' | 'register'>('login');

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) {
        showError('Hibás email vagy jelszó');
        return;
      }

      showSuccess('Sikeres bejelentkezés!');
      // Átirányítás a home page-re
      window.location.href = '/';
    } catch (error) {
      showError('Váratlan hiba történt');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      showError('Kérjük, add meg az email címedet');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        showError('Hiba történt a jelszó visszaállításnál');
        return;
      }

      showSuccess('Jelszó visszaállító email elküldve!');
    } catch (error) {
      showError('Váratlan hiba történt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
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
      // Vissza a bejelentkezéshez
      setStep('login');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
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

  const renderLoginStep = () => (
    <div>
      <div className="absolute left-4 top-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-cyan-400"
          onClick={() => window.location.href = '/'}
        >
          <Home className="h-5 w-5" />
        </Button>
      </div>
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/20 rounded-full mb-4 mx-auto">
          <Mail className="h-8 w-8 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-bold text-cyan-300 mb-2">Bejelentkezés</h2>
        <p className="text-gray-300">Add meg az adataidat a folytatáshoz</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6 mt-8">
        <div className="space-y-4">
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

        <div className="space-y-4">
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

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white py-6 text-lg"
          disabled={isLoading || !email || !password}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : null}
          Bejelentkezés
        </Button>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={isLoading}
            className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center justify-center gap-2 w-full text-sm"
          >
            <Lock className="h-4 w-4" />
            Elfelejtetted a jelszavad?
          </button>
        </div>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => setStep('register')}
            className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center justify-center gap-2 w-full"
          >
            <UserPlus className="h-4 w-4" />
            Nincs még fiókod? Regisztrálj most!
          </button>
        </div>
      </form>
    </div>
  );

  const renderRegisterStep = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-cyan-400"
          onClick={() => window.location.href = '/'}
        >
          <Home className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold text-cyan-300">Regisztráció</h2>
        <div className="w-6"></div>
      </div>

      <form onSubmit={handleRegister} className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="reg-email" className="text-gray-300">Email cím</Label>
          <Input
            id="reg-email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-gray-300">Keresztnév</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Keresztnév"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
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
              required
              className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label htmlFor="reg-password" className="text-gray-300">Jelszó</Label>
          <div className="relative">
            <Input
              id="reg-password"
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-300">Jelszó megerősítése</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Jelszó újra"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
          />
          {!passwordsMatch && confirmPassword && (
            <p className="text-sm text-red-400">A jelszavak nem egyeznek</p>
          )}
        </div>

        {password && (
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
          disabled={isLoading || !isPasswordStrong || !passwordsMatch || !firstName || !lastName || !email}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : null}
          Regisztráció
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setStep('login')}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Már van fiókod? Jelentkezz be!
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/30 border-cyan-500/30 backdrop-blur-sm relative">
        <CardContent className="p-8">
          {step === 'login' && renderLoginStep()}
          {step === 'register' && renderRegisterStep()}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;