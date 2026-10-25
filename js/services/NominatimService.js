/* ==========================================================================
   Cholo Ghure Asssiii — High-Performance Worldwide Geocoding Service
   Dual-Engine Architecture:
   - Primary: Photon Komoot API (Elasticsearch typeahead on global OpenStreetMap)
   - Fallback: OSM Nominatim API (Multilingual geocoding)
   Zero hardcoding — covers every city, village, mountain, island, street on Earth.
   ========================================================================== */

import { APP_CONSTANTS } from "../config/constants.js";

// In-memory query cache for instant sub-millisecond retrieval
const searchCache = new Map();
const MAX_CACHE_SIZE = 100;

let currentAbortController = null;
let lastRequestTime = 0;

/**
 * Returns flag emoji from a 2-letter ISO country code
 */
export function getCountryFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return "📍";
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return "📍";
  }
}

/**
 * Returns contextual icon based on OSM place type/key
 */
export function getPlaceIcon(type, osmValue, osmKey) {
  const t = (type || osmValue || osmKey || "").toLowerCase();
  if (t.includes("country")) return "🌐";
  if (t.includes("city") || t.includes("town") || t.includes("municipality")) return "🏙️";
  if (t.includes("mountain") || t.includes("peak") || t.includes("volcano") || t.includes("hill")) return "⛰️";
  if (t.includes("beach") || t.includes("bay") || t.includes("coast") || t.includes("island")) return "🏖️";
  if (t.includes("historic") || t.includes("monument") || t.includes("museum") || t.includes("castle") || t.includes("temple")) return "🏛️";
  if (t.includes("park") || t.includes("forest") || t.includes("nature") || t.includes("reserve")) return "🌲";
  if (t.includes("village") || t.includes("hamlet") || t.includes("suburb") || t.includes("district")) return "🏡";
  if (t.includes("hotel") || t.includes("resort")) return "🏨";
  if (t.includes("airport") || t.includes("aeroway")) return "✈️";
  if (t.includes("station") || t.includes("railway")) return "🚆";
  return "📍";
}

/**
 * Search destinations globally using dual engines
 */
export async function searchDestination(query) {
  if (!query || typeof query !== "string") return [];
  const cleanQuery = query.trim().toLowerCase();
  if (cleanQuery.length === 0) return [];

  // 1. Check in-memory cache first
  if (searchCache.has(cleanQuery)) {
    return searchCache.get(cleanQuery);
  }

  // Cancel prior in-flight request
  if (currentAbortController) {
    currentAbortController.abort();
  }
  currentAbortController = new AbortController();
  const signal = currentAbortController.signal;

  try {
    // 2. Try Primary Engine: Photon Komoot Typeahead
    let places = await queryPhoton(cleanQuery, signal);

    // 3. If Photon returns fewer than 3 results, enrich/fallback with OSM Nominatim
    if (!places || places.length < 3) {
      try {
        const nominatimPlaces = await queryNominatim(cleanQuery, signal);
        places = mergeAndDeduplicate(places, nominatimPlaces);
      } catch (nomErr) {
        // Fallback error is non-fatal if Photon gave results
      }
    }

    // Cache successful results
    if (places && places.length > 0) {
      if (searchCache.size >= MAX_CACHE_SIZE) {
        const firstKey = searchCache.keys().next().value;
        searchCache.delete(firstKey);
      }
      searchCache.set(cleanQuery, places);
    }

    return places;
  } catch (err) {
    if (err.name === "AbortError") {
      return []; // Request superseded by next keystroke
    }
    console.warn("[Geocoding] Query failed:", err);
    return [];
  }
}

/**
 * Engine 1: Query Photon API (Fast Elasticsearch typeahead on global OSM)
 */
