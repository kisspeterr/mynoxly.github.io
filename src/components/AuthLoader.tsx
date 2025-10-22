import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface AuthLoaderProps {
  children: React.ReactNode;
}

const AuthLoader: React.FC<AuthLoaderProps> = ({ children }) => {
  const { isLoading } = useAuth();

  // Ha még tölt az auth/session/profil → mutassunk egy globális loading képernyőt
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-4" />
        <p className="text-cyan-400">Hitelesítési állapot betöltése...</p>
      </div>
    );
  }

  // Ha minden kész → engedjük a normál oldalt betöltődni
  return <>{children}</>;
};

export default AuthLoader;
