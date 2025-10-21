import React, { useState, useEffect, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface DynamicLocationPickerMapProps {
  initialLat?: number | null;
  initialLng?: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

// Default center for Pécs, Hungary (used if no initial position is provided)
const DEFAULT_CENTER: [number, number] = [46.0727, 18.2322]; 

// Use React.lazy to dynamically import the Leaflet content component
const LazyLocationPickerMapContent = React.lazy(() => import('./LocationPickerMapContent'));

const DynamicLocationPickerMap: React.FC<DynamicLocationPickerMapProps> = ({ initialLat, initialLng, onLocationChange }) => {
  const [isClient, setIsClient] = useState(false);
  // Initialize position to null, it will be set to DEFAULT_CENTER or initial values in useEffect
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    // 1. Ensure this runs only on the client side after mounting
    setIsClient(true);
    
    // 2. Initialize position based on props or default center
    if (initialLat && initialLng) {
      setPosition([initialLat, initialLng]);
    } else {
      setPosition(DEFAULT_CENTER);
    }
  }, [initialLat, initialLng]);

  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationChange(lat, lng);
  };

  if (!isClient || !position) {
    // Placeholder while loading on the client side or position is not yet set
    return (
      <div className="h-80 w-full flex items-center justify-center bg-gray-800 rounded-xl border border-purple-500/30 text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin text-purple-400 mr-2" />
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
        position={position} // Position is guaranteed to be set here
        onLocationChange={handleMapClick} 
      />
    </Suspense>
  );
};

export default DynamicLocationPickerMap;