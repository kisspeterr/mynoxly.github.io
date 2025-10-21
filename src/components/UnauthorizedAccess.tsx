import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldOff, Home } from 'lucide-react';

const UnauthorizedAccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 p-4 text-white">
      <div className="text-center bg-black/30 border border-red-500/30 rounded-xl p-10 shadow-2xl backdrop-blur-sm max-w-md">
        <ShieldOff className="h-16 w-16 text-red-400 mx-auto mb-6 animate-pulse" />
        <h1 className="text-3xl font-bold mb-4 text-red-300">Hozzáférés Megtagadva</h1>
        <p className="text-lg text-gray-300 mb-8">
          Sajnáljuk, de nincs jogosultságod az Admin Dashboard eléréséhez.
        </p>
        <Button 
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white px-6 py-3 text-base"
        >
          <Home className="h-4 w-4 mr-2" />
          Vissza a főoldalra
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedAccess;