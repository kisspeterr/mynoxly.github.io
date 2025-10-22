import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface AuthLoaderProps {
  children: React.ReactNode;
}

// Maximális betöltési idő 500 ezredmásodperc
const MAX_LOADING_TIME_MS = 500;

const AuthLoader: React.FC<AuthLoaderProps> = ({ children }) => {
  const { isLoading } = useAuth();

  // Új állapot: Kényszerített befejezés időtúllépés miatt
  const [isTimeoutReached, setIsTimeoutReached] = useState(false);

  useEffect(() => {
    let maxTimer: number | undefined;

    if (isLoading && !isTimeoutReached) {
      // 500ms után kényszerítjük a tartalom megjelenítését
      maxTimer = window.setTimeout(() => {
        if (isLoading) {
            console.warn("Auth loading timeout reached (500ms). Forcing content render.");
        }
        setIsTimeoutReached(true);
      }, MAX_LOADING_TIME_MS);
      
    } else {
      // Ha a betöltés befejeződött (isLoading=false)
      setIsTimeoutReached(false); // Reset timeout state
    }

    return () => {
      if (maxTimer) clearTimeout(maxTimer);
    };
  }, [isLoading]);

  // Ha a useAuth hook még tölt, ÉS az időtúllépés még nem járt le, mutassuk a loadert.
  if (isLoading && !isTimeoutReached) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-4" />
        <p className="text-cyan-400">Hitelesítési állapot betöltése...</p>
      </div>
    );
  }

  // Ha a betöltés befejeződött (isLoading=false) VAGY az időtúllépés lejárt, mutassuk a tartalmat.
  return <>{children}</>;
};

export default AuthLoader;