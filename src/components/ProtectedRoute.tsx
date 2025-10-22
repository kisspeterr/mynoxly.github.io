import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const AuthLoadingScreen: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 p-4">
    <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
    <p className="text-cyan-400 mt-4">Hitelesítés folyamatban...</p>
  </div>
);

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoading, isAuthenticated } = useAuth();
  const [isTimeout, setIsTimeout] = useState(false);
  
  // Set a timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsTimeout(true);
      }, 3000); // 3 seconds timeout
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  if (isLoading && !isTimeout) {
    return <AuthLoadingScreen />;
  }
  
  if (!isAuthenticated || isTimeout) {
    // If not authenticated OR timeout occurred, redirect to login
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export const AdminRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();
  const [isTimeout, setIsTimeout] = useState(false);

  // Set a timeout for AdminRoute as well
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsTimeout(true);
      }, 3000); // 3 seconds timeout
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  if (isLoading && !isTimeout) {
    return <AuthLoadingScreen />;
  }
  
  if (!isAuthenticated || isTimeout) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};