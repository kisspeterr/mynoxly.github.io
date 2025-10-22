import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface AuthLoaderProps {
  children: React.ReactNode;
}

const AuthLoader: React.FC<AuthLoaderProps> = ({ children }) => {
  const { isLoading } = useAuth();

  // Ezt használjuk arra, hogy csak akkor mutassuk a loadert, ha tartósan tölt
  const [shouldShowLoading, setShouldShowLoading] = useState(false);

  useEffect(() => {
    let timer: number | undefined;

    if (isLoading) {
      // Csak akkor mutassuk, ha 200ms-nél tovább tölt
      timer = window.setTimeout(() => {
        setShouldShowLoading(true);
      }, 200);
    } else {
      setShouldShowLoading(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  if (shouldShowLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-4" />
        <p className="text-cyan-400">Hitelesítési állapot betöltése...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthLoader;
