import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Building, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_LABELS } from '@/utils/categories';

interface PartnerLocation {
  id: string;
  organization_name: string;
  logo_url: string | null;
  latitude: number;
  longitude: number;
  category: string | null;
}

// Pécs központjának koordinátái
const PECS_CENTER: [number, number] = [46.0727, 18.2322];
const INITIAL_ZOOM = 14;

// Custom icon factory function
const createCustomIcon = (logoUrl: string | null, organizationName: string) => {
    const defaultIconHtml = `<div class="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center border-2 border-white shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg></div>`;
    
    const logoHtml = logoUrl 
        ? `<img src="${logoUrl}" alt="${organizationName}" class="w-full h-full object-cover rounded-full" />`
        : defaultIconHtml;
        
    const html = `
        <div class="relative">
            <div class="absolute -top-10 -left-5">
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 p-0.5 shadow-xl">
                    <div class="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                        ${logoHtml}
                    </div>
                </div>
            </div>
        </div>
    `;

    return L.divIcon({
        className: 'partner-map-marker',
        html: html,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
    });
};


const PartnerMap: React.FC = () => {
  const [locations, setLocations] = useState<PartnerLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoading(true);
      try {
        // Fetch all public organizations that have coordinates set
        const { data, error } = await supabase
          .from('organizations')
          .select('id, organization_name, logo_url, latitude, longitude, category')
          .eq('is_public', true)
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (error) {
          showError('Hiba történt a térkép adatok betöltésekor.');
          console.error('Fetch map locations error:', error);
          setLocations([]);
          return;
        }
        
        // Filter and map to PartnerLocation type
        const validLocations: PartnerLocation[] = (data || [])
            .filter(d => d.latitude !== null && d.longitude !== null)
            .map(d => ({
                id: d.id,
                organization_name: d.organization_name,
                logo_url: d.logo_url,
                latitude: d.latitude as number,
                longitude: d.longitude as number,
                category: d.category,
            }));
            
        setLocations(validLocations);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);
  
  // Calculate map center based on locations or default to Pécs
  const mapCenter: [number, number] = useMemo(() => {
    if (locations.length > 0) {
        // Simple average calculation for centering
        const avgLat = locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length;
        const avgLng = locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length;
        return [avgLat, avgLng];
    }
    return PECS_CENTER;
  }, [locations]);

  return (
    <section id="partner-map" className="py-12 px-6">
      <div className="container mx-auto text-center">
        <Badge className="mb-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0">
          <MapPin className="h-4 w-4 mr-2" />
          Interaktív Térkép
        </Badge>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-cyan-300">
          Partnereink Pécsen
        </h2>
        
        <p className="text-xl text-gray-300 text-center mb-8 max-w-2xl mx-auto">
          Kattints a logókra a térképen a partner profiljának megtekintéséhez.
        </p>

        <Card className="bg-black/50 border-cyan-500/30 backdrop-blur-sm p-4 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              <p className="ml-3 text-gray-300">Térkép adatok betöltése...</p>
            </div>
          ) : (
            <div className="w-full h-96 rounded-xl overflow-hidden">
              <MapContainer 
                center={mapCenter} 
                zoom={INITIAL_ZOOM} 
                scrollWheelZoom={true} 
                className="w-full h-full z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {locations.map(loc => (
                  <Marker 
                    key={loc.id} 
                    position={[loc.latitude, loc.longitude]} 
                    icon={createCustomIcon(loc.logo_url, loc.organization_name)}
                  >
                    <Popup>
                      <div className="text-center p-2">
                        <CardTitle className="text-lg text-cyan-600 mb-2">{loc.organization_name}</CardTitle>
                        <p className="text-sm text-gray-600 mb-2">
                            Kategória: {loc.category ? CATEGORY_LABELS[loc.category] || loc.category : 'Nincs megadva'}
                        </p>
                        <Link to={`/organization/${loc.organization_name}`}>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            Profil megtekintése
                          </Button>
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};

export default PartnerMap;