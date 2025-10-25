import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Dinamikusan importáljuk a react-leaflet komponenseket
const LazyMapContainer = lazy(() => import('react-leaflet').then(module => ({ default: module.MapContainer })));
const LazyTileLayer = lazy(() => import('react-leaflet').then(module => ({ default: module.TileLayer })));
const LazyMarker = lazy(() => import('react-leaflet').then(module => ({ default: module.Marker })));
const LazyUseMapEvents = lazy(() => import('react-leaflet').then(module => ({ default: module.useMapEvents })));

// Fix for default Leaflet icons not loading in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface LocationPickerProps {
  initialLat?: number | null;
  initialLng?: number | null;
  onLocationChange: (lat: number | null, lng: number | null) => void;
}

// Default center for Pécs, Hungary
const DEFAULT_CENTER: [number, number] = [46.0727, 18.2322];
const DEFAULT_ZOOM = 13;

const LocationMarker: React.FC<{ position: [number, number], onMove: (lat: number, lng: number) => void }> = ({ position, onMove }) => {
  // useMapEvents must be called inside a component rendered within MapContainer
  const useMapEvents = LazyUseMapEvents as unknown as () => { click: (callback: (e: L.LeafletMouseEvent) => void) => void };
  
  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? (
    <LazyMarker position={position} draggable={true} eventHandlers={{
        dragend: (e) => {
            const marker = e.target;
            const newPosition = marker.getLatLng();
            onMove(newPosition.lat, newPosition.lng);
        }
    }}>
    </LazyMarker>
  ) : null;
};

const LocationPicker: React.FC<LocationPickerProps> = ({ initialLat, initialLng, onLocationChange }) => {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (initialLat && initialLng) {
        setPosition([initialLat, initialLng]);
    }
  }, [initialLat, initialLng]);

  const handleMove = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationChange(lat, lng);
  };
  
  const center = position || DEFAULT_CENTER;

  return (
    <div className="space-y-3">
      <div className="flex items-center text-gray-300">
        <MapPin className="h-4 w-4 mr-2 text-purple-400" />
        <span className="font-semibold">Helyszín beállítása a térképen</span>
      </div>
      
      <div className="relative h-80 w-full rounded-lg overflow-hidden border border-gray-700/50">
        {!isMapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            </div>
        )}
        <Suspense fallback={null}>
            <LazyMapContainer 
              center={center} 
              zoom={DEFAULT_ZOOM} 
              scrollWheelZoom={false} 
              className={cn("h-full w-full z-0", isMapLoaded ? 'opacity-100' : 'opacity-0')}
              whenReady={() => setIsMapLoaded(true)}
            >
              <LazyTileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} onMove={handleMove} />
            </LazyMapContainer>
        </Suspense>
      </div>
      
      <div className="text-sm text-gray-400">
        {position ? (
          <p>Kiválasztott koordináták: Lat: {position[0].toFixed(4)}, Lng: {position[1].toFixed(4)}</p>
        ) : (
          <p>Kattints a térképre a helyszín kiválasztásához, vagy húzd a jelölőt.</p>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;