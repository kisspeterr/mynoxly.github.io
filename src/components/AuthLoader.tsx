import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface AuthLoaderProps {
  children: React.ReactNode;
}

// Maximális betöltési idő 5 másodperc
const MAX_LOADING_TIME_MS = 5000;

const AuthLoader: React.FC<AuthLoaderProps> = ({ children }) => {
  const { isLoading } = useAuth();

  // Ezt használjuk arra, hogy csak akkor mutassuk a loadert, ha tartósan tölt
  const [shouldShowLoading, setShouldShowLoading] = useState(false);
  // Új állapot: Kényszerített befejezés időtúllépés miatt
  const [isTimeoutReached, setIsTimeoutReached] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    let maxTimer: number | undefined;

    if (isLoading && !isTimeoutReached) {
      // 1. Késleltetett loader megjelenítés (200ms)
      timer = window.setTimeout(() => {
        setShouldShowLoading(true);
      }, 200);
      
      // 2. Maximális időtúllépés (5000ms)
      maxTimer = window.setTimeout(() => {
        setIsTimeoutReached(true);
        setShouldShowLoading(false); // Hide loader
        console.warn("Auth loading timeout reached (5s). Displaying content anyway.");
      }, MAX_LOADING_TIME_MS);
      
    } else {
      // Ha a betöltés befejeződött (isLoading=false) vagy időtúllépés történt
      setShouldShowLoading(false);
      setIsTimeoutReached(false); // Reset timeout state
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (maxTimer) clearTimeout(maxTimer);
    };
  }, [isLoading]);

  // Ha a useAuth hook még tölt, VAGY az időtúllépés még nem járt le, mutassuk a loadert.
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