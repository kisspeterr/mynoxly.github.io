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

// ... (rest of the imports and interfaces remain the same)

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
    // If user is already logged in, redirect to home
    if (user && !authLoading) {
      window.location.href = '/';
    }
  }, [user, authLoading]);

  // ... (rest of the component remains the same)

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Betöltés...</p>
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

  // ... (rest of the component remains the same)
};

export default Auth;