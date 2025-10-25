import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

// Custom icon for better styling (defined outside, but relies on L which is imported)
const customIcon = new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div class="${cn('text-red-500')}"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M12 12V2"/><path d="M12 2a8 8 0 0 0-8 8c0 7 8 12 8 12s8-5 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});


interface LeafletMapProps {
  initialLat: number;
  initialLng: number;
  onLocationChange: (lat: number, lng: number) => void;
}

const MapEvents: React.FC<{ onLocationChange: (lat: number, lng: number) => void }> = ({ onLocationChange }) => {
    const map = useMapEvents({
        click: (e) => {
            onLocationChange(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};


const LeafletMap: React.FC<LeafletMapProps> = ({ initialLat, initialLng, onLocationChange }) => {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);

  // CRITICAL FIX: Move the icon fix logic into useEffect
  useEffect(() => {
    // Fix default marker icon issue with Webpack/Vite
    // This code must run only client-side after L is fully loaded
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []); // Run once on mount

  useEffect(() => {
    // Update local position state when initial props change (e.g., when profile loads)
    setPosition([initialLat, initialLng]);
  }, [initialLat, initialLng]);

  const handleMarkerDragEnd = useCallback((e: L.DragEndEvent) => {
    const newPos = e.target.getLatLng();
    setPosition([newPos.lat, newPos.lng]);
    onLocationChange(newPos.lat, newPos.lng);
  }, [onLocationChange]);
  
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationChange(lat, lng);
  }, [onLocationChange]);

  return (
    <MapContainer 
      center={position} 
      zoom={13} 
      scrollWheelZoom={true}
      className="h-96 w-full rounded-lg z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapEvents onLocationChange={handleMapClick} />

      <Marker 
        position={position} 
        draggable={true} 
        eventHandlers={{ dragend: handleMarkerDragEnd }}
        icon={customIcon}
      />
    </MapContainer>
  );
};

export default LeafletMap;