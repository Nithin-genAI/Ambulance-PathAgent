import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config/mapConfig";

export function useAlerts(isDispatched) {
  const [alerts,    setAlerts]    = useState([]);
  const [junctions, setJunctions] = useState([]);

  useEffect(() => {
    if (!isDispatched) return;

    const poll = async () => {
      try {
        const { data } = await axios.get(`${BACKEND_URL}/alerts`);
        setAlerts(data.alerts   || []);
        setJunctions(data.junctions || []);
      } catch (e) {
        console.warn("Alert poll failed");
      }
    };

    poll();
    const id = setInterval(poll, 2000);
    return () => clearInterval(id);
  }, [isDispatched]);

  return { alerts, junctions };
}
