export default function ETACard({ eta, distance, destinationName }) {
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      background: "rgba(0,0,0,0.92)",
      backdropFilter: "blur(12px)",
      borderTop: "2px solid #00ff88",
      padding: "18px 28px",
      fontFamily: "'Courier New', monospace",
    }}>
      {/* Destination */}
      <div>
        <div style={{ fontSize: 11, color: "#444", letterSpacing: 2 }}>
          DESTINATION
        </div>
        <div style={{ fontSize: 14, color: "#ffffff", marginTop: 2 }}>
          {destinationName}
        </div>
      </div>

      {/* Distance */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "#444", letterSpacing: 2 }}>
          DISTANCE
        </div>
        <div style={{ fontSize: 22, color: "#00ccff", fontWeight: "bold" }}>
          {distance}
        </div>
      </div>

      {/* ETA */}
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 11, color: "#444", letterSpacing: 2 }}>
          ETA WITH TRAFFIC
        </div>
        <div style={{ fontSize: 26, color: "#ff4444", fontWeight: "bold", lineHeight: 1 }}>
          {eta}
        </div>
      </div>
    </div>
  );
}
