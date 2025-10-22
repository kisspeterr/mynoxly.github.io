import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthLoaderProps {
  children: React.ReactNode;
}

const AuthLoader: React.FC<AuthLoaderProps> = ({ children }) => {
  const { isLoading } = useAuth();

  useEffect(() => {
    let intervalId: number | undefined;
    if (isLoading) {
      // This will repeatedly refresh the page every 0.7 seconds while loading.
      // WARNING: This is likely to cause an infinite loop if the auth check takes longer than 0.7s.
      intervalId = setInterval(() => {
        window.location.reload();
      }, 700);
    }

    // Cleanup the interval when the component unmounts or isLoading becomes false
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoading]);

  const handleManualRefresh = () => {
    window.location.reload();
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mr-3 mb-4" />
        <p className="text-cyan-400 mb-6">Hitelesítési állapot betöltése...</p>
        
        <Button 
          onClick={handleManualRefresh}
          variant="outline"
          className="border-purple-500 text-purple-300 hover:bg-purple-500/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Frissítés (Ha beragadt)
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthLoader;