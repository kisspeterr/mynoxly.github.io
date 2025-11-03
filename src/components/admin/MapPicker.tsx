import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showError } from '@/utils/toast';

interface MapPickerProps {
  initialPosition: [number, number] | null;
  onPositionChange: (lat: number, lng: number) => void;
}

// Pécs központjának koordinátái
const PECS_CENTER: [number, number] = [46.0727, 18.2322];
const INITIAL_ZOOM = 14;

// Custom icon for the marker
const customIcon = L.divIcon({
  className: 'custom-map-marker',
  html: `<div class="relative"><div class="absolute -top-10 -left-5"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#f43f5e" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin-fill"><path d="M18.4 14.4a1.2 1.2 0 0 0-.2-.2l-4.6-4.6a1.2 1.2 0 0 0-1.7 0L7.8 14.2a1.2 1.2 0 0 0-.2.2c-.5.5-1.2 1.2-1.2 2.2 0 1.7 1.3 3 3 3h6c1.7 0 3-1.3 3-3 0-1-.7-1.7-1.2-2.2z"/><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"/></svg></div></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Component to handle map clicks and marker movement
const MapEvents: React.FC<{ setMarkerPosition: React.Dispatch<React.SetStateAction<[number, number]>>, onPositionChange: (lat: number, lng: number) => void }> = ({ setMarkerPosition, onPositionChange }) => {
  useMapEvents({
    click(e) {
      setMarkerPosition([e.latlng.lat, e.latlng.lng]);
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const MapPicker: React.FC<MapPickerProps> = ({ initialPosition, onPositionChange }) => {
  const [markerPosition, setMarkerPosition] = useState<[number, number]>(initialPosition || PECS_CENTER);
  
  // Memoize the center position to prevent unnecessary re-renders of MapContainer
  const center = useMemo(() => initialPosition || PECS_CENTER, [initialPosition]);

  useEffect(() => {
    if (initialPosition) {
      setMarkerPosition(initialPosition);
    }
  }, [initialPosition]);
  
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos: [number, number] = [position.coords.latitude, position.coords.longitude];
          setMarkerPosition(newPos);
          onPositionChange(newPos[0], newPos[1]);
          // Note: We cannot directly access the map instance here to fly to the location, 
          // but the marker position is updated.
        },
        (error) => {
          showError('Helymeghatározás sikertelen: ' + error.message);
        }
      );
    } else {
      showError('A böngésző nem támogatja a helymeghatározást.');
    }
  };

  return (
    <div className="relative w-full h-80 rounded-lg overflow-hidden border border-purple-500/30">
      <MapContainer 
        center={center} 
        zoom={INITIAL_ZOOM} 
        scrollWheelZoom={true} 
        className="w-full h-full z-0"
        key={JSON.stringify(center)} // Force remount if center changes significantly
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEvents setMarkerPosition={setMarkerPosition} onPositionChange={onPositionChange} />
        
        <Marker position={markerPosition} icon={customIcon} />
      </MapContainer>
      
      <div className="absolute top-3 left-3 z-[400]">
        <Button 
          onClick={handleLocateMe}
          variant="default"
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-md"
        >
          <LocateFixed className="h-4 w-4 mr-2" />
          Helyem
        </Button>
      </div>
      
      <div className="absolute bottom-3 right-3 z-[400] bg-black/70 text-white text-xs p-2 rounded-lg shadow-lg">
        Lat: {markerPosition[0].toFixed(4)}, Lng: {markerPosition[1].toFixed(4)}
      </div>
    </div>
  );
};

export default MapPicker;