async function queryPhoton(query, signal) {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8&lang=en`;
  const timeoutId = setTimeout(() => signal && signal.abort && signal.abort(), APP_CONSTANTS.HTTP_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
    clearTimeout(timeoutId);
    if (!res.ok) return [];

    const data = await res.json();
    if (!data || !data.features) return [];

    return data.features.map(f => {
      const p = f.properties || {};
      const coords = f.geometry ? f.geometry.coordinates : [0, 0];
      const lon = coords[0];
      const lat = coords[1];

      const shortName = p.name || p.city || p.country || "Destination";
      
      // Build clean geographic hierarchy
      const parts = [];
      if (p.district && p.district !== shortName) parts.push(p.district);
      if (p.city && p.city !== shortName) parts.push(p.city);
      if (p.state && p.state !== shortName) parts.push(p.state);
      if (p.country && p.country !== shortName) parts.push(p.country);
      const subText = parts.slice(0, 3).join(", ") || p.country || "Global Destination";

      const countryCode = (p.countrycode || "").toUpperCase();
      const flag = getCountryFlag(countryCode);
      const icon = getPlaceIcon(p.type, p.osm_value, p.osm_key);

      return {
        placeId: `ph_${p.osm_type || 'N'}_${p.osm_id || Math.random()}`,
        name: `${shortName}, ${subText}`,
        shortName,
        subText,
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        type: p.type || p.osm_value || "place",
        icon,
        flag,
        countryCode,
        boundingBox: p.extent || null,
        address: p
      };
    });
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === "AbortError") throw e;
    return [];
  }
}

/**
 * Engine 2: Query OpenStreetMap Nominatim (Accurate multilingual geocoding)
 */
async function queryNominatim(query, signal) {
  // Respect Nominatim interval
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < 400) {
    await new Promise(r => setTimeout(r, 400 - timeSinceLast));
  }
  lastRequestTime = Date.now();

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6&accept-language=en`;
  const timeoutId = setTimeout(() => signal && signal.abort && signal.abort(), APP_CONSTANTS.HTTP_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
    clearTimeout(timeoutId);
    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map(item => {
      const addr = item.address || {};
      const shortName = item.name || addr.city || addr.town || addr.village || item.display_name.split(",")[0];
      
      const parts = [];
      if (addr.state && addr.state !== shortName) parts.push(addr.state);
      if (addr.country && addr.country !== shortName) parts.push(addr.country);
      const subText = parts.join(", ") || addr.country || "Global Location";

      const countryCode = (addr.country_code || "").toUpperCase();
      const flag = getCountryFlag(countryCode);
      const icon = getPlaceIcon(item.type, item.class);

      return {
        placeId: `nom_${item.place_id}`,
        name: item.display_name,
        shortName,
        subText,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        type: item.type || "place",
        icon,
        flag,
        countryCode,
        boundingBox: item.boundingbox,
        address: addr
      };
    });
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === "AbortError") throw e;
    return [];
  }
}

/**
 * Merge and deduplicate results from both engines by coordinate proximity (< 5km)
 */
function mergeAndDeduplicate(listA, listB) {
  const merged = [...(listA || [])];

  for (const b of (listB || [])) {
    const isDuplicate = merged.some(a => {
      const dLat = Math.abs(a.latitude - b.latitude);
      const dLon = Math.abs(a.longitude - b.longitude);
      return (dLat < 0.05 && dLon < 0.05) || a.shortName.toLowerCase() === b.shortName.toLowerCase();
    });

    if (!isDuplicate) {
      merged.push(b);
    }
  }

  return merged.slice(0, 8);
}

/**
 * Reverse geocode latitude and longitude to an authentic human-readable city/location
 */
export async function reverseGeocode(lat, lon) {
  const cacheKey = `rev_${lat.toFixed(3)}_${lon.toFixed(3)}`;
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  // 1. Primary: OpenStreetMap Nominatim Reverse API
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "en" },
      signal: AbortSignal.timeout(4000)
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const shortName = addr.city || addr.town || addr.village || addr.municipality || addr.county || addr.state_district || data.name || "Scenic Spot";
        const parts = [];
        if (addr.state && addr.state !== shortName) parts.push(addr.state);
        if (addr.country && addr.country !== shortName) parts.push(addr.country);
        const subText = parts.join(", ") || addr.country || "Earth Location";
        const countryCode = (addr.country_code || "").toUpperCase();
        const flag = getCountryFlag(countryCode);

        const result = {
          name: data.display_name || `${shortName}, ${subText}`,
          shortName,
          subText,
          latitude: lat,
          longitude: lon,
          countryCode,
          flag,
          type: data.type || "place"
        };
        searchCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (e) {
    // Fallback to Photon
  }

  // 2. Fallback: Photon Komoot Reverse API
  try {
    const photonUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`;
    const res = await fetch(photonUrl, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        const props = data.features[0].properties;
        const shortName = props.name || props.city || props.town || props.state || "Scenic Spot";
        const parts = [];
        if (props.state && props.state !== shortName) parts.push(props.state);
        if (props.country && props.country !== shortName) parts.push(props.country);
        const subText = parts.join(", ") || props.country || "Earth Location";
        const countryCode = (props.countrycode || "").toUpperCase();
        const flag = getCountryFlag(countryCode);

        const result = {
          name: `${shortName}, ${subText}`,
          shortName,
          subText,
          latitude: lat,
          longitude: lon,
          countryCode,
          flag,
          type: props.type || "place"
        };
        searchCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (e) {}

  // 3. Fallback coordinate descriptor
  return {
    name: `Location [${lat.toFixed(3)}°, ${lon.toFixed(3)}°]`,
    shortName: `Spot @ ${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
    subText: "Global Waypoint",
    latitude: lat,
    longitude: lon,
    countryCode: "",
    flag: "📍",
    type: "pin"
  };
}
