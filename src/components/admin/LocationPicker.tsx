import React, { useState, useEffect, ComponentType } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { showError } from '@/utils/toast';

// Define the props interface for the dynamically loaded map component
interface LeafletMapProps {
  initialLat: number;
  initialLng: number;
  onLocationChange: (lat: number, lng: number) => void;
}

interface LocationPickerProps {
  initialLat: number | null;
  initialLng: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

// Default coordinates for Pécs, Hungary
const DEFAULT_LAT = 46.0727;
const DEFAULT_LNG = 18.2328;

const LocationPicker: React.FC<LocationPickerProps> = ({ initialLat, initialLng, onLocationChange }) => {
  const [LeafletMapComponent, setLeafletMapComponent] = useState<ComponentType<LeafletMapProps> | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  
  // Dynamic import in useEffect to ensure it only runs client-side
  useEffect(() => {
    // Check if running in browser environment
    if (typeof window !== 'undefined') {
      import('./LeafletMap')
        .then(module => {
          setLeafletMapComponent(() => module.default);
        })
        .catch(error => {
          console.error("Failed to load LeafletMap:", error);
          showError("Hiba történt a térkép betöltésekor.");
        })
        .finally(() => {
          setIsLoadingMap(false);
        });
    }
  }, []);

  const lat = initialLat ?? DEFAULT_LAT;
  const lng = initialLng ?? DEFAULT_LNG;

  if (isLoadingMap || !LeafletMapComponent) {
    // Placeholder while waiting for client-side hydration
    return (
      <div className="h-96 w-full flex items-center justify-center bg-gray-800 rounded-lg text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Térkép betöltése...
      </div>
    );
  }

  // Render the dynamically loaded component
  return (
    <LeafletMapComponent 
      initialLat={lat}
      initialLng={lng}
      onLocationChange={onLocationChange}
    />
  );
};

export default LocationPicker;