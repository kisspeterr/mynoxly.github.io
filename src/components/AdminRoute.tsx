import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { showError } from '@/utils/toast';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAdmin, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Betöltés...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    showError('Bejelentkezés szükséges az admin oldal eléréséhez.');
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    showError('Nincs jogosultsága az admin oldal eléréséhez.');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;