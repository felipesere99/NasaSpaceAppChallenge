import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { useState } from "react";

export default function MapPicker({ onSelect }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [marker, setMarker] = useState(null);

  if (!isLoaded) return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '500px',
      color: 'var(--text-secondary)',
      fontSize: '1rem'
    }}>
      Loading map...
    </div>
  );

  const mapOptions = {
    zoom: 4,
    center: { lat: -34.9, lng: -56.2 },
    mapContainerStyle: { height: "500px", width: "100%" },
    onClick: (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const newMarker = { lat, lng };
      setMarker(newMarker);
      onSelect({ lat, lng });
    }
  };

  return (
    <GoogleMap
      zoom={mapOptions.zoom}
      center={mapOptions.center}
      mapContainerStyle={mapOptions.mapContainerStyle}
      onClick={mapOptions.onClick}
    >
      {marker && (
        <Marker 
          position={marker}
          title={`${marker.lat.toFixed(4)}°, ${marker.lng.toFixed(4)}°`}
        />
      )}
    </GoogleMap>
  );
}