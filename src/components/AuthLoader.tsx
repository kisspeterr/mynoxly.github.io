import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface AuthLoaderProps {
  children: React.ReactNode;
}

const AuthLoader: React.FC<AuthLoaderProps> = ({ children }) => {
  const { isLoading } = useAuth();

  // Csak akkor mutatunk loadert, ha a kezdeti hitelesítési állapot még tölt.
  // Ez blokkolja a teljes alkalmazást, amíg a session be nem töltődik.
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-4" />
        <p className="text-cyan-400">Hitelesítési állapot betöltése...</p>
      </div>
    );
  }

  // Ha a betöltés befejeződött (isLoading=false), mutassuk a tartalmat.
  return <>{children}</>;
};

export default AuthLoader;