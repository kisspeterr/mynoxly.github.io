import React from 'react';
import { useFavorites } from '@/hooks/use-favorites';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Heart, Building, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';

const UserFavoritesList: React.FC = () => {
  const { favorites, isLoading, toggleFavorite } = useFavorites();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-red-400" />
        <p className="ml-3 text-gray-300">Kedvencek betöltése...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-red-300 flex items-center gap-2">
        <Heart className="h-6 w-6 fill-red-400 text-red-400" />
        Kedvenc Partnereim ({favorites.length})
      </h2>

      {favorites.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">Még nincsenek kedvenc partnereid. Fedezd fel a helyeket a főoldalon!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favorites.map(fav => (
            <Card 
              key={fav.id} 
              className="bg-black/50 border-red-500/30 backdrop-blur-sm text-white flex items-center justify-between p-4"
            >
              <Link to={`/organization/${fav.profile.organization_name}`} className="flex items-center space-x-4 flex-grow min-w-0">
                {fav.profile.logo_url ? (
                  <img 
                    src={fav.profile.logo_url} 
                    alt={fav.profile.organization_name} 
                    className="h-12 w-12 rounded-full object-cover border-2 border-red-400"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center border-2 border-red-400">
                    <Building className="h-6 w-6 text-red-400" />
                  </div>
                )}
                <div className="text-left min-w-0">
                  <CardTitle className="text-lg text-cyan-300 truncate">{fav.profile.organization_name}</CardTitle>
                  <CardDescription className="text-gray-400 flex items-center text-sm">
                    <MapPin className="h-3 w-3 mr-1" /> Pécs
                  </CardDescription>
                </div>
              </Link>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="icon" className="h-8 w-8 flex-shrink-0 ml-4">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black/80 border-red-500/30 backdrop-blur-sm max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="text-red-400">Kedvenc eltávolítása</DialogTitle>
                    <DialogDescription className="text-gray-300">
                      Biztosan el szeretnéd távolítani a(z) "{fav.profile.organization_name}" szervezetet a kedvenceid közül?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" className="text-gray-300 border-gray-700 hover:bg-gray-800">Mégsem</Button>
                    </DialogClose>
                    <Button 
                      variant="destructive" 
                      onClick={() => toggleFavorite(fav.organization_id, fav.profile.organization_name)}
                    >
                      Eltávolítás megerősítése
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserFavoritesList;