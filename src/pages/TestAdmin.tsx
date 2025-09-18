import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { makeUserAdmin } from '@/utils/adminHelpers';
import { showSuccess, showError } from '@/utils/toast';

const TestAdmin = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleMakeAdmin = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await makeUserAdmin(user.id);
      if (result.success) {
        showSuccess('Sikeresen admin jogot adott magának! Frissítse az oldalt.');
      } else {
        showError('Hiba történt az admin jog adása során.');
      }
    } catch (error) {
      showError('Váratlan hiba történt.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white p-6">
      <div className="container mx-auto max-w-2xl">
        <Card className="bg-black/30 border-cyan-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-cyan-300">Admin Teszt Oldal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Felhasználói adatok:</h3>
              <p>Felhasználó ID: {user?.id || 'Nincs bejelentkezve'}</p>
              <p>Szerepkör: {profile?.role || 'Nincs adat'}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Admin jog adása:</h3>
              <p className="text-gray-300 mb-4">
                Ez a funkció csak tesztelési célokra szolgál. Egy valódi alkalmazásban 
                az admin jogot csak egy meglévő admin adhat más felhasználónak.
              </p>
              <Button 
                onClick={handleMakeAdmin}
                disabled={!user || loading || profile?.role === 'admin'}
                className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
              >
                {loading ? 'Feldolgozás...' : 'Admin jog adása magamnak'}
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Admin oldal elérése:</h3>
              <p className="text-gray-300 mb-4">
                Miután admin jogot adott magának, frissítse az oldalt, majd az 
                "Admin" menüpont fog megjelenni a felhasználói menüben.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestAdmin;