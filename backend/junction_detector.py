# junction_detector.py
# Extracts meaningful junction points from the route polyline.
# Combines: known Bengaluru major junctions + route waypoints.

from haversine import haversine, Unit

# ── Known major junctions on Bengaluru emergency corridors ────────
# These are pre-mapped. In production: pulled from OSM junction data.
KNOWN_JUNCTIONS = [
    {"id": "J01", "name": "Hebbal Flyover Junction",     "lat": 13.0358, "lng": 77.5972},
    {"id": "J02", "name": "Mekhri Circle",               "lat": 13.0036, "lng": 77.5764},
    {"id": "J03", "name": "Yeshwanthpur Junction",       "lat": 13.0275, "lng": 77.5511},
    {"id": "J04", "name": "Rajajinagar 4th Block",       "lat": 12.9914, "lng": 77.5516},
    {"id": "J05", "name": "Magadi Road Junction",        "lat": 12.9741, "lng": 77.5347},
    {"id": "J06", "name": "Silk Board Junction",         "lat": 12.9170, "lng": 77.6235},
    {"id": "J07", "name": "HSR Layout Junction",         "lat": 12.9116, "lng": 77.6441},
    {"id": "J08", "name": "Marathahalli Bridge",         "lat": 12.9591, "lng": 77.6974},
    {"id": "J09", "name": "Domlur Flyover",              "lat": 12.9608, "lng": 77.6463},
    {"id": "J10", "name": "HAL Junction",                "lat": 12.9653, "lng": 77.6648},
    {"id": "J11", "name": "Indiranagar 100ft Road",      "lat": 12.9784, "lng": 77.6408},
    {"id": "J12", "name": "KR Puram Junction",           "lat": 13.0050, "lng": 77.6934},
    {"id": "J13", "name": "Whitefield Main Junction",    "lat": 12.9698, "lng": 77.7499},
    {"id": "J14", "name": "Hoodi Junction",              "lat": 12.9831, "lng": 77.7150},
    {"id": "J15", "name": "ITPL Main Gate Junction",     "lat": 12.9859, "lng": 77.7272},
]


def get_junctions_on_route(polyline_points: list, max_distance_m: float = 300) -> list:
    """
    Filters KNOWN_JUNCTIONS to only those close to the actual route polyline.
    Returns junctions sorted by distance from route start.

    Logic:
    - For each known junction, find nearest polyline point
    - If nearest point < max_distance_m away → junction is ON this route
    - Sort by polyline index → gives ordered list from origin to destination
    """
    if not polyline_points:
        return KNOWN_JUNCTIONS[:4]  # fallback: return first 4

    junctions_on_route = []

    for junction in KNOWN_JUNCTIONS:
        j_lat, j_lng = junction["lat"], junction["lng"]
        min_dist = float("inf")
        nearest_idx = 0

        for idx, point in enumerate(polyline_points):
            dist = haversine(
                (j_lat, j_lng),
                (point["lat"], point["lng"]),
                unit=Unit.METERS
            )
            if dist < min_dist:
                min_dist = dist
                nearest_idx = idx

        if min_dist <= max_distance_m:
            junctions_on_route.append({
                **junction,
                "route_index": nearest_idx,
                "dist_from_route_m": round(min_dist, 1)
            })

    # Sort by position along route (origin → destination order)
    junctions_on_route.sort(key=lambda j: j["route_index"])

    return junctions_on_route
