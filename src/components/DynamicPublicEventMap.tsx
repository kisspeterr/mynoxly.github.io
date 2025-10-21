import React, { useState, useEffect, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface DynamicPublicEventMapProps {
  lat: number;
  lng: number;
  locationName: string;
}

// Use React.lazy to dynamically import the Leaflet component
const LazyPublicEventMapContent = React.lazy(() => import('./PublicEventMapContent'));

const DynamicPublicEventMap: React.FC<DynamicPublicEventMapProps> = (props) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // Ensure this runs only on the client side after mounting
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Placeholder while loading on the client side
    return (
      <div className="h-40 w-full flex items-center justify-center bg-gray-800 rounded-xl border border-purple-500/30 text-gray-400 mb-4">
        Térkép betöltése...
      </div>
    );
  }
  
  // Render the actual map component only on the client using Suspense
  return (
    <Suspense fallback={
      <div className="h-40 w-full flex items-center justify-center bg-gray-800 rounded-xl border border-purple-500/30 text-gray-400 mb-4">
        <Loader2 className="h-6 w-6 animate-spin text-purple-400 mr-2" />
        Térkép betöltése...
      </div>
    }>
      <LazyPublicEventMapContent {...props} />
    </Suspense>
  );
};

export default DynamicPublicEventMap;