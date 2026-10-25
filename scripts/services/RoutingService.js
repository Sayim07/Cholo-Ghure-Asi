/* ==========================================================================
   Cholo Ghure Asssiii — OSRM Routing Service (RoutingService.js)
   Conforms to TRD.md §4 & ImplementationPlan.md §2.4
   ========================================================================== */

import { APP_CONSTANTS } from "../config/constants.js";

/**
 * Calculates road driving route across multiple ordered waypoints
 * @param {Array<[number, number]>} waypoints Array of [latitude, longitude]
 */
export async function calculateRoute(waypoints) {
  if (!waypoints || waypoints.length < 2) {
    return null;
  }

  // OSRM expects: lon,lat;lon,lat;...
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
      isFallback: false
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn("[RoutingService] OSRM route unavailable, generating geodesic fallback:", err);

    // Fallback straight line between waypoints
    return {
      distanceMeters: 0,
      durationSeconds: 0,
      distanceKm: "Direct",
      durationMins: 0,
      geoJsonGeometry: {
        type: "LineString",
        coordinates: waypoints.map(pt => [pt[1], pt[0]])
      },
      isFallback: true
    };
  }
}
