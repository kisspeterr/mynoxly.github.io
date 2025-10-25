import React, { useState, useEffect, lazy, Suspense, ComponentType } from 'react';
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
  // State to hold the dynamically imported component
  const [LeafletMapComponent, setLeafletMapComponent] = useState<ComponentType<LeafletMapProps> | null>(null);
  
  // Use effect to perform the dynamic import only on the client side
  useEffect(() => {
    // Check if window exists (client environment)
    if (typeof window !== 'undefined') {
      import('./LeafletMap')
        .then(module => {
          // Set the default export as the component
          setLeafletMapComponent(() => module.default);
        })
        .catch(error => {
          console.error("Failed to load LeafletMap component:", error);
          showError("Hiba történt a térkép betöltésekor.");
        });
    }
  }, []);

  const lat = initialLat ?? DEFAULT_LAT;
  const lng = initialLng ?? DEFAULT_LNG;

  if (!LeafletMapComponent) {
    // Placeholder while loading the component
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