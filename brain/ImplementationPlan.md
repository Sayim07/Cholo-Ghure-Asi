# Implementation Plan (ImplementationPlan.md) — Cholo Ghure Asssiii

> **Mandatory Reference:** This document lays out the phased execution roadmap for `Cholo Ghure Asssiii` sized for the 7-day selection window. Every phase contains concrete tasks, verified reference code snippets, and strict exit criteria.

---

## 1. Phased Execution Roadmap

### Phase 0: Project Scaffolding & Layout Shell (Day 1)
- [ ] Initialize directory structure matching [Schema.md §1](file:///s:/sayim/GDG/brain/Schema.md#1).
- [ ] Create `index.html` with exact title and branding matching [Design.md §0](file:///s:/sayim/GDG/brain/Design.md#0).
- [ ] Setup `styles/variables.css` containing design tokens and dark/light mode rules matching [Design.md §2](file:///s:/sayim/GDG/brain/Design.md#2).
- [ ] Link Leaflet.js v1.9.4 CSS & JS via CDN, GSAP 3.12 via CDN, and Lucide Icons.
- [ ] Build split-screen responsive layout: Left panel (Explore/Itinerary/Budget) and Right panel (Map viewport).
- **Exit Criteria:** Loading `index.html` in browser displays the branded navbar, empty map viewport centered on Kolkata, and left panel tabs without any console errors.

### Phase 1: Interactive Map & Leaflet Engine (Day 2)
- [ ] Implement `scripts/components/MapManager.js` with OpenStreetMap Carto tile layers.
- [ ] Create custom SVG marker pins for Start, Waypoints, and Finish.
- [ ] Implement map click listener that emits reverse-lookup coordinates.
- [ ] Implement `map.invalidateSize()` handler for responsive layout transitions.
- **Exit Criteria:** Clicking the map places a temporary pin and displays latitude/longitude coordinates; zooming and panning are buttery smooth.

### Phase 2: Geocoding & Live Weather Integration (Day 3)
- [ ] Implement `scripts/services/NominatimService.js` with user-triggered search and custom `User-Agent`.
- [ ] Implement `scripts/services/WeatherService.js` calling Open-Meteo.
- [ ] Build `scripts/utils/weatherIcons.js` mapping WMO codes to descriptions and icons.
- [ ] Implement `scripts/components/DestinationCard.js` displaying place name, temperature (°C), weather condition, humidity, and wind speed.
- **Exit Criteria:** Typing "Darjeeling" and clicking Search zooms the map to Darjeeling with a pin, and renders the current weather card with accurate °C and condition icon.

### Phase 3: Route Planning & Polyline Rendering (Day 4)
- [ ] Implement `scripts/services/RoutingService.js` using OSRM driving endpoint.
- [ ] Connect sequential waypoints into an OSRM route query (`{lon1},{lat1};{lon2},{lat2}`).
- [ ] Parse returned GeoJSON `LineString` and render electric cyan polyline on Leaflet map.
- [ ] Display total route distance (km) and estimated travel duration (hours/mins) in a floating map badge.
- **Exit Criteria:** Adding two or more destinations draws a continuous road route line on the map with calculated distance in kilometers and driving time.

### Phase 4: Itinerary Management & Multi-Day Organization (Day 5)
- [ ] Implement `scripts/state/TripStore.js` with Pub/Sub reactive state pattern.
- [ ] Build `scripts/components/ItineraryView.js` rendering day-wise stops (`Day 1`, `Day 2` tabs).
- [ ] Add reorder controls (`▲` Up, `▼` Down) to reorganize stops dynamically.
- [ ] Implement stop deletion and automatic route re-calculation upon reordering or deletion.
- [ ] Implement `scripts/components/BudgetPlanner.js` calculating total trip cost across stay, food, transport, and tickets.
- **Exit Criteria:** User can add 4 stops across 2 days, reorder them, delete one stop, and see the map route, distance, and budget update automatically.

### Phase 5: Firebase Firestore Cloud Integration (Day 6)
- [ ] Configure `scripts/config/firebase.config.js` with Firebase Web SDK v10 (modular CDN import).
- [ ] Implement `scripts/services/FirebaseService.js` with `saveTrip()`, `getSavedTrips()`, and `deleteTrip()`.
- [ ] Build "Saved Trips" drawer allowing users to load previously saved itineraries.
- [ ] Add offline local storage fallback when internet is disrupted.
- **Exit Criteria:** Saving a trip stores the document in Firestore; refreshing the browser or opening "Saved Trips" allows reloading the exact itinerary and map route.

### Phase 6: Visual Polish, Testing & Deployment (Day 7)
- [ ] Add GSAP micro-animations (card entrance staggers, modal reveals, button magnetic effects).
- [ ] Add dark/light mode toggle with theme persistence in `localStorage`.
- [ ] Implement itinerary export / print stylesheet (`@media print`).
- [ ] Conduct end-to-end responsiveness testing on Mobile (375px), Tablet (768px), and Desktop (1440px).
- [ ] Write production-ready `README.md` with screenshots, setup instructions, and architecture guide.
- [ ] Deploy live to GitHub Pages / Vercel.
- **Exit Criteria:** All 7 core requirements from GDG problem statement verified; public GitHub repo pushed; live deployed link active.

---

## 2. Verified Reference Code Snippets

### 2.1 Leaflet Map Initialization with Tile Layer
```javascript
// scripts/components/MapManager.js
export function initMap(containerId, centerCoords = [22.5726, 88.3639], zoom = 11) {
  const map = L.map(containerId, {
    zoomControl: false, // Positioned manually for cleaner UI
    attributionControl: false
  }).setView(centerCoords, zoom);

  // OpenStreetMap standard tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Position controls cleanly
  L.control.zoom({ position: "topright" }).addTo(map);
  L.control.attribution({ position: "bottomright", prefix: false }).addTo(map);

  return map;
}
```

### 2.2 Nominatim Geocoding Request (with User-Agent & 1s Rate Limit)
```javascript
// scripts/services/NominatimService.js
export async function searchDestination(query) {
  if (!query || query.trim().length === 0) return [];
  const endpoint = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query.trim())}&format=json&addressdetails=1&limit=5`;
  
  const response = await fetch(endpoint, {
    headers: {
      "Accept": "application/json"
    }
  });

  if (!response.ok) throw new Error(`Nominatim HTTP error! status: ${response.status}`);
  return await response.json();
}
```

### 2.3 Open-Meteo Weather Fetching & Formatting
```javascript
// scripts/services/WeatherService.js
export async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo HTTP error! status: ${res.status}`);
  const data = await res.json();
  
  return {
    temperature: Math.round(data.current.temperature_2m),
    humidity: data.current.relative_humidity_2m,
    windSpeed: Math.round(data.current.wind_speed_10m),
    weatherCode: data.current.weather_code,
    daily: data.daily
  };
}
```

### 2.4 OSRM Route Calculation & Polyline Plotting
```javascript
// scripts/services/RoutingService.js
export async function calculateRoute(waypoints) {
  // waypoints: Array of [lat, lon]
  if (waypoints.length < 2) return null;
  // OSRM expects: lon,lat;lon,lat
  const coordString = waypoints.map(pt => `${pt[1]},${pt[0]}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("OSRM routing service unavailable");
  const data = await res.json();

  if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
    throw new Error("No route found between selected waypoints");
  }

  const primaryRoute = data.routes[0];
  return {
    distanceKm: (primaryRoute.distance / 1000).toFixed(1),
    durationMins: Math.round(primaryRoute.duration / 60),
    geoJsonGeometry: primaryRoute.geometry // { type: 'LineString', coordinates: [[lon, lat], ...] }
  };
}
```

### 2.5 Firebase Firestore v10 Modular SDK Initialization & Operations
```javascript
// scripts/config/firebase.config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDocs, collection, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { doc, setDoc, getDocs, collection, deleteDoc };
```

---

## 3. Fallback Plan for Riskiest Tasks

| Risky Task | Risk Scenario | Fallback Mechanism |
| :--- | :--- | :--- |
| **OSRM Route Over-Water / Failure** | OSRM returns 400 or no route for distant/coastal points | Catch error and draw a dashed geodesic straight line between waypoints with Leaflet `L.polyline`. Toast: *"Displaying straight-line path (driving route unavailable)."* |
| **Nominatim 429 Rate Limit** | Evaluator tests search rapidly | Search button is throttled client-side by 1 second; recent queries cached in `localStorage` cache. |
| **Firestore Disconnected or Quota Exceeded** | Offline demonstration or network drop | Silently fallback to `localStorage` for all trip saving and loading; display subtle status tag *"Stored locally"*. |

---

## 4. De-Scope Hierarchy & "Never Cut" List

### NEVER CUT (Core Evaluation Non-Negotiables)
1. Destination search via Nominatim with coordinates display and OSM attribution.
2. Interactive Leaflet map with custom marker drop.
3. Open-Meteo real-time weather display (°C, weather description, icon, humidity, wind).
4. OSRM route calculation (polyline line on map, distance km, driving time).
5. Itinerary stop addition, deletion, and day organization.
6. Firebase Firestore saving and retrieval of trips.
7. Clean Vanilla JS architecture (zero frameworks).

### De-Scope Order (If Time Runs Out)
1. *Cut First:* 3D Three.js background canvas particles.
2. *Cut Second:* Multi-currency budget conversions (keep plain INR ₹).
3. *Cut Third:* Itinerary JSON export download (keep browser print view).
4. *Cut Fourth:* 7-day extended weather forecast strip (keep current live weather card).
