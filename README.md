# 🚑 SmartPath — Emergency Vehicle Route Rationalization
### Theme: Smart Automation | 1st Prize — AI & DS Department Hackathon

---

## Problem Statement

> *"Dynamic route rationalization model based on machine learning/AI would be required based on real-time traffic and road parameters."*

In Bengaluru, ambulances routinely take **20–40 minutes** to travel 3–5 km during peak hours.
The **Golden Hour** — the first 60 minutes critical in emergencies — is lost in traffic.
Existing solutions only solve routing. **Nobody solves corridor clearance.**

---

## Our Solution

A two-agent agentic system where:
- The **Ambulance Agent** tracks live GPS, calculates optimal routes, and predicts arrival at each traffic junction using a trained ML model
- The **Traffic Signal Agent** receives real-time alerts and switches signals GREEN ahead of the ambulance — autonomously

> The ambulance doesn't wait for signals. The signals wait for the ambulance.

---

## System Architecture

```
📱 Phone GPS (Real)
        │  GPSLogger → HTTP POST every 1s
        ▼
🐍 Ambulance Agent Backend (FastAPI :8000)
        │
        ├──► Google Routes API ──► Real-time traffic-aware route
        │
        ├──► ML Proximity Predictor
        │         └── Watches every junction on route
        │         └── Predicts ETA using RL-trained model
        │         └── Fires alert at adaptive threshold
        │
        └──► WebSocket Alert ────────────────────────►  🚦 Traffic Agent (:8001)
                                                               │
                                                        Signal turns GREEN
                                                        Next junction → YELLOW
                                                        Dashboard updates live
```

---

## Two Agents — Clearly Split

### 🚑 Ambulance Agent
| Component | Technology | Purpose |
|---|---|---|
| Live GPS | Phone + HTTP POST | Real coordinates every second |
| Map Display | Google Maps JS API + React | Dark Bengaluru map, live ambulance dot |
| Routing | Google Directions API | Real traffic-aware route to hospital |
| ML Brain | Python — Q-Learning model | Predicts ETA per junction |
| Alert Sender | WebSocket (asyncio) | Fires preemption to Traffic Agent |
| Hospital Search | React dropdown | Search & select destination hospital |

### 🚦 Traffic Signal Agent
| Component | Technology | Purpose |
|---|---|---|
| Alert Receiver | FastAPI WebSocket | Listens for ambulance proximity |
| Signal Controller | Python state machine | RED → GREEN → auto reset |
| Green Wave | Cascade logic | Pre-alerts next junction too |
| Dashboard | React + CSS animations | Live junction grid with glowing signals |
| Route Timeline | React component | Horizontal progress of ambulance route |

---

## ML Model — Q-Learning Reinforcement Learning

### Algorithm: Q-Learning (Temporal Difference RL)

**State** → `(junction_id, hour_of_day, weather_condition)`
**Action** → Traffic multiplier bucket: `1.0x / 1.4x / 1.9x / 2.5x / 3.1x`
**Reward** → Accuracy of prediction vs real congestion factor
**Goal** → Learn optimal multiplier per state to predict ETA precisely

### Training Data
- **Source:** Bangalore City Traffic Dataset — Kaggle
- **Features used:** Area, Average Speed, Congestion Level, Weather, Incidents, Traffic Volume
- **Junctions covered:** Marathahalli, Silk Board, Hebbal, Indiranagar, Whitefield, KR Puram, HAL, Domlur
- **Episodes:** 1000

### Bellman Equation (Core Update Rule)
```
Q(s,a) ← Q(s,a) + α · [r + γ · max Q(s',a') − Q(s,a)]

α = 0.15  (learning rate)
γ = 0.85  (discount factor)
ε = 0.25  (exploration, decays to 0.05)
```

### Adaptive Alert Threshold (Key Innovation)
```
Fast ambulance (60 km/h) → tight alert window (30s before junction)
Slow ambulance (20 km/h) → earlier alert window (60s before junction)

Threshold = Signal_Switch_Time + (80 / speed)

Slower = more uncertainty = more buffer time needed
```

### What the Model Learned
| Junction | 6pm Weekday | 8am Weekday | 2am |
|---|---|---|---|
| Silk Board | 3.1x | 2.8x | 1.0x |
| Marathahalli Bridge | 3.0x | 2.7x | 1.0x |
| Hebbal Flyover | 2.9x | 2.5x | 1.0x |
| Whitefield Main | 2.8x | 2.4x | 1.0x |

---

## Real vs Simulated

| Component | Status | Reason |
|---|---|---|
| Phone GPS coordinates | ✅ Real | Browser geolocation via `/gps-sender` HTML page |
| Google Maps traffic layer | ✅ Real | Live Bengaluru traffic shown |
| Route calculation | ✅ Real | Google Directions API with `traffic_model: best_guess` |
| ML model inference | ✅ Real | Trained Q-table loaded from `traffic_model.json` |
| Signal hardware response | 🎭 Simulated | BBMP doesn't expose public signal APIs yet |

> *"Our system is built to plug into BBMP signal hardware the moment the API is available."*

---

## Demo Flow

```
1. Ambulance Agent opens → dark Bengaluru map loads
2. Search "CANS Hospital" → route draws to Gangamma Circle
3. Traffic Dashboard → 4 junctions appear (MS Palya, Gangamma Circle,
                        Fathima Church, BEL Junction) — all RED
4. Hit DISPATCH → ML monitoring loop starts
5. 5 seconds → MS Palya turns GREEN ⚡ on dashboard
              Gangamma Circle turns YELLOW (incoming)
6. Ambulance progresses → each junction cascades GREEN in sequence
7. Dashboard alert log fills live with ETA, speed, junction name
8. Ambulance arrives → all junctions show ✅ DONE
```

---

## Tech Stack

```
Backend  : Python — FastAPI, Uvicorn, WebSockets, Haversine, Pandas, NumPy
Frontend : React (Vite), @react-google-maps/api, Axios, Socket.io
ML       : Q-Learning (pure Python, no framework dependency)
Data     : Kaggle — Bangalore City Traffic Dataset
Maps     : Google Maps JS API, Directions API, Routes API, TrafficLayer
GPS      : Browser Geolocation API → HTTP POST to FastAPI
Comms    : WebSocket (asyncio) — real-time bidirectional agentic messaging
```

---

## Project Structure

```
ambulance-agent/
├── backend/
│   ├── main.py                    # FastAPI server, GPS receiver, /route, /dispatch
│   ├── ml_predictor.py            # Q-Learning inference engine
│   ├── junction_detector.py       # Extracts junctions from route polyline
│   ├── ws_alert_sender.py         # WebSocket alert to Traffic Agent
│   ├── rl_trainer.py              # Q-Learning training script
│   ├── traffic_model.json         # Trained model output
│   └── Banglore_traffic_Dataset.csv  # Kaggle training data
└── frontend/src/
    ├── config/mapConfig.js        # Constants, hospital list, junctions
    ├── hooks/useAmbulanceGPS.js   # Live GPS polling
    ├── hooks/useRoute.js          # Dynamic route fetching
    ├── hooks/useAlerts.js         # Alert log polling
    └── components/
        ├── AmbulanceMap.jsx       # Google Map + markers + polyline
        ├── StatusBar.jsx          # GPS status + speed
        ├── ETACard.jsx            # Destination + ETA
        ├── DispatchPanel.jsx      # Dispatch button + ML status
        ├── HospitalSearch.jsx     # Search dropdown
        └── JunctionOverlay.jsx    # Junction markers on map

traffic-agent/
├── backend/
│   └── main.py                    # WebSocket server, signal state machine
└── frontend/src/
    ├── components/
    │   ├── JunctionGrid.jsx       # Dynamic signal cards
    │   └── RouteTimeline.jsx      # Horizontal route progress
    └── App.jsx                    # Dashboard root
```

---

## India-Specific Challenges Addressed

| Challenge | Our Approach |
|---|---|
| No BBMP signal API | Simulated layer, architecture ready to plug in |
| Connectivity gaps | Fallback: last known GPS + speed extrapolation |
| Mixed traffic unpredictability | Adaptive ML threshold — not fixed ETA window |
| No real-time incident data | Kaggle dataset includes incident count feature |
| Peak hour volatility | Hour-of-day × junction-specific multipliers from RL |

---

## Impact

```
Current reality   : Ambulance stuck 20-40 min in 3-5 km Bengaluru traffic
With SmartPath    : Corridor cleared before ambulance arrives
Time saved        : Estimated 8-15 minutes per emergency call
Lives saved       : Golden Hour preserved
Scale             : Works for ambulance, fire, police, VIP convoys
```

---

## Future Roadmap

```
Phase 2 → Integrate with actual SCATS/UTMC traffic signal hardware
Phase 3 → Multi-agency dashboard (ambulance + police + fire — one view)
Phase 4 → Retrain RL model weekly on live fleet GPS traces
Phase 5 → Civilian corridor clearance (push notification to nearby drivers)
Phase 6 → SIH submission + BBMP Smart City pilot proposal
```

---

Result

🏆 1st Prize — AI & DS Department Hackathon

Built in under 4 hours using real GPS, real traffic data, real ML, and a genuine belief that technology should save lives.

Built with 💚 for Bengaluru. For every minute that matters.




