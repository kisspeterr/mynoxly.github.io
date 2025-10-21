import React, { useState, useEffect, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface DynamicLocationPickerMapProps {
  initialLat?: number | null;
  initialLng?: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

// Use React.lazy to dynamically import the Leaflet content component
const LazyLocationPickerMapContent = React.lazy(() => import('./LocationPickerMapContent'));

const DynamicLocationPickerMap: React.FC<DynamicLocationPickerMapProps> = ({ initialLat, initialLng, onLocationChange }) => {
  const [isClient, setIsClient] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );

  useEffect(() => {
    // Ensure this runs only on the client side after mounting
    setIsClient(true);
    if (initialLat && initialLng) {
      setPosition([initialLat, initialLng]);
    }
  }, [initialLat, initialLng]);

  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationChange(lat, lng);
  };

  if (!isClient) {
    // Placeholder while loading on the client side
    return (
      <div className="h-80 w-full flex items-center justify-center bg-gray-800 rounded-xl border border-purple-500/30 text-gray-400">
        Térkép betöltése...
      </div>
    );
  }
  
  // Render the actual map component only on the client using Suspense
  return (
    <Suspense fallback={
      <div className="h-80 w-full flex items-center justify-center bg-gray-800 rounded-xl border border-purple-500/30 text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin text-purple-400 mr-2" />
        Térkép betöltése...
      </div>
    }>
      <LazyLocationPickerMapContent 
        position={position} 
        onLocationChange={handleMapClick} 
      />
    </Suspense>
  );
};

export default DynamicLocationPickerMap;