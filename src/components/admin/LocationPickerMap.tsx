import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet-defaulticon-fix';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { showError } from '@/utils/toast';

interface LocationPickerMapProps {
  initialLatitude: number | null;
  initialLongitude: number | null;
  onLocationChange: (lat: number | null, lng: number | null) => void;
}

// Default center: Pécs, Hungary
const DEFAULT_CENTER: LatLngExpression = [46.0721, 18.2326];
const DEFAULT_ZOOM = 13;

// Custom marker icon (using default Leaflet icon fix)
const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map events (click, move)
const MapClickHandler: React.FC<{ onMapClick: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  initialLatitude,
  initialLongitude,
  onLocationChange,
}) => {
  const [markerPosition, setMarkerPosition] = useState<LatLngExpression | null>(
    initialLatitude && initialLongitude ? [initialLatitude, initialLongitude] : null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>(
    initialLatitude && initialLongitude ? [initialLatitude, initialLongitude] : DEFAULT_CENTER
  );
  
  // Sync external changes to internal state
  useEffect(() => {
    if (initialLatitude && initialLongitude) {
      const newPos: LatLngExpression = [initialLatitude, initialLongitude];
      setMarkerPosition(newPos);
      setMapCenter(newPos);
    } else {
      setMarkerPosition(null);
    }
  }, [initialLatitude, initialLongitude]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    const newPos: LatLngExpression = [lat, lng];
    setMarkerPosition(newPos);
    onLocationChange(lat, lng);
  }, [onLocationChange]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      // Use Nominatim for geocoding (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm)}&format=json&limit=1&countrycodes=hu`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        if (isNaN(lat) || isNaN(lon)) {
            showError('Érvénytelen koordinátákat kaptunk a keresésből.');
            return;
        }
        
        const newPos: LatLngExpression = [lat, lon];
        setMarkerPosition(newPos);
        setMapCenter(newPos);
        onLocationChange(lat, lon);
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
    setMarkerPosition(null);
    onLocationChange(null, null);
  };
  
  // Memoize the MapContainer to prevent unnecessary re-renders
  const mapDisplay = useMemo(() => (
    <MapContainer 
      center={mapCenter} 
      zoom={DEFAULT_ZOOM} 
      scrollWheelZoom={false} 
      className="h-80 w-full rounded-lg z-0"
      key={`${mapCenter[0]}-${mapCenter[1]}`} // Force remount on center change
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onMapClick={handleMapClick} />
      {markerPosition && (
        <Marker position={markerPosition} icon={customIcon}>
          {/* Optional: Add a popup showing coordinates */}
        </Marker>
      )}
    </MapContainer>
  ), [mapCenter, markerPosition, handleMapClick]);

  return (
    <div className="space-y-4">
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
          className="bg-purple-600 hover:bg-purple-700"
          disabled={isSearching}
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </form>
      
      <div className="relative">
        {mapDisplay}
      </div>
      
      <div className="flex justify-between items-center text-sm text-gray-400">
        <p className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-purple-400" />
          Koordináták: 
          <span className="ml-1 font-mono text-white">
            {markerPosition ? `${(markerPosition as [number, number])[0].toFixed(4)}, ${(markerPosition as [number, number])[1].toFixed(4)}` : 'Nincs kiválasztva'}
          </span>
        </p>
        {markerPosition && (
            <Button 
                onClick={handleClear}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:bg-red-900/20"
            >
                <XCircle className="h-4 w-4 mr-1" /> Törlés
            </Button>
        )}
      </div>
      <p className="text-xs text-gray-500">Kattints a térképre a pontos helyszín kiválasztásához.</p>
    </div>
  );
};

export default LocationPickerMap;