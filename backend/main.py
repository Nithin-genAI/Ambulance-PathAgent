# backend/main.py — Ambulance Agent Phase 1 + 2 + 3
# Receives live GPS from GPSLogger app → serves to frontend map
# Phase 2: /route endpoint calls Google Directions API
# Phase 3: ML Proximity Predictor + Dispatch + WebSocket alerts

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from datetime import datetime
from ml_predictor import predictor
from junction_detector import get_junctions_on_route
from ws_alert_sender import fire_alert
import asyncio
import uvicorn
import requests
import os

load_dotenv()

app = FastAPI(title="Ambulance Agent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Serve GPS Sender page for phone browser ─────────────────────────────────
@app.get("/gps-sender")
def gps_sender_page():
    """Open this URL on your phone browser to send GPS to backend."""
    return FileResponse(
        os.path.join(os.path.dirname(__file__), "gps_sender.html"),
        media_type="text/html"
    )


# ─── In-memory GPS store (latest position from phone) ────────────────────────
latest_gps = {
    "lat": 12.9716,       # Default: Bengaluru center
    "lng": 77.5946,
    "speed": 0.0,
    "accuracy": 0.0,
    "timestamp": None,
    "is_live": False       # False = default position, True = real GPS coming in
}

# ─── Phase 3: Dispatch state ─────────────────────────────────────────────────
dispatch_active   = False          # True when ambulance is on mission
route_polyline    = []             # Current route polyline points
route_junctions   = []             # Junctions detected on route
alerted_junctions = set()          # Track which ones already alerted
alert_log         = []             # Full alert history

# ─── Data Models ──────────────────────────────────────────────────────────────
class GPSData(BaseModel):
    lat: float
    lng: float
    speed: float = 0.0
    accuracy: float = 0.0

class DispatchRequest(BaseModel):
    destination_lat: float = 12.9352
    destination_lng: float = 77.6869
    polyline: list = []


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.post("/gps")
async def receive_gps(data: GPSData):
    """
    GPSLogger on your phone calls this every second.
    URL format: http://<your-laptop-ip>:8000/gps
    Body: {"lat": %LAT, "lng": %LON, "speed": %SPD, "accuracy": %ACC}
    """
    global latest_gps
    latest_gps.update({
        "lat": data.lat,
        "lng": data.lng,
        "speed": round(data.speed, 2),
        "accuracy": round(data.accuracy, 2),
        "timestamp": datetime.utcnow().isoformat(),
        "is_live": True
    })
    print(f"📍 GPS Update → lat: {data.lat:.6f}, lng: {data.lng:.6f} | "
          f"Speed: {data.speed:.1f} m/s | Accuracy: {data.accuracy:.1f}m")
    return {"status": "ok", "received": latest_gps}


@app.get("/location")
def get_location():
    """
    Frontend polls this endpoint to get the latest ambulance position.
    Returns current GPS coords + metadata.
    """
    return latest_gps


# ─── Polyline Decoder ─────────────────────────────────────────────────────────
def decode_polyline(encoded):
    """Decode Google's encoded polyline string into list of {lat, lng} dicts."""
    points, index, lat, lng = [], 0, 0, 0
    while index < len(encoded):
        for is_lng in [False, True]:
            shift, result = 0, 0
            while True:
                b = ord(encoded[index]) - 63
                index += 1
                result |= (b & 0x1F) << shift
                shift += 5
                if b < 0x20:
                    break
            value = ~(result >> 1) if result & 1 else result >> 1
            if is_lng:
                lng += value
                points.append({"lat": lat / 1e5, "lng": lng / 1e5})
            else:
                lat += value
    return points


@app.get("/route")
def get_route(dest_lat: float = 12.9352, dest_lng: float = 77.6869):
    """
    Now accepts dynamic destination from frontend.
    Default: Manipal Hospital Whitefield.
    """
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    origin  = f"{latest_gps['lat']},{latest_gps['lng']}"
    dest    = f"{dest_lat},{dest_lng}"

    try:
        res = requests.get(
            "https://maps.googleapis.com/maps/api/directions/json",
            params={
                "origin":         origin,
                "destination":    dest,
                "mode":           "driving",
                "departure_time": "now",
                "traffic_model":  "best_guess",
                "key":            api_key,
            }
        )
        data = res.json()

        if data["status"] != "OK":
            return {"error": data["status"], "polyline": [], "eta": "N/A", "distance": "N/A"}

        route = data["routes"][0]
        leg   = route["legs"][0]

        polyline_points = decode_polyline(route["overview_polyline"]["points"])

        return {
            "polyline": polyline_points,
            "eta":      leg.get("duration_in_traffic", leg["duration"])["text"],
            "distance": leg["distance"]["text"],
            "status":   "ok"
        }

    except Exception as e:
        return {"error": str(e), "polyline": [], "eta": "N/A", "distance": "N/A"}


# ─── Phase 3: Dispatch + ML Monitoring ────────────────────────────────────────

@app.post("/dispatch")
async def dispatch(req: DispatchRequest):
    """
    Called when driver hits DISPATCH button.
    Stores the route polyline and starts ML monitoring loop.
    """
    global dispatch_active, route_polyline, route_junctions, alerted_junctions

    dispatch_active   = True
    route_polyline    = req.polyline
    alerted_junctions = set()

    # Detect which known junctions lie on this specific route
    route_junctions = get_junctions_on_route(req.polyline)

    print(f"\n🚨 DISPATCH ACTIVATED")
    print(f"   Route has {len(route_junctions)} junctions to monitor:")
    for j in route_junctions:
        print(f"   → {j['name']}")

    # Start the ML monitoring loop as a background task
    asyncio.create_task(ml_monitoring_loop())

    return {
        "status":     "dispatched",
        "junctions":  route_junctions,
        "monitoring": True
    }


@app.post("/cancel")
async def cancel_dispatch():
    """Cancel the active dispatch and stop ML monitoring."""
    global dispatch_active
    dispatch_active = False
    return {"status": "cancelled"}


@app.get("/alerts")
def get_alerts():
    """Returns current alert log and monitored junctions."""
    return {"alerts": alert_log, "junctions": route_junctions}


async def ml_monitoring_loop():
    """
    THE ML MONITORING LOOP — runs every 2 seconds while dispatch is active.
    For each junction on route:
      1. Predict ETA using ML model
      2. If should_fire_alert → send WebSocket to Traffic Agent
      3. Log the event
    """
    global dispatch_active, alerted_junctions, alert_log

    print("\n🧠 ML Monitoring Loop Started")

    while dispatch_active:
        gps   = latest_gps
        speed = gps.get("speed", 0)

        for junction in route_junctions:
            j_id = junction["id"]

            # Skip already-alerted junctions
            if j_id in alerted_junctions:
                continue

            # ── ML PREDICTION ──────────────────────────────────
            distance_m, eta_sec = predictor.predict_eta_seconds(
                ambulance_lat = gps["lat"],
                ambulance_lng = gps["lng"],
                junction_id   = j_id,
                junction_lat  = junction["lat"],
                junction_lng  = junction["lng"],
                speed_mps     = speed,
            )

            # ── DECISION ───────────────────────────────────────
            if predictor.should_fire_alert(distance_m, eta_sec, speed):
                alerted_junctions.add(j_id)

                speed_kmph = speed * 3.6
                print(f"\n⚡ ML ALERT TRIGGERED: {junction['name']}")
                print(f"   Distance: {distance_m}m | ETA: {eta_sec}s | Speed: {speed_kmph:.1f} km/h")

                # Send to Traffic Signal Agent
                fire_alert(junction, eta_sec, speed_kmph, distance_m)

                # Log it
                alert_log.insert(0, {
                    "time":          datetime.now().strftime("%H:%M:%S"),
                    "junction":      junction["name"],
                    "eta_sec":       round(eta_sec),
                    "distance_m":    round(distance_m),
                    "speed_kmph":    round(speed_kmph, 1),
                    "status":        "ALERT SENT"
                })

        await asyncio.sleep(2)  # check every 2 seconds

    print("🛑 ML Monitoring Loop Stopped")


@app.get("/health")
def health():
    """Health check — confirms backend is running."""
    return {
        "status": "ambulance agent running",
        "gps_live": latest_gps["is_live"],
        "dispatch_active": dispatch_active,
        "api_key_set": bool(os.getenv("GOOGLE_MAPS_API_KEY") and 
                            os.getenv("GOOGLE_MAPS_API_KEY") != "your_key_here")
    }


# ─── Entry Point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n🚑 Ambulance Agent Backend Starting...")
    print("📡 Listening for GPS on: POST /gps")
    print("🗺️  Location endpoint:    GET  /location")
    print("🛣️  Route endpoint:       GET  /route")
    print("🚨 Dispatch endpoint:     POST /dispatch")
    print("🧠 Alerts endpoint:       GET  /alerts")
    print("✅ Health check:          GET  /health\n")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
