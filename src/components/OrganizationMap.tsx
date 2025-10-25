import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Building, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Fix for default Leaflet icons not loading in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface OrganizationMapProps {
  lat: number;
  lng: number;
  organizationName: string;
  logoUrl: string | null;
}

const OrganizationMap: React.FC<OrganizationMapProps> = ({ lat, lng, organizationName, logoUrl }) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const position: [number, number] = [lat, lng];
  const DEFAULT_ZOOM = 15;

  // Create a custom icon using the organization's logo
  const customIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="relative">
        <div class="absolute -inset-3 bg-cyan-400/30 rounded-full animate-ping"></div>
        <div class="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center border-4 border-cyan-400 relative z-10 shadow-lg shadow-cyan-400/30 overflow-hidden">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="w-full h-full object-cover" />` : `<svg class="h-6 w-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-1 0h-5M9 19h6m-6 0a2 2 0 00-2 2v1h10v-1a2 2 0 00-2-2H9z"></path></svg>`}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40], // Anchor the bottom center of the icon
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center text-gray-300">
        <MapPin className="h-4 w-4 mr-2 text-cyan-400" />
        <span className="font-semibold text-xl text-cyan-300">Helyszín</span>
      </div>
      
      <div className="relative h-96 w-full rounded-xl overflow-hidden border border-cyan-500/50 shadow-xl shadow-cyan-500/10">
        {!isMapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            </div>
        )}
        <MapContainer 
          center={position} 
          zoom={DEFAULT_ZOOM} 
          scrollWheelZoom={false} 
          className={cn("h-full w-full z-0", isMapLoaded ? 'opacity-100' : 'opacity-0')}
          whenReady={() => setIsMapLoaded(true)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={customIcon}>
            <Popup>
              <div className="font-bold text-gray-900">{organizationName}</div>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-sm"
              >
                Megnyitás Google Maps-ben
              </a>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default OrganizationMap;