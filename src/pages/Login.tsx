"use client";

import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/30 border-cyan-500/30 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-cyan-300">Bejelentkezés</CardTitle>
          <CardDescription className="text-gray-300">
            Jelentkezz be a NOXLY fiókodba
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#06b6d4',
                    brandAccent: '#a855f7',
                  },
                },
              },
            }}
            theme="dark"
            providers={[]}
            view="sign_in"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;