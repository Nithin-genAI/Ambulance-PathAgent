import { useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config/mapConfig";

export default function DispatchPanel({ polyline, destination, onDispatched, onCancelled, isDispatched }) {
  const [loading, setLoading] = useState(false);

  const handleDispatch = async () => {
    if (!polyline || polyline.length === 0) {
      alert("Wait for route to load first!");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/dispatch`, {
        destination_lat: destination ? destination.lat : 12.9352,
        destination_lng: destination ? destination.lng : 77.6869,
        polyline: polyline,
      });
      onDispatched(res.data.junctions);
    } catch (e) {
      console.error("Dispatch failed:", e);
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    await axios.post(`${BACKEND_URL}/cancel`);
    onCancelled();
  };

  return (
    <div style={{
      position: "absolute",
      top: "50%",
      right: 24,
      transform: "translateY(-50%)",
      zIndex: 20,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      {!isDispatched ? (
        <button
          onClick={handleDispatch}
          disabled={loading || !polyline?.length}
          style={{
            background: loading ? "#333" : "linear-gradient(135deg, #cc0000, #ff2222)",
            color: "#fff",
            border: "2px solid #ff4444",
            borderRadius: 12,
            padding: "18px 28px",
            fontSize: 16,
            fontWeight: "bold",
            fontFamily: "monospace",
            letterSpacing: 2,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 0 30px #ff000060",
            transition: "all 0.3s",
            minWidth: 180,
          }}
        >
          {loading ? "⏳ STARTING..." : "🚨 DISPATCH"}
        </button>
      ) : (
        <>
          <div style={{
            background: "#001a00",
            border: "2px solid #00ff88",
            borderRadius: 12,
            padding: "14px 20px",
            fontFamily: "monospace",
            color: "#00ff88",
            fontSize: 13,
            textAlign: "center",
            boxShadow: "0 0 20px #00ff8830",
            animation: "dispatchPulse 2s ease-in-out infinite",
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>🧠</div>
            <div style={{ fontWeight: "bold", letterSpacing: 1 }}>ML ACTIVE</div>
            <div style={{ fontSize: 11, color: "#00cc66", marginTop: 4 }}>
              Monitoring junctions...
            </div>
          </div>

          <button
            onClick={handleCancel}
            style={{
              background: "transparent",
              color: "#666",
              border: "1px solid #333",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 12,
              fontFamily: "monospace",
              cursor: "pointer",
            }}
          >
            ✕ CANCEL
          </button>
        </>
      )}
    </div>
  );
}
