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
  
  // Removed the aggressive 1-second automatic reload logic.
  // The useAuth hook should handle session loading and state transition correctly.

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
          Frissítés (Ha beragadt)
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthLoader;