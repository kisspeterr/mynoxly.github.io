import React, { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useFavorites } from '@/hooks/use-favorites';
import { showError } from '@/utils/toast';

interface FavoriteButtonProps {
  organizationId: string;
  organizationName: string;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ organizationId, organizationName, className }) => {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isToggling, setIsToggling] = useState(false);
  
  const favorite = isFavorite(organizationId);

  const handleToggle = async () => {
    if (!isAuthenticated) {
      showError('Kérjük, jelentkezz be a kedvencek kezeléséhez.');
      return;
    }
    
    setIsToggling(true);
    await toggleFavorite(organizationId, organizationName);
    setIsToggling(false);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      disabled={isToggling || !isAuthenticated}
      className={`transition-colors duration-300 ${
        favorite 
          ? 'bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30' 
          : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-700/50 hover:text-red-400'
      } ${className}`}
    >
      {isToggling ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Heart className={`h-5 w-5 ${favorite ? 'fill-red-400' : ''}`} />
      )}
    </Button>
  );
};

export default FavoriteButton;