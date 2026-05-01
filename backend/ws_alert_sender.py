# ws_alert_sender.py
# Sends preemption alert to Traffic Signal Agent via WebSocket.
# Non-blocking — uses asyncio so it never delays the GPS loop.

import asyncio
import json
import websockets
from datetime import datetime

# ── Team 2's laptop IP — update this ─────────────────────────────
TRAFFIC_AGENT_WS = "ws://TEAM2_IP:8001/ws"   # ← change this

async def send_preemption_alert(junction: dict, eta_seconds: float,
                                 speed_kmph: float, distance_m: float):
    """
    Sends a single preemption alert to the Traffic Signal Agent.
    If connection fails, logs warning — never crashes the main app.
    """
    alert = {
        "junction_id":          junction["id"],
        "junction_name":        junction["name"],
        "junction_lat":         junction["lat"],
        "junction_lng":         junction["lng"],
        "eta_seconds":          round(eta_seconds),
        "ambulance_speed_kmph": round(speed_kmph, 1),
        "distance_meters":      round(distance_m, 1),
        "timestamp":            datetime.now().isoformat(),
        "priority":             "CRITICAL"
    }

    try:
        async with websockets.connect(TRAFFIC_AGENT_WS, open_timeout=3) as ws:
            await ws.send(json.dumps(alert))
            response = await asyncio.wait_for(ws.recv(), timeout=3)
            print(f"✅ ALERT SENT → {junction['name']} | ETA: {round(eta_seconds)}s")
            print(f"   Traffic Agent responded: {response}")
            return True
    except Exception as e:
        print(f"⚠️  Alert failed for {junction['name']}: {e}")
        print(f"   (Traffic Agent may be offline — alert logged locally)")
        return False


def fire_alert(junction: dict, eta_seconds: float,
               speed_kmph: float, distance_m: float):
    """Synchronous wrapper — call this from async code via create_task."""
    asyncio.create_task(
        send_preemption_alert(junction, eta_seconds, speed_kmph, distance_m)
    )
