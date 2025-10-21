import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet'; // Standard import
import { MapPin } from 'lucide-react';

interface LocationPickerMapContentProps {
  position: [number, number] | null;
  onLocationChange: (lat: number, lng: number) => void;
}

// Default center for Pécs, Hungary
const DEFAULT_CENTER: [number, number] = [46.0727, 18.2322]; 

const MapClickHandler: React.FC<{ onLocationChange: (lat: number, lng: number) => void }> = ({ onLocationChange }) => {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const LocationPickerMapContent: React.FC<LocationPickerMapContentProps> = ({ position, onLocationChange }) => {
  const center = position || DEFAULT_CENTER;

  // Use useMemo to ensure Leaflet icon fix runs only once and only client-side
  useMemo(() => {
    // Fix for default marker icon issue with Webpack/Vite
    if (typeof window !== 'undefined' && L) {
      // L might be { default: L_object } in some Vite configurations.
      // We need to ensure we are using the actual Leaflet object.
      const Leaflet = (L as any).default || L;
      
      delete (Leaflet.Icon.Default.prototype as any)._getIconUrl;
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
    }
  }, []);

  // We must ensure that the L used in Marker/Popup is the correct one.
  // Since react-leaflet handles the L object internally for its components, 
  // we only need to worry about the icon fix.

  return (
    <div className="h-80 w-full rounded-xl overflow-hidden border border-purple-500/30 shadow-lg">
      <MapContainer 
        center={center} 
        zoom={position ? 15 : 13} 
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onLocationChange={onLocationChange} />

        {position && (
          <Marker position={position}>
            {/* Use the L object from the import for Popup */}
            <L.Popup>
              <div className="flex items-center font-semibold text-sm">
                <MapPin className="h-4 w-4 mr-1 text-purple-600" />
                Kiválasztott hely
              </div>
            </L.Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default LocationPickerMapContent;