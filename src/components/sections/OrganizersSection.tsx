import React, { useState, useEffect } from 'react';
import { Building, Search, Heart, Loader2, MapPin, Tag, BarChart2, Beer, Utensils, CalendarCheck, Music, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { useAuth } from '@/hooks/use-auth';
import { useFavorites } from '@/hooks/use-favorites';
import { Button } from '@/components/ui/button';
import { CATEGORY_LABELS } from '@/utils/categories'; // Import CATEGORY_LABELS

interface PartnerProfile {
  id: string; // organizations.id
  organization_name: string;
  logo_url: string | null;
  category: string | null; // NEW
  formatted_address: string | null; // NEW
}

// Define available categories and their Lucide icons
// Removed local CATEGORY_ICONS and CATEGORY_LABELS definitions

const OrganizersSection = () => {
  const { isAuthenticated } = useAuth();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isToggling, setIsToggling] = useState<string | null>(null); // Track which organization is being toggled

  useEffect(() => {
    const fetchPartners = async () => {
      setIsLoading(true);
      try {
        // Fetch all organizations that are marked as public, including new fields
        const { data, error } = await supabase
          .from('organizations')
          .select('id, organization_name, logo_url, is_public, category, formatted_address') // ADDED category, formatted_address
          .eq('is_public', true) // <-- Filter for public organizations
          .order('organization_name', { ascending: true });

        if (error) {
          showError('Hiba történt a partnerek betöltésekor.');
          console.error('Fetch partners error:', error);
          setPartners([]);
          return;
        }
        
        // The data structure now directly matches PartnerProfile
        setPartners(data as PartnerProfile[]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const filteredPartners = partners.filter(partner => 
    partner.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (partner.category && CATEGORY_LABELS[partner.category]?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (partner.formatted_address && partner.formatted_address.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Sorting logic: Favorites first if authenticated
  const sortedPartners = isAuthenticated
    ? [...filteredPartners].sort((a, b) => {
        const aIsFavorite = isFavorite(a.id);
        const bIsFavorite = isFavorite(b.id);
        
        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;
        
        // Secondary sort by name
        return a.organization_name.localeCompare(b.organization_name);
      })
    : filteredPartners;
  
  
  const handleToggleFavorite = async (partner: PartnerProfile) => {
    if (!isAuthenticated) {
      showError('Kérjük, jelentkezz be a kedvencek kezeléséhez.');
      return;
    }
    setIsToggling(partner.id);
    // Use organization ID for toggling favorite
    await toggleFavorite(partner.id, partner.organization_name);
    setIsToggling(null);
  };

  return (
    <section id="organizers-section" className="py-12 px-6">
      <div className="container mx-auto text-center">
        <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <Building className="h-4 w-4 mr-2" />
          Partnerek
        </Badge>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-purple-300">
          Fedezd fel a helyeket
        </h2>
        
        <p className="text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          Keresd meg kedvenc szórakozóhelyeidet és éttermeidet Pécsen.
        </p>
        
        {/* Search Input (Kept for filtering functionality) */}
        <div className="max-w-lg mx-auto mb-12 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input 
            type="text"
            placeholder="Keresés partner névre, kategóriára vagy címre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 text-lg py-6 rounded-xl"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <p className="ml-3 text-gray-300">Partnerek betöltése...</p>
          </div>
        ) : sortedPartners.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">Nincs találat a keresési feltételeknek megfelelő partnerre.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {sortedPartners.map((partner) => {
              const favorite = isFavorite(partner.id);
              const isCurrentToggling = isToggling === partner.id;
              
              return (
                <Card 
                  key={partner.id} 
                  className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-white hover:shadow-lg hover:shadow-purple-500/20 transition-shadow duration-300 flex flex-col items-center p-4 sm:p-6"
                >
                  {/* Link to Organization Profile Page */}
                  <Link to={`/organization/${partner.organization_name}`} className="w-full flex flex-col items-center">
                    <div className="relative mb-4">
                      {/* Larger Logo Area */}
                      <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-gray-800 flex items-center justify-center border-4 border-purple-400 shadow-lg overflow-hidden">
                        {partner.logo_url ? (
                          <img 
                            src={partner.logo_url} 
                            alt={partner.organization_name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building className="h-12 w-12 text-purple-400" />
                        )}
                      </div>
                    </div>
                    
                    {/* Organization Name (Title) */}
                    <CardTitle className="text-lg sm:text-xl text-cyan-300 text-center mb-2 truncate w-full px-2">{partner.organization_name}</CardTitle>
                    
                    {/* Removed Category and Address */}
                  </Link>
                  
                  {/* Favorite Button (Only if authenticated) */}
                  {isAuthenticated && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleFavorite(partner)}
                      disabled={isCurrentToggling}
                      className={`mt-2 transition-colors duration-300 ${
                        favorite 
                          ? 'text-red-400 hover:text-red-500 hover:bg-red-500/10' 
                          : 'text-gray-500 hover:text-red-400 hover:bg-gray-700/20'
                      }`}
                    >
                      {isCurrentToggling ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Heart className={`h-5 w-5 ${favorite ? 'fill-red-400' : ''}`} />
                      )}
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default OrganizersSection;