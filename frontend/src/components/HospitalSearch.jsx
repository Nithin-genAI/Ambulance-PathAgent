import { useState } from "react";
import { HOSPITALS_NEAR_SAMBHRAM } from "../config/mapConfig";

export default function HospitalSearch({ onSelect, selectedHospital, isDispatched }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = HOSPITALS_NEAR_SAMBHRAM.filter(h =>
    h.name.toLowerCase().includes(query.toLowerCase()) ||
    h.area.toLowerCase().includes(query.toLowerCase())
  );

  if (isDispatched) return null; // hide after dispatch

  return (
    <div style={{
      position: "absolute",
      top: 80,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 20,
      width: 380,
      fontFamily: "monospace",
    }}>
      {/* Search Bar */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          background: "rgba(0,0,0,0.92)",
          border: `2px solid ${selectedHospital ? "#00ff88" : "#333"}`,
          borderRadius: open ? "10px 10px 0 0" : 10,
          padding: "12px 18px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 12,
          backdropFilter: "blur(12px)",
        }}
      >
        <span style={{ fontSize: 18 }}>🏥</span>
        <input
          value={selectedHospital ? selectedHospital.name : query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onClick={e => { e.stopPropagation(); setOpen(true); }}
          placeholder="Search destination hospital..."
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: selectedHospital ? "#00ff88" : "#fff",
            fontSize: 14,
            flex: 1,
            fontFamily: "monospace",
          }}
        />
        {selectedHospital && (
          <span style={{ color: "#666", fontSize: 12 }}>✓</span>
        )}
        <span style={{ color: "#444", fontSize: 12 }}>
          {open ? "▲" : "▼"}
        </span>
      </div>

      {/* Dropdown Results */}
      {open && (
        <div style={{
          background: "rgba(0,0,0,0.96)",
          border: "2px solid #333",
          borderTop: "none",
          borderRadius: "0 0 10px 10px",
          backdropFilter: "blur(12px)",
          overflow: "hidden",
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "16px 18px", color: "#444", fontSize: 13 }}>
              No hospitals found
            </div>
          ) : filtered.map(h => (
            <div
              key={h.id}
              onClick={() => { onSelect(h); setOpen(false); setQuery(""); }}
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid #111",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#001a00"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {/* Hospital Name */}
              <div style={{
                color: "#00ff88",
                fontWeight: "bold",
                fontSize: 14,
                marginBottom: 4
              }}>
                🏥 {h.name}
              </div>

              {/* Area */}
              <div style={{ color: "#666", fontSize: 12, marginBottom: 6 }}>
                📍 {h.area}
              </div>

              {/* Tags */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {h.emergency && (
                  <span style={{
                    background: "#ff000020", border: "1px solid #ff4444",
                    color: "#ff4444", fontSize: 10, padding: "2px 8px", borderRadius: 4
                  }}>
                    24/7 EMERGENCY
                  </span>
                )}
                {h.specialties?.slice(0, 3).map(s => (
                  <span key={s} style={{
                    background: "#00ff8810", border: "1px solid #00ff8840",
                    color: "#00aa66", fontSize: 10, padding: "2px 8px", borderRadius: 4
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
