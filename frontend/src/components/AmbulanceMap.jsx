import { useRef, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  Polyline,
  TrafficLayer,
} from "@react-google-maps/api";
import {
  MAP_OPTIONS,
  AMBULANCE_ICON_SVG,
  HOSPITAL_ICON_SVG,
} from "../config/mapConfig";

const MAP_CONTAINER = { width: "100%", height: "100vh" };

export default function AmbulanceMap({ position, polyline, destination, children }) {
  const mapRef = useRef(null);

  const lastDestinationId = useRef(null);
  const hasCenteredOnGPS = useRef(false);

  // 1. Center on initial GPS position once
  useEffect(() => {
    if (mapRef.current && position && !hasCenteredOnGPS.current && !destination) {
      mapRef.current.panTo(position);
      hasCenteredOnGPS.current = true;
    }
  }, [position, destination]);

  // 2. Fit bounds to show full A to B route when a new destination is picked
  useEffect(() => {
    if (mapRef.current && polyline.length > 0 && destination) {
      // Only fit bounds if we just loaded a NEW destination route
      if (lastDestinationId.current !== destination.id) {
        const bounds = new window.google.maps.LatLngBounds();
        polyline.forEach((p) => bounds.extend(p));
        mapRef.current.fitBounds(bounds, 80); // 80px padding
        lastDestinationId.current = destination.id;
      }
    }
  }, [polyline, destination]);

  const ambulanceIcon = {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(AMBULANCE_ICON_SVG),
    scaledSize: new window.google.maps.Size(52, 52),
    anchor: new window.google.maps.Point(26, 26),
  };

  const hospitalIcon = {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(HOSPITAL_ICON_SVG),
    scaledSize: new window.google.maps.Size(44, 44),
    anchor: new window.google.maps.Point(22, 44),
  };

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER}
      center={position}
      zoom={15}
      options={MAP_OPTIONS}
      onLoad={(map) => (mapRef.current = map)}
    >
      {/* Live Bengaluru traffic layer */}
      <TrafficLayer />

      {/* Ambulance — live position */}
      <Marker position={position} icon={ambulanceIcon} zIndex={100} />

      {/* Hospital — fixed destination */}
      {destination && (
        <Marker position={{ lat: destination.lat, lng: destination.lng }} icon={hospitalIcon} zIndex={90} />
      )}

      {/* Route — glow effect (wide dim + narrow bright) */}
      {polyline.length > 0 && (
        <>
          <Polyline
            path={polyline}
            options={{ strokeColor: "#00ff8828", strokeWeight: 14, strokeOpacity: 1 }}
          />
          <Polyline
            path={polyline}
            options={{ strokeColor: "#00ff88", strokeWeight: 4, strokeOpacity: 0.95 }}
          />
        </>
      )}

      {/* Phase 3: Junction markers passed as children */}
      {children}
    </GoogleMap>
  );
}
