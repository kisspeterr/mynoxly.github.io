import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import AuthLoader from '@/components/AuthLoader';
import UnauthorizedAccess from '@/components/UnauthorizedAccess';

interface AdminRouteProps {
  children?: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    // Use AuthLoader's global loading screen while authentication status is unknown
    return <AuthLoader>{children}</AuthLoader>;
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to login (ProtectedRoute handles this, but explicit check is safer)
    return <Navigate to="/login" replace />;
  }
  
  // Check if the profile is loaded and the user is not an admin
  if (!isAdmin) {
    // Redirect non-admin users to the unauthorized access page
    return <UnauthorizedAccess />;
  }

  // Render children or Outlet if authenticated and admin
  return children ? <>{children}</> : <Outlet />;
};

export default AdminRoute;