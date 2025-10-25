import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Search, XCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { showError } from '@/utils/toast';

// Fix for default marker icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface LocationPickerMapProps {
  initialLatitude: number | null;
  initialLongitude: number | null;
  onLocationChange: (lat: number | null, lng: number | null) => void;
}

// Default center for Pécs, Hungary
const DEFAULT_CENTER: [number, number] = [46.071, 18.233];
const DEFAULT_ZOOM = 13;

// --- Map Click Handler Component ---
const LocationMarker: React.FC<{ position: [number, number] | null, onMapClick: (lat: number, lng: number) => void }> = ({ position, onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      {/* Tooltip or Popup can be added here if needed */}
    </Marker>
  );
};

const LocationPickerMap: React.FC<LocationPickerMapProps> = ({ initialLatitude, initialLongitude, onLocationChange }) => {
  const initialPosition: [number, number] | null = useMemo(() => 
    (initialLatitude !== null && initialLongitude !== null) 
      ? [initialLatitude, initialLongitude] 
      : null, 
    [initialLatitude, initialLongitude]
  );
  
  const [position, setPosition] = useState<[number, number] | null>(initialPosition);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialPosition || DEFAULT_CENTER);

  // Sync external changes
  useEffect(() => {
    if (initialLatitude !== null && initialLongitude !== null) {
      const newPos: [number, number] = [initialLatitude, initialLongitude];
      setPosition(newPos);
      setMapCenter(newPos);
    } else {
      setPosition(null);
    }
  }, [initialLatitude, initialLongitude]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    const newPos: [number, number] = [lat, lng];
    setPosition(newPos);
    onLocationChange(lat, lng);
  }, [onLocationChange]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      // Using Nominatim for geocoding (OpenStreetMap service)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm)}&format=json&limit=1&countrycodes=hu`);
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        
        const newPos: [number, number] = [lat, lng];
        
        // Update map center and set marker position
        setMapCenter(newPos);
        setPosition(newPos);
        onLocationChange(lat, lng);
        showSuccess('Helyszín megtalálva!');
      } else {
        showError('Nem található helyszín a megadott cím alapján.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      showError('Hiba történt a cím keresésekor.');
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleClear = () => {
    setPosition(null);
    setSearchTerm('');
    onLocationChange(null, null);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex space-x-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            type="text"
            placeholder="Keresés cím alapján (pl. Pécs, Király utca 1.)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
            disabled={isSearching}
          />
        </div>
        <Button 
          type="submit" 
          size="icon" 
          className="bg-purple-600 hover:bg-purple-700 flex-shrink-0"
          disabled={isSearching}
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
        </Button>
        {position && (
            <Button 
              type="button" 
              size="icon" 
              variant="destructive"
              onClick={handleClear}
              className="flex-shrink-0"
            >
              <XCircle className="h-4 w-4" />
            </Button>
        )}
      </form>

      {/* Map Container */}
      <div className="h-80 w-full rounded-lg overflow-hidden border border-gray-700/50">
        <MapContainer 
          center={mapCenter} 
          zoom={DEFAULT_ZOOM} 
          scrollWheelZoom={true}
          className="h-full w-full"
          key={mapCenter.toString()} // Force remount if center changes significantly
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onMapClick={handleMapClick} />
        </MapContainer>
      </div>
      
      {/* Coordinates Display */}
      <div className="text-sm text-gray-400">
        {position ? (
          <p className="text-green-400 flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Kiválasztott koordináták: 
            <span className="font-mono ml-2">Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}</span>
          </p>
        ) : (
          <p className="text-yellow-400 flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Kérjük, válassz ki egy helyszínt a térképen vagy keress rá cím alapján.
          </p>
        )}
      </div>
    </div>
  );
};

export default LocationPickerMap;