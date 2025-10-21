import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix for default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface PublicEventMapProps {
  lat: number;
  lng: number;
  locationName: string;
}

const PublicEventMap: React.FC<PublicEventMapProps> = ({ lat, lng, locationName }) => {
  const position: [number, number] = [lat, lng];

  return (
    <div className="h-40 w-full rounded-xl overflow-hidden border border-purple-500/30 shadow-lg mb-4">
      <MapContainer 
        center={position} 
        zoom={15} 
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={position}>
          <L.Popup>
            <div className="flex items-center font-semibold text-sm">
              <MapPin className="h-4 w-4 mr-1 text-purple-600" />
              {locationName}
            </div>
          </L.Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default PublicEventMap;