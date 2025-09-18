"use client";

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle, Loader2, ArrowLeft, Mail } from 'lucide-react';
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
  const [step, setStep] = useState<'email' | 'login' | 'register'>('email');

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      showError('Kérjük, érvényes email címet adj meg');
      return;
    }

    setIsCheckingEmail(true);
    try {
      await checkEmailExists(email);
      
      if (emailExists === true) {
        setStep('login');
      } else if (emailExists === false) {
        setStep('register');
      }
    } catch (error) {
      showError('Hiba történt az email ellenőrzése során');
    } finally {
      setIsCheckingEmail(false);
    }
  };

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

  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/20 rounded-full mb-4">
          <Mail className="h-8 w-8 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-bold text-cyan-300 mb-2">Bejelentkezés</h2>
        <p className="text-gray-300">Add meg az email címed a folytatáshoz</p>
      </div>

      <div className="space-y-4">
        <Label htmlFor="email" className="text-gray-300">Email cím</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 text-center text-lg py-6"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white py-6 text-lg"
        disabled={isCheckingEmail || !email.includes('@')}
      >
        {isCheckingEmail ? (
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
        ) : null}
        Tovább
      </Button>
    </form>
  );

  const renderLoginStep = () => (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setStep('email')}
          className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Vissza
        </button>
        <h2 className="text-xl font-bold text-cyan-300">Bejelentkezés</h2>
        <div className="w-6"></div> {/* Spacer for balance */}
      </div>

      <div className="text-center mb-6">
        <p className="text-gray-300">Bejelentkezés mint</p>
        <p className="text-cyan-400 font-medium">{email}</p>
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
            className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 pr-12 py-6 text-lg"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white py-6 text-lg"
        disabled={isLoading || !password}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
        ) : null}
        Bejelentkezés
      </Button>
    </form>
  );

  const renderRegisterStep = () => (
    <form onSubmit={handleRegister} className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setStep('email')}
          className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Vissza
        </button>
        <h2 className="text-xl font-bold text-cyan-300">Regisztráció</h2>
        <div className="w-6"></div> {/* Spacer for balance */}
      </div>

      <div className="text-center mb-6">
        <p className="text-gray-300">Fiók létrehozása</p>
        <p className="text-cyan-400 font-medium">{email}</p>
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
        disabled={isLoading || !isPasswordStrong || !passwordsMatch || !firstName || !lastName}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
        ) : null}
        Regisztráció
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/30 border-cyan-500/30 backdrop-blur-sm">
        <CardContent className="p-8">
          {step === 'email' && renderEmailStep()}
          {step === 'login' && renderLoginStep()}
          {step === 'register' && renderRegisterStep()}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;