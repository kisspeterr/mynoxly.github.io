import React, { useState, useEffect } from 'react';
import LocationPickerMap from './LocationPickerMap';

interface DynamicLocationPickerMapProps {
  initialLat?: number | null;
  initialLng?: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

const DynamicLocationPickerMap: React.FC<DynamicLocationPickerMapProps> = (props) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // Ensure this runs only on the client side after mounting
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Placeholder while loading on the client side
    return (
      <div className="h-80 w-full flex items-center justify-center bg-gray-800 rounded-xl border border-purple-500/30 text-gray-400">
        Térkép betöltése...
      </div>
    );
  }
  
  // Render the actual map component only on the client
  return <LocationPickerMap {...props} />;
};

export default DynamicLocationPickerMap;