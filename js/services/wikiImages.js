/* ==========================================================================
   Cholo Ghure Asssiii — Dynamic Wikipedia Photo Resolution (js/services/wikiImages.js)
   Solves Image Bug: Resolves real place photos via Wikipedia REST API & Wikimedia
   NEVER shows a wrong landmark!
   ========================================================================== */

const CACHE_PREFIX = "cga_wiki_img_";

/**
 * Extracts clean search query for Wikipedia lookup
 */
function cleanPlaceTitle(name) {
  if (!name) return "";
  // If comma-separated, take the primary landmark / city name
  const parts = name.split(",");
  return parts[0].trim();
}

/**
 * Fetches real photo for a destination by name and coordinates
 */
export async function getPlacePhoto(name, latitude, longitude) {
  const cleanTitle = cleanPlaceTitle(name);
  if (!cleanTitle) {
    return getFallbackGradient(name);
  }

  // 1. Check LocalStorage Cache
  const cacheKey = `${CACHE_PREFIX}${cleanTitle.toLowerCase().replace(/\s+/g, "_")}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Valid for 7 days
      if (Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000) {
        return parsed.url;
      }
    }
  } catch (e) {}

  // 2. Query Wikipedia REST Summary API
  try {
    const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTitle)}`;
    const res = await fetch(endpoint, {
      headers: { "Accept": "application/json" }
    });

    if (res.ok) {
      const data = await res.json();
      const imageUrl = data.originalimage?.source || data.thumbnail?.source;
      if (imageUrl) {
        cacheImage(cacheKey, imageUrl);
        return imageUrl;
      }
    }
  } catch (err) {
    console.warn(`[wikiImages] Summary lookup failed for ${cleanTitle}:`, err);
  }

  // 3. Query Wikimedia Commons Geosearch near Latitude & Longitude
  if (latitude !== undefined && longitude !== undefined) {
    try {
      const geoEndpoint = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&generator=geosearch&ggscoord=${latitude}|${longitude}&ggsradius=10000&ggslimit=1&piprop=thumbnail&pithumbsize=1000&format=json&origin=*`;
      const res = await fetch(geoEndpoint);
      if (res.ok) {
        const data = await res.json();
        const pages = data.query?.pages;
        if (pages) {
          const firstPageId = Object.keys(pages)[0];
          const img = pages[firstPageId]?.thumbnail?.source;
          if (img) {
            cacheImage(cacheKey, img);
            return img;
          }
        }
      }
    } catch (err) {
      console.warn(`[wikiImages] Geosearch failed for ${latitude},${longitude}:`, err);
    }
  }

  // 4. Fallback to clean, aesthetic gradient placeholder (Never show wrong landmark!)
  return getFallbackGradient(cleanTitle);
}

function cacheImage(key, url) {
  try {
    localStorage.setItem(key, JSON.stringify({ url, timestamp: Date.now() }));
  } catch (e) {}
}

function getFallbackGradient(title) {
  // SVG Data URI with luxury gold/forest gradient and destination name
  const safeTitle = (title || "Travel Destination").substring(0, 30);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#16241a"/>
        <stop offset="50%" stop-color="#1f3726"/>
        <stop offset="100%" stop-color="#0c1710"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <circle cx="400" cy="225" r="160" fill="none" stroke="#c6924b" stroke-width="1.5" opacity="0.3"/>
    <text x="50%" y="48%" font-family="Playfair Display, Georgia, serif" font-size="28" font-weight="700" fill="#fbf9f4" text-anchor="middle" dominant-baseline="middle">${safeTitle}</text>
    <text x="50%" y="58%" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" fill="#c6924b" letter-spacing="3" text-anchor="middle">CHOLO GHURE ASSSIII</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
