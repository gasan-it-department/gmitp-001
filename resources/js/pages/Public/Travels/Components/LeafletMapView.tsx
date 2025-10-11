import React, { useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMapEvent,
    useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default function TouristMap({ destinationList }: any) {
    const [mapType, setMapType] = useState<"satellite" | "street">("street");

    const mapTypes = {
        satellite:
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        street: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    };

    function createTouristIcon(image: string, name: string) {
        return L.divIcon({
            className: "custom-tourist-popup-icon",
            html: `
        <div class="popup-marker">
          <div class="popup-card">
            <img src="${image}" alt="${name}" class="popup-image" />
            <div class="popup-info">
              <h4 class="popup-title">${name}</h4>
            </div>
          </div>
          <div class="popup-pointer"></div>
        </div>
      `,
            iconSize: [160, 140],
            iconAnchor: [80, 140],
            popupAnchor: [0, -140],
        });
    }

    return (
        <div className="relative w-full h-[650px] p-8">
            {/* Map type selector */}
            <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md rounded-md shadow-md p-2">
                <label className="text-sm font-medium text-gray-700 mr-2">
                    Map Type:
                </label>
                <select
                    value={mapType}
                    onChange={(e) => setMapType(e.target.value as any)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    <option value="street">Street</option>
                    <option value="satellite">Satellite</option>
                </select>
            </div>


            {/* Map container */}
            <MapContainer
                center={[13.254117982609364, 121.86766968796603]}
                zoom={17}
                scrollWheelZoom={true}
                className="w-full h-full rounded-[10px]"
            >

                <TileLayer
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a> & OpenStreetMap contributors'
                    url={mapTypes[mapType]}
                />

                {destinationList.map((dest: any) => (
                    <Marker
                        key={dest.id}
                        position={dest.position}
                        icon={createTouristIcon(dest.image, dest.name)}
                    >
                        <Popup>
                            <div className="text-center w-[220px]">
                                <h3 className="font-semibold text-sm mb-1">{dest.name}</h3>
                                <img
                                    src={dest.image}
                                    alt={dest.name}
                                    className="w-full h-[120px] object-cover rounded-md shadow-md mb-1"
                                />
                                <p className="text-xs text-gray-700">{dest.description}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Hint text */}
            <div className="absolute bottom-4 left-4 bg-white/80 rounded-md p-1 px-2 text-xs shadow">
                Hold <kbd className="px-1 bg-gray-200 rounded">Shift</kbd> + Scroll to zoom
            </div>
        </div>
    );
}
