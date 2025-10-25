import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// Dinamikusan importáljuk a térkép komponenseket
const LazyLocationPicker = lazy(() => import('@/components/admin/LocationPicker'));
const LazyOrganizationMap = lazy(() => import('@/components/OrganizationMap'));

interface MapWrapperProps {
  type: 'picker' | 'organization';
  // LocationPicker props
  initialLat?: number | null;
  initialLng?: number | null;
  onLocationChange?: (lat: number | null, lng: number | null) => void;
  // OrganizationMap props
  organizationName?: string;
  logoUrl?: string | null;
}

const MapWrapper: React.FC<MapWrapperProps> = (props) => {
  const [isClient, setIsClient] = useState(false); // State to track client mount

  useEffect(() => {
    setIsClient(true); // Set to true once mounted on client
  }, []);

  const fallback = (
    <div className="flex items-center justify-center h-80 bg-gray-900 rounded-lg">
      <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      <p className="ml-3 text-gray-400">Térkép betöltése...</p>
    </div>
  );

  if (!isClient) {
    // Render fallback on initial (potentially problematic) render phase
    return fallback;
  }

  return (
    <Suspense fallback={fallback}>
      {props.type === 'picker' && props.onLocationChange ? (
        <LazyLocationPicker 
          initialLat={props.initialLat}
          initialLng={props.initialLng}
          onLocationChange={props.onLocationChange}
        />
      ) : props.type === 'organization' && props.organizationName ? (
        <LazyOrganizationMap 
          lat={props.initialLat || 46.0727} // Fallback to Pécs center if null
          lng={props.initialLng || 18.2322}
          organizationName={props.organizationName}
          logoUrl={props.logoUrl || null}
        />
      ) : (
        <div className="text-red-400 text-center h-80 flex items-center justify-center">
            Érvénytelen térkép konfiguráció.
        </div>
      )}
    </Suspense>
  );
};

export default MapWrapper;