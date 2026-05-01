import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config/mapConfig";

export function useRoute(position, destination) {
  const [polyline, setPolyline] = useState([]);
  const [eta,      setEta]      = useState("Select hospital...");
  const [distance, setDistance] = useState("—");

  useEffect(() => {
    // Don't fetch if no destination selected
    if (!destination) return;

    const fetchRoute = async () => {
      try {
        const { data } = await axios.get(`${BACKEND_URL}/route`, {
          params: {
            dest_lat: destination.lat,
            dest_lng: destination.lng,
          }
        });
        if (data.polyline?.length > 0) {
          setPolyline(data.polyline);
          setEta(data.eta);
          setDistance(data.distance);
        }
      } catch (e) {
        console.warn("Route fetch failed:", e.message);
      }
    };

    // Fetch immediately when destination changes
    fetchRoute();
    const id = setInterval(fetchRoute, 15000);
    return () => clearInterval(id);

  }, [destination?.lat, destination?.lng, position]);

  return { polyline, eta, distance };
}
