import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
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
    if (typeof window !== 'undefined') {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
    }
  }, []);

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