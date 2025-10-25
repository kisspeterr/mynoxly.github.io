import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { showError } from '@/utils/toast';

// Dynamically import the LeafletMap component
const LeafletMap = lazy(() => import('./LeafletMap'));

interface LocationPickerProps {
  initialLat: number | null;
  initialLng: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

// Default coordinates for Pécs, Hungary
const DEFAULT_LAT = 46.0727;
const DEFAULT_LNG = 18.2328;

const LocationPicker: React.FC<LocationPickerProps> = ({ initialLat, initialLng, onLocationChange }) => {
  const [isClient, setIsClient] = useState(false);
  
  // Ensure the component only renders the map on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const lat = initialLat ?? DEFAULT_LAT;
  const lng = initialLng ?? DEFAULT_LNG;

  if (!isClient) {
    // Placeholder while waiting for client-side hydration
    return (
      <div className="h-96 w-full flex items-center justify-center bg-gray-800 rounded-lg text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Térkép betöltése...
      </div>
    );
  }

  return (
    <Suspense fallback={
        <div className="h-96 w-full flex items-center justify-center bg-gray-800 rounded-lg text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Térkép betöltése...
        </div>
    }>
      <LeafletMap 
        initialLat={lat}
        initialLng={lng}
        onLocationChange={onLocationChange}
      />
    </Suspense>
  );
};

export default LocationPicker;