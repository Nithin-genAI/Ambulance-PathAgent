// ─── Destination ─────────────────────────────────────────
export const DESTINATION = { lat: 12.9352, lng: 77.6869 };
export const DESTINATION_NAME = "Manipal Hospital, Whitefield";

// ─── Backend ─────────────────────────────────────────────
export const BACKEND_URL = "http://localhost:8000";

// ─── Map Options ─────────────────────────────────────────
export const MAP_OPTIONS = {
  disableDefaultUI:    false,
  zoomControl:         true,
  streetViewControl:   false,
  mapTypeControl:      false,
  fullscreenControl:   false,
  styles: [
    { elementType: "geometry",              stylers: [{ color: "#0f0f1a" }] },
    { elementType: "labels.text.fill",      stylers: [{ color: "#00ff88" }] },
    { elementType: "labels.text.stroke",    stylers: [{ color: "#000000" }] },
    { featureType: "road",                  elementType: "geometry",     stylers: [{ color: "#1a1a3e" }] },
    { featureType: "road.arterial",         elementType: "geometry",     stylers: [{ color: "#0f3460" }] },
    { featureType: "road.highway",          elementType: "geometry",     stylers: [{ color: "#16213e" }] },
    { featureType: "water",                 elementType: "geometry",     stylers: [{ color: "#000814" }] },
    { featureType: "poi",                   stylers: [{ visibility: "off" }] },
    { featureType: "transit",               stylers: [{ visibility: "off" }] },
    { featureType: "administrative.locality",
      elementType: "labels.text.fill",      stylers: [{ color: "#00ccff" }] },
  ],
};

// ─── Ambulance SVG Marker ─────────────────────────────────
export const AMBULANCE_ICON_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52">
    <circle cx="26" cy="26" r="24" fill="#ff0000" fill-opacity="0.15"
            stroke="#ff2222" stroke-width="2"/>
    <circle cx="26" cy="26" r="13" fill="#cc0000"/>
    <text x="26" y="32" text-anchor="middle" font-size="16">🚑</text>
  </svg>`;

// ─── Hospital SVG Marker ──────────────────────────────────
export const HOSPITAL_ICON_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
    <rect x="2" y="2" width="40" height="40" rx="8"
          fill="#cc0000" stroke="#ffffff" stroke-width="2"/>
    <text x="22" y="30" text-anchor="middle" font-size="22">🏥</text>
  </svg>`;

// ─── Hospitals Data ───────────────────────────────────────
export const HOSPITALS_NEAR_SAMBHRAM = [
  {
    id: "H1",
    name: "CANS Multi Speciality Hospital",
    area: "Gangamma Circle, MS Palya",
    lat: 13.0215,
    lng: 77.5781,
    beds: 100,
    emergency: true,
    specialties: ["OBG", "Cardiology", "Orthopedics"]
  },
  {
    id: "H2",
    name: "Columbia Asia Hospital",
    area: "Hebbal, Bengaluru",
    lat: 13.0456,
    lng: 77.5958,
    emergency: true,
    specialties: ["Trauma", "ICU", "General Surgery"]
  },
  {
    id: "H3",
    name: "Manipal Hospital",
    area: "Whitefield",
    lat: 12.9352,
    lng: 77.6869,
    emergency: true,
    specialties: ["Neurology", "Cardiology", "Trauma"]
  },
  {
    id: "H4",
    name: "Fortis Hospital",
    area: "Rajajinagar",
    lat: 12.9914,
    lng: 77.5516,
    emergency: true,
    specialties: ["Cardiac", "Oncology", "Orthopedics"]
  },
];
