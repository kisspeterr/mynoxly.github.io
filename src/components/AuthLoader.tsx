import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface AuthLoaderProps {
  children: React.ReactNode;
}

const AuthLoader: React.FC<AuthLoaderProps> = ({ children }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    // Show a simple, clean global loading screen while the initial session is being checked.
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <p className="text-cyan-400 mt-4">Hitelesítési állapot betöltése...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthLoader;