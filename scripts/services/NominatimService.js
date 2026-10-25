/* ==========================================================================
   Cholo Ghure Asssiii — Nominatim Geocoding Service (NominatimService.js)
   Conforms to TRD.md §4 & Schema.md §4.1
   ========================================================================== */

import { APP_CONSTANTS } from "../config/constants.js";

let lastRequestTime = 0;

export async function searchDestination(query) {
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return [];
  }

  // Enforce respectful Nominatim rate limit (1 request per second max)
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < APP_CONSTANTS.NOMINATIM_DEBOUNCE_MS) {
    await new Promise(res => setTimeout(res, APP_CONSTANTS.NOMINATIM_DEBOUNCE_MS - timeSinceLast));
  }
  lastRequestTime = Date.now();

  const endpoint = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query.trim())}&format=json&addressdetails=1&limit=5`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), APP_CONSTANTS.HTTP_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        "Accept": "application/json"
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Nominatim error HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.map(item => ({
      placeId: item.place_id,
      name: item.display_name,
      shortName: item.name || item.display_name.split(",")[0],
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      type: item.type || "place",
      boundingBox: item.boundingbox,
      address: item.address || {}
    }));
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("[NominatimService] Geocoding request failed:", err);
    throw err;
  }
}
