import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import AuthLoader from '@/components/AuthLoader';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Use AuthLoader's global loading screen while authentication status is unknown
    return <AuthLoader>{children}</AuthLoader>;
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to the login page
    return <Navigate to="/login" replace />;
  }

  // Render children or Outlet if authenticated
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;