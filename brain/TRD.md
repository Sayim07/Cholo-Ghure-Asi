# Technical Requirements Document (TRD) — Cholo Ghure Asssiii

> **Strict AI Instruction:** The coding tool must not substitute a library, dataset, or service not listed here without flagging it as an assumption first. Any departure from this specification constitutes a violation of project architecture.

---

## 1. System Architecture Overview
`Cholo Ghure Asssiii` is engineered as a client-side Single Page Application (SPA) utilizing native ECMAScript 2022 Modules (ESM). It communicates asynchronously via `fetch` with three public geospatial/weather REST APIs and the Google Firebase Firestore Web SDK (v10 modular) for cloud persistence.

```
+-----------------------------------------------------------------------------------+
|                           Cholo Ghure Asssiii (Browser SPA)                       |
|                                                                                   |
|   +-----------------------+   +----------------------+   +--------------------+   |
|   |   UI Components       |   |  State Management    |   |  Animation Layer   |   |
|   |  (Modular HTML/CSS)   |---|  (Store / Pub-Sub)   |---|  (GSAP 3 + CSS)    |   |
|   +-----------------------+   +----------------------+   +--------------------+   |
|               |                          |                          |             |
|   +-----------------------+   +----------------------+   +--------------------+   |
|   |   Leaflet 1.9 Map     |   |   API Services Hub   |   |  Firebase Client   |   |
|   |   (Tiles, Markers,    |   |  (Nominatim, Meteo,  |   |  (Firestore v10    |   |
|   |    Polylines)         |   |   OSRM Router)       |   |   Cloud SDK)       |   |
|   +-----------------------+   +----------------------+   +--------------------+   |
+---------------+--------------------------+--------------------------+-------------+
                |                          |                          |
                v                          v                          v
    [OpenStreetMap Tiles]         [External REST APIs]       [Firebase Firestore]
    - Basemap Cartography         - OSM Nominatim (Geocode)  - trips Collection
                                  - Open-Meteo (Weather)     - Offline Persistence
                                  - OSRM (Driving Routing)
```

---

## 2. Technology Stack Selection (100% Free / Open Source)

| Layer | Technology | Version | Justification & Role | Locked Default |
| :--- | :--- | :--- | :--- | :--- |
| **Markup & Core** | HTML5 Semantic | Living Standard | Clean, accessible semantics (`<main>`, `<section>`, `<article>`, `<dialog>`). | Required |
| **Styling & Theme** | Modern Vanilla CSS3 | Standard | CSS custom properties, CSS Grid/Flexbox, glassmorphic blurs, dark/light theme tokens. | Required |
| **Scripting** | Vanilla JavaScript | ES6+ / ESM | Native `import`/`export`, `async/await`, no bundler build step required. | Required |
| **Mapping Engine** | Leaflet.js | v1.9.4 (CDN) | Lightweight (42KB), mobile-optimized, open-source mapping engine without proprietary API keys. | Required |
| **Basemap Tiles** | OpenStreetMap Standard | Standard Carto | Free global tiles served from `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`. | Required |
| **Database** | Firebase Firestore | v10.8+ (Modular CDN) | Real-time NoSQL document store, offline caching, 50k free daily reads/20k writes. | Required |
| **Animation Engine** | GSAP (GreenSock) | v3.12+ (CDN) | High-performance 60 FPS transitions, card staggers, timeline animations without heavy libraries. | Required |
| **Iconography** | Lucide Icons / SVG | Modern SVG Sprites | Clean, feather-weight minimalist travel & weather SVG icons. | Required |
| **Hosting & Deploy**| GitHub Pages / Vercel | Free Tier | Zero-config, HTTPS-enabled static asset hosting directly from Git repo. | Required |

---

## 3. Decision Rationale: Firebase over Supabase
For `Cholo Ghure Asssiii`, **Firebase Firestore (Web SDK v10 Modular)** is locked as the primary database:
- **Zero Local Server Setup:** Runs directly in browser via ES Module CDN import (`https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js`).
- **Flexible Document Model:** Natural representation for nested trips, day-wise itineraries, and dynamic coordinate objects without complex foreign-key relational migrations.
- **Offline Cache:** Native offline persistence allows travelers to preview cached itineraries even without an active internet connection.

---

## 4. External Data Sources & API Contracts

All endpoints are free, requiring no commercial subscription keys:

| Service | Base URL & Endpoint Pattern | Protocol | Auth | Rate Limits / Constraints | Attribution Requirement |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Nominatim Search** | `https://nominatim.openstreetmap.org/search` | HTTPS GET | None | Max 1 request/second. Strict rule: User-initiated queries only. Custom User-Agent required. | `Data © OpenStreetMap contributors, ODbL` |
| **Open-Meteo Weather**| `https://api.open-meteo.com/v1/forecast` | HTTPS GET | None | Free for non-commercial use up to 10,000 daily calls. Zero API key required. | Open-Meteo.com attribution |
| **OSRM Routing** | `https://router.project-osrm.org/route/v1/driving/{coords}` | HTTPS GET | None | Public demo server. For driving directions, distance, and duration. | Project OSRM contributors |

### API Endpoint Query Specifications
1. **Nominatim Geocoding Query:**
   ```
   https://nominatim.openstreetmap.org/search?q={query}&format=json&addressdetails=1&limit=5
   ```
   - Must supply descriptive header: `User-Agent: CholoGhureAsssiii-TripPlanner/1.0`
2. **Open-Meteo Realtime & Daily Forecast Query:**
   ```
   https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto
   ```
3. **OSRM Route Waypoints Query:**
   ```
   https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson
   ```
   *(Note: OSRM coordinates are formatted as `longitude,latitude;longitude,latitude`)*.

---

## 5. Fixed Scope Parameters & Constants

These constants must remain fixed across all modules throughout the project lifecycle:

```javascript
// System Constants (Constants.js)
export const APP_NAME = "Cholo Ghure Asssiii";
export const DEFAULT_MAP_CENTER = [22.5726, 88.3639]; // Kolkata (BPPIMT Hub Coordinates)
export const DEFAULT_MAP_ZOOM = 11;
export const DETAIL_MAP_ZOOM = 14;
export const NOMINATIM_DEBOUNCE_MS = 800; // Minimum delay between manual requests
export const HTTP_TIMEOUT_MS = 8000;      // AbortController timeout threshold
export const MAX_ITINERARY_STOPS = 25;    // Maximum waypoints per trip
export const CURRENCY_SYMBOL = "₹";       // Default budget currency
```

---

## 6. Performance Targets & Critical Mitigations
- **First Contentful Paint (FCP):** < 0.8s on standard 4G broadband.
- **Leaflet Grey Tile Prevention:** When toggling tabs or resizing panels, invoke `map.invalidateSize()` after a 150ms timeout to ensure tile alignment.
- **Memory Management:** Clear previous polyline route layers (`routeLayerGroup.clearLayers()`) and marker clusters before rendering new itinerary paths.
- **Network Resilience:** Implement an `AbortController` timeout for all fetch queries to prevent pending hanging promises when external public servers fluctuate.

---

## 7. Security & Storage Policies
- **Firebase Configuration:** Firebase project credentials (`apiKey`, `projectId`, etc.) will be placed in a dedicated `scripts/config/firebase.config.js` module. (Since client-side keys are read/write identifiers, Firestore Rules must restrict data structure according to [Schema.md §3](file:///s:/sayim/GDG/brain/Schema.md#3)).
- **Content Security:** All user inputs rendered into DOM must use `textContent` or sanitized template interpolation to eliminate XSS risks.
