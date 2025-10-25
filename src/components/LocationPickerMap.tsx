import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { showError } from '@/utils/toast';

// Fix for default marker icon issue in Leaflet with Webpack/Vite
// This is necessary because Vite/Webpack doesn't handle Leaflet's default icon paths correctly.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface LocationPickerMapProps {
  initialLocation: { lat: number | null; lng: number | null; address: string | null };
  onChange: (location: Location) => void;
}

// Default center for Pécs, Hungary
const DEFAULT_CENTER: [number, number] = [46.071, 18.233]; 

// Reverse Geocoding using Nominatim (OpenStreetMap)
const reverseGeocode = async (coords: [number, number], callback: (location: Location) => void) => {
  const [lat, lng] = coords;
  try {
    // Use Nominatim reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();

    let address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    
    // Attempt to format a cleaner address
    if (data.address) {
        const parts = [
            data.address.road,
            data.address.house_number,
            data.address.city || data.address.town || data.address.village,
            data.address.postcode,
            data.address.country
        ].filter(p => p);
        
        address = parts.join(', ');
    }

    callback({ lat, lng, address });
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    // Fallback to coordinates if geocoding fails
    callback({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
  }
};

// Component to handle map interactions (clicks)
const MapEventsHandler: React.FC<{ 
    markerPos: [number, number]; 
    setMarkerPos: React.Dispatch<React.SetStateAction<[number, number]>>;
    onChange: (location: Location) => void;
}> = ({ markerPos, setMarkerPos, onChange }) => {
  
  const map = useMapEvents({
    click: (e) => {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setMarkerPos(newPos);
      reverseGeocode(newPos, onChange);
    },
  });
  
  // Effect to ensure the map centers on the marker if it's updated externally or initially set
  useEffect(() => {
    map.setView(markerPos, map.getZoom() < 13 ? 13 : map.getZoom());
  }, [markerPos, map]);

  return <Marker position={markerPos} />;
};


const LocationPickerMap: React.FC<LocationPickerMapProps> = ({ initialLocation, onChange }) => {
  const initialLat = initialLocation.lat || DEFAULT_CENTER[0];
  const initialLng = initialLocation.lng || DEFAULT_CENTER[1];
  
  const [markerPos, setMarkerPos] = useState<[number, number]>([initialLat, initialLng]);

  // If initial location is provided but address is missing, fetch the address once on load
  useEffect(() => {
    if (initialLocation.lat && initialLocation.lng && initialLocation.address === null) {
        reverseGeocode([initialLat, initialLng], onChange);
    }
  }, [initialLocation.lat, initialLocation.lng, initialLocation.address, initialLat, initialLng, onChange]);
  
  // Sync internal marker position if external initialLocation changes (e.g., when profile loads)
  useEffect(() => {
      setMarkerPos([initialLat, initialLng]);
  }, [initialLat, initialLng]);


  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-700/50">
      <MapContainer 
        center={markerPos} 
        zoom={initialLocation.lat ? 15 : 13} // Zoom in if a location is already set
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ backgroundColor: '#1f2937' }} // Dark background for map container
      >
        <TileLayer
          // Using a dark theme tile layer for better integration with the app's dark mode
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />
        <MapEventsHandler 
            markerPos={markerPos} 
            setMarkerPos={setMarkerPos} 
            onChange={onChange}
        />
      </MapContainer>
    </div>
  );
};

export default LocationPickerMap;