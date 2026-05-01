import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config/mapConfig";

export function useAmbulanceGPS() {
  const [position,    setPosition]    = useState({ lat: 12.9716, lng: 77.5946 });
  const [speed,       setSpeed]       = useState(0);
  const [isLive,      setIsLive]      = useState(false);
  const [lastUpdate,  setLastUpdate]  = useState(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const { data } = await axios.get(`${BACKEND_URL}/location`);
        setPosition({ lat: data.lat, lng: data.lng });
        setSpeed(Math.round((data.speed || 0) * 3.6)); // m/s → km/h
        setIsLive(data.is_live || false);
        setLastUpdate(new Date().toLocaleTimeString());
      } catch (e) {
        console.warn("GPS poll failed:", e.message);
      }
    };

    poll(); // immediate first call
    const id = setInterval(poll, 1000);
    return () => clearInterval(id);
  }, []);

  return { position, speed, isLive, lastUpdate };
}
