import { useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import AmbulanceMap    from "./components/AmbulanceMap";
import StatusBar       from "./components/StatusBar";
import ETACard         from "./components/ETACard";
import DispatchPanel   from "./components/DispatchPanel";
import JunctionOverlay from "./components/JunctionOverlay";
import HospitalSearch  from "./components/HospitalSearch";
import { useAmbulanceGPS } from "./hooks/useAmbulanceGPS";
import { useRoute }        from "./hooks/useRoute";
import { useAlerts }       from "./hooks/useAlerts";

const LIBRARIES = ["places"];

export default function App() {
  const [isDispatched, setIsDispatched] = useState(false);
  const [junctions,    setJunctions]    = useState([]);
  const [destination,  setDestination]  = useState(null);

  // Load Google Maps JS SDK (frontend key — map rendering only)
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  // Custom hooks
  const { position, speed, isLive, lastUpdate } = useAmbulanceGPS();
  const { polyline, eta, distance }             = useRoute(position, destination);
  const { alerts, junctions: mlJunctions }      = useAlerts(isDispatched);

  // Loading screen
  if (!isLoaded) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#050505",
        fontFamily: "monospace", color: "#00ff88",
      }}>
        <div style={{ fontSize: 52 }}>🚑</div>
        <div style={{ marginTop: 16, fontSize: 14, letterSpacing: 2 }}>
          LOADING AMBULANCE AGENT...
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>

      {/* Animations */}
      <style>{`
        @keyframes blink         { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes dispatchPulse { 0%,100%{box-shadow:0 0 20px #00ff8830} 50%{box-shadow:0 0 40px #00ff8870} }
      `}</style>

      {/* Map — full screen base layer */}
      <AmbulanceMap position={position} polyline={polyline} destination={destination}>
        {/* Phase 3: Junction markers on map */}
        {isDispatched && (
          <JunctionOverlay
            junctions={mlJunctions.length ? mlJunctions : junctions}
            alertLog={alerts}
          />
        )}
      </AmbulanceMap>

      {/* UI overlays */}
      <StatusBar isLive={isLive} lastUpdate={lastUpdate} speed={speed} />
      <ETACard   
        eta={eta} 
        distance={distance} 
        destinationName={destination?.name || "Select a hospital"} 
      />

      <HospitalSearch
        selectedHospital={destination}
        onSelect={(hospital) => setDestination(hospital)}
        isDispatched={isDispatched}
      />

      {/* Phase 3: Dispatch button */}
      <DispatchPanel
        polyline={polyline}
        destination={destination}
        isDispatched={isDispatched}
        onDispatched={(j) => { setIsDispatched(true); setJunctions(j); }}
        onCancelled={() => { setIsDispatched(false); setDestination(null); }}
      />

      {/* Phase 3: Alert log — bottom left */}
      {isDispatched && alerts.length > 0 && (
        <div style={{
          position: "absolute", bottom: 100, left: 24, zIndex: 20,
          fontFamily: "monospace", maxWidth: 360,
        }}>
          <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, marginBottom: 6 }}>
            ML PREEMPTION LOG
          </div>
          {alerts.slice(0, 4).map((a, i) => (
            <div key={i} style={{
              background: "rgba(0,0,0,0.88)",
              border: "1px solid #00ff88",
              borderRadius: 6,
              padding: "8px 14px",
              marginBottom: 4,
              fontSize: 12,
              color: "#00ff88",
              display: "flex",
              gap: 12,
            }}>
              <span style={{ color: "#444" }}>{a.time}</span>
              <span style={{ flex: 1 }}>⚡ {a.junction}</span>
              <span style={{ color: "#ffcc00" }}>ETA {a.eta_sec}s</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
