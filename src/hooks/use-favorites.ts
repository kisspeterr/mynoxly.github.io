import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';

export interface FavoriteOrganization {
  id: string; // favorite_organizations ID
  organization_id: string; // profiles ID
  
  // Joined profile data
  profile: {
    id: string;
    organization_name: string;
    logo_url: string | null;
  };
}

export const useFavorites = () => {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch favorites, joining the organization profile data
      const { data, error } = await supabase
        .from('favorite_organizations')
        .select(`
          id,
          organization_id,
          profile:organization_id (id, organization_name, logo_url)
        `)
        .eq('user_id', user.id); // RLS ensures this is safe

      if (error) {
        showError('Hiba történt a kedvencek betöltésekor.');
        console.error('Fetch favorites error:', error);
        setFavorites([]);
        return;
      }
      
      // Filter out any records where the profile join failed (shouldn't happen with ON DELETE CASCADE)
      const validFavorites = (data as FavoriteOrganization[]).filter(fav => fav.profile !== null);
      setFavorites(validFavorites);

    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    fetchFavorites();
    
    // Setup Realtime subscription for changes in user's favorites
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    if (isAuthenticated && user) {
      channel = supabase
        .channel(`user_favorites_${user.id}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'favorite_organizations',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchFavorites();
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchFavorites, isAuthenticated, user?.id]);

  const isFavorite = (organizationId: string): boolean => {
    return favorites.some(fav => fav.organization_id === organizationId);
  };

  const toggleFavorite = async (organizationId: string, organizationName: string) => {
    if (!isAuthenticated || !user) {
      showError('Kérjük, jelentkezz be a kedvencek kezeléséhez.');
      return;
    }

    const isCurrentlyFavorite = isFavorite(organizationId);
    
    if (isCurrentlyFavorite) {
      // Remove favorite
      const { error } = await supabase
        .from('favorite_organizations')
        .delete()
        .eq('user_id', user.id)
        .eq('organization_id', organizationId);

      if (error) {
        showError('Hiba történt a kedvenc eltávolításakor.');
        console.error('Remove favorite error:', error);
        return;
      }
      showSuccess(`${organizationName} eltávolítva a kedvencek közül.`);
    } else {
      // Add favorite
      const { error } = await supabase
        .from('favorite_organizations')
        .insert({ user_id: user.id, organization_id: organizationId });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
             showError('Ez a szervezet már a kedvenceid között van.');
        } else {
             showError('Hiba történt a kedvenc hozzáadásakor.');
             console.error('Add favorite error:', error);
        }
        return;
      }
      showSuccess(`${organizationName} hozzáadva a kedvencekhez!`);
    }
    
    // Realtime should handle the state update, but we can trigger a fetch for immediate feedback
    fetchFavorites();
  };

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    fetchFavorites,
  };
};