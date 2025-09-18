import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { showError } from '@/utils/toast';

const Admin = () => {
  const { profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (profile && profile.role === 'admin') {
        setIsAuthorized(true);
      } else {
        showError('Nincs jogosultsága az admin oldal eléréséhez.');
        navigate('/');
      }
    }
  }, [profile, loading, navigate]);

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

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-300">Admin Vezérlőpult</h1>
          <Button 
            onClick={signOut}
            variant="outline"
            className="border-cyan-500 text-cyan-300 hover:bg-cyan-500/10"
          >
            Kijelentkezés
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-black/30 border-cyan-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-300">Felhasználók</CardTitle>
              <CardDescription className="text-gray-400">
                Felhasználói fiókok kezelése
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Összes felhasználó: 0
              </p>
              <Button className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700">
                Felhasználók kezelése
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-cyan-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-300">Statisztikák</CardTitle>
              <CardDescription className="text-gray-400">
                Alkalmazás használati statisztikák
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Aktív felhasználók: 0
              </p>
              <Button className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700">
                Statisztikák megtekintése
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-cyan-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-300">Beállítások</CardTitle>
              <CardDescription className="text-gray-400">
                Alkalmazás beállítások
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Rendszer konfiguráció
              </p>
              <Button className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700">
                Beállítások megnyitása
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;