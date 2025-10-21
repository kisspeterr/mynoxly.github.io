import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import PublicEventMapContent from './PublicEventMapContent'; // Import szinkron módon, de csak a kliens oldalon használjuk

interface DynamicPublicEventMapProps {
  lat: number;
  lng: number;
  locationName: string;
}

const DynamicPublicEventMap: React.FC<DynamicPublicEventMapProps> = (props) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // Ensure this runs only on the client side after mounting
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Placeholder while loading on the client side after mounting
    return (
      <div className="h-40 w-full flex items-center justify-center bg-gray-800 rounded-xl border border-purple-500/30 text-gray-400 mb-4">
        Térkép betöltése...
      </div>
    );
  }
  
  // Render the actual map component only on the client
  return (
    <PublicEventMapContent {...props} />
  );
};

export default DynamicPublicEventMap;