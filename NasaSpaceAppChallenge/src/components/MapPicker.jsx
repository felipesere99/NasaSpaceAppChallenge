import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { useState } from "react";

export default function MapPicker({ onSelect }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [marker, setMarker] = useState(null);

  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <GoogleMap
      zoom={4}
      center={{ lat: -34.9, lng: -56.2 }}
      mapContainerStyle={{ height: "500px", width: "100%" }}
      onClick={(e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarker({ lat, lng });
        onSelect({ lat, lng });
      }}
    >
      {marker && <Marker position={marker} />}
    </GoogleMap>
  );
}