export default function StatusBar({ isLive, lastUpdate, speed }) {
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      background: "rgba(0,0,0,0.88)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid #1a1a2e",
      padding: "14px 28px",
      fontFamily: "'Courier New', monospace",
    }}>
      {/* Left — Identity */}
      <div>
        <div style={{ fontSize: 11, color: "#444", letterSpacing: 3 }}>
          AMBULANCE AGENT
        </div>
        <div style={{ fontSize: 17, fontWeight: "bold", color: "#00ff88" }}>
          KA-01-AM-1234
        </div>
      </div>

      {/* Center — GPS Status */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "#444", letterSpacing: 2 }}>
          GPS STATUS
        </div>
        <div style={{
          fontSize: 14, fontWeight: "bold",
          color: isLive ? "#00ff88" : "#ff4444",
          animation: isLive ? "blink 2s infinite" : "blink 0.4s infinite",
        }}>
          {isLive ? "● LIVE GPS ACTIVE" : "● WAITING FOR GPS..."}
        </div>
        {lastUpdate && (
          <div style={{ fontSize: 10, color: "#333", marginTop: 2 }}>
            Last update: {lastUpdate}
          </div>
        )}
      </div>

      {/* Right — Speed */}
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 11, color: "#444", letterSpacing: 2 }}>
          SPEED
        </div>
        <div style={{ fontSize: 26, color: "#ffcc00", fontWeight: "bold", lineHeight: 1 }}>
          {speed}
          <span style={{ fontSize: 12, color: "#888", marginLeft: 4 }}>km/h</span>
        </div>
      </div>
    </div>
  );
}
