import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface AuthLoaderProps {
  children: React.ReactNode;
}

// 3 másodperc után frissít, ha beragadt a betöltés
const FALLBACK_TIMEOUT_MS = 3000; 

const AuthLoader: React.FC<AuthLoaderProps> = ({ children }) => {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        console.warn("Auth loading timeout reached. Forcing page refresh to resolve potential session lock.");
        window.location.reload();
      }, FALLBACK_TIMEOUT_MS);

      return () => clearTimeout(timer);
    }
    // Ha a betöltés befejeződött, töröljük az időzítőt
    return () => {};
  }, [isLoading]);

  // Ha a useAuth hook még tölt, mutassuk a loadert.
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