import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapCoordinatesProps {
  latitude?: number;
  longitude?: number;
}

// Helper to fix map rendering after dialog animation
function ResizeHandler() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [map]);
  return null;
}

export default function MapCoordinates({ latitude, longitude }: MapCoordinatesProps) {
  const [mapType] = useState<"satellite" | "street">("street");

  const mapTypes = {
    satellite:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    street: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  };

  const position: [number, number] = [latitude ?? 13.3, longitude ?? 121.87];

  // 📍 Custom location pin icon from assets
  const customIcon = L.icon({
    iconUrl: "/assets/location_pin.png", // ✅ relative to public folder
    iconSize: [40, 40], // adjust size as needed
    iconAnchor: [20, 40], // anchor bottom center
    popupAnchor: [0, -40],
  });

  return (
    <div className="relative h-64 w-full rounded-xl overflow-hidden z-0">
      <MapContainer
        center={position}
        zoom={17}
        dragging={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        boxZoom={false}
        keyboard={false}
        touchZoom={false}
        zoomControl={false}
        className="w-full h-full rounded-[10px] shadow-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> & OpenStreetMap contributors'
          url={mapTypes[mapType]}
        />
        <Marker position={position} icon={customIcon} />
        <ResizeHandler />
      </MapContainer>
    </div>
  );
}
