import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix for default marker icon issue with Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface LocationPickerMapProps {
  initialLat?: number | null;
  initialLng?: number | null;
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

const LocationPickerMap: React.FC<LocationPickerMapProps> = ({ initialLat, initialLng, onLocationChange }) => {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );

  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition([initialLat, initialLng]);
    }
  }, [initialLat, initialLng]);

  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationChange(lat, lng);
  };

  const center = position || DEFAULT_CENTER;

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
        
        <MapClickHandler onLocationChange={handleMapClick} />

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

export default LocationPickerMap;