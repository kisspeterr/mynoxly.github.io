import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthLoaderProps {
  children: React.ReactNode;
}

const AuthLoader: React.FC<AuthLoaderProps> = ({ children }) => {
  const { isLoading } = useAuth();
  
  const handleManualRefresh = () => {
    // Perform a full page reload to ensure the entire application state and Supabase session are re-initialized.
    window.location.reload();
  };
  
  // Automatic refresh after 10 seconds if stuck
  useEffect(() => {
    let timer: number | undefined;
    
    if (isLoading) {
      // Set a timeout for 10 seconds (10000 ms)
      timer = setTimeout(() => {
        console.warn("Auth loading timed out after 10 seconds. Attempting automatic page reload.");
        handleManualRefresh();
      }, 10000) as unknown as number;
    }

    return () => {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    };
  }, [isLoading]);


  if (isLoading) {
    // Show a global loading screen while the initial session is being checked
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
          Frissítés (Automatikus frissítés 10 mp után)
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthLoader;