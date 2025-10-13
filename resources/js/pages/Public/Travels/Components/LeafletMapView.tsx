import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 🧭 Gesture handling plugin
import "leaflet-gesture-handling";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";

// Register plugin
L.Map.addInitHook("addHandler", "gestureHandling", (L as any).GestureHandling);

export default function TouristMap({ destinationList }: any) {
    const [mapType, setMapType] = useState<"satellite" | "street">("street");
    const [selectedFind, setSelectedFind] = useState("");

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
        <div className="flex flex-col p-4 sm:p-8 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full mb-4">
                <a className="pb-3 pt-3 sm:pb-5 sm:pt-5 text-[24px] sm:text-[30px] text-black font-bold text-center sm:text-left">
                    Map Explorer
                </a>

                <div className="flex flex-col sm:flex-row sm:space-x-3 justify-end items-center w-full sm:w-auto">
                    <div className="bg-white/90 backdrop-blur-md rounded-md shadow-md p-2 w-full sm:w-fit mb-2 sm:mb-0">
                        <label className="text-sm font-medium text-gray-700 mr-2">
                            Find:
                        </label>
                        <select
                            value={selectedFind}
                            onChange={(e) => setSelectedFind(e.target.value)}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="resorts">Resorts</option>
                            <option value="gasoline_station">Gasoline Stations</option>
                            <option value="hotels">Hotels</option>
                            <option value="restaurant">Restaurant</option>
                        </select>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md rounded-md shadow-md p-2 w-full sm:w-fit">
                        <label className="text-sm font-medium text-gray-700 mr-2">
                            View Mode:
                        </label>
                        <select
                            value={mapType}
                            onChange={(e) => setMapType(e.target.value as any)}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="street">Street</option>
                            <option value="satellite">Satellite</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="relative w-full h-[400px] sm:h-[550px] md:h-[650px] z-10">
                <MapContainer
                    center={[13.254117982609364, 121.86766968796603]}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="w-full h-full rounded-[10px] shadow-lg"
                    maxZoom={18}
                    minZoom={11}
                    maxBounds={[
                        [12.90, 121.40],
                        [13.70, 122.35],
                    ]}
                    maxBoundsViscosity={0.7}
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
            </div>
        </div>
    );
}
