import { Marker, InfoWindow } from "@react-google-maps/api";
import { useState } from "react";

const JUNCTION_SVG = (alerted) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
    <circle cx="18" cy="18" r="16"
      fill="${alerted ? '#ff440030' : '#00ff8820'}"
      stroke="${alerted ? '#ff4444'  : '#00ff88'}"
      stroke-width="2"/>
    <text x="18" y="23" text-anchor="middle" font-size="14">
      ${alerted ? '⚡' : '🚦'}
    </text>
  </svg>`;

export default function JunctionOverlay({ junctions, alertLog }) {
  const [selected, setSelected] = useState(null);
  const alertedIds = new Set(alertLog.map(a => a.junction));

  return (
    <>
      {junctions.map((j) => {
        const alerted = alertedIds.has(j.name);
        return (
          <Marker
            key={j.id}
            position={{ lat: j.lat, lng: j.lng }}
            onClick={() => setSelected(j.id)}
            icon={{
              url: "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(JUNCTION_SVG(alerted)),
              scaledSize: new window.google.maps.Size(36, 36),
              anchor:     new window.google.maps.Point(18, 18),
            }}
            zIndex={alerted ? 80 : 50}
          />
        );
      })}

      {selected && (() => {
        const j = junctions.find(x => x.id === selected);
        const alerted = alertedIds.has(j?.name);
        return j ? (
          <InfoWindow
            position={{ lat: j.lat, lng: j.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div style={{ fontFamily: "monospace", fontSize: 13 }}>
              <b>{alerted ? "⚡ PREEMPTED" : "🚦 MONITORING"}</b><br />
              {j.name}
            </div>
          </InfoWindow>
        ) : null;
      })()}
    </>
  );
}
