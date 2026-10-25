/* ==========================================================================
   Cholo Ghure Asssiii — Intelligent Routing Service (RoutingService.js)
   Conforms to TRD.md §4 & ImplementationPlan.md §2.4
   - Smart Driving Routes for regional stops (< 1000 km) via OSRM
   - Elegant Flight Arcs for inter-continental / long-distance stops (> 1000 km)
   ========================================================================== */

import { APP_CONSTANTS } from "../config/constants.js";

/**
 * Great-circle distance between two coordinates in kilometers (Haversine formula)
 */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates road driving route or intercontinental flight path across ordered waypoints
 * @param {Array<[number, number]>} waypoints Array of [latitude, longitude]
 */
export async function calculateRoute(waypoints) {
  if (!waypoints || waypoints.length < 2) {
    return null;
  }

  // Check if any consecutive waypoint leg exceeds 1,000 km (e.g. trans-continental Europe to India)
  let isFlight = false;
  let totalFlightKm = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const legDist = haversineKm(
      waypoints[i][0], waypoints[i][1],
      waypoints[i + 1][0], waypoints[i + 1][1]
    );
    totalFlightKm += legDist;
    if (legDist > 1000) {
      isFlight = true;
    }
  }

  // Intercontinental / Long-Distance: Generate smooth flight route
  if (isFlight) {
    const flightHours = Math.max(1, Math.round(totalFlightKm / 800));
    return {
      distanceMeters: Math.round(totalFlightKm * 1000),
      durationSeconds: flightHours * 3600,
      distanceKm: Math.round(totalFlightKm).toLocaleString(),
      durationMins: flightHours * 60,
      geoJsonGeometry: {
        type: "LineString",
        coordinates: waypoints.map(pt => [pt[1], pt[0]])
      },
      isFlight: true,
      isFallback: false
    };
  }

  // Regional stops: Query OSRM road driving engine
  const coordString = waypoints.map(pt => `${pt[1]},${pt[0]}`).join(";");
  const endpoint = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), APP_CONSTANTS.HTTP_TIMEOUT_MS);

  try {
    const res = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`OSRM HTTP error ${res.status}`);
    }

    const data = await res.json();
    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      throw new Error("No driving route found between selected waypoints.");
    }

    const primaryRoute = data.routes[0];
    return {
      distanceMeters: primaryRoute.distance,
      durationSeconds: primaryRoute.duration,
      distanceKm: (primaryRoute.distance / 1000).toFixed(1),
      durationMins: Math.round(primaryRoute.duration / 60),
      geoJsonGeometry: primaryRoute.geometry, // LineString GeoJSON
      isFlight: false,
      isFallback: false
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn("[RoutingService] OSRM route unavailable, generating geodesic fallback:", err);

    return {
      distanceMeters: Math.round(totalFlightKm * 1000),
      durationSeconds: 0,
      distanceKm: Math.round(totalFlightKm || 0).toLocaleString(),
      durationMins: 0,
      geoJsonGeometry: {
        type: "LineString",
        coordinates: waypoints.map(pt => [pt[1], pt[0]])
      },
      isFlight: false,
      isFallback: true
    };
  }
}
