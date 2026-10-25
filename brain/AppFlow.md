# Application and Data Flow (AppFlow) — Cholo Ghure Asssiii

> **Mandatory Reference:** This document defines the exact data life-cycles, user interaction journeys, and error handling paths in `Cholo Ghure Asssiii`. All implementations in `scripts/` must respect these flows without deviation.

---

## 1. End-to-End Discovery & Planning Lifecycle

```
[ Step 1: 3D Voyager Globe Landing ]
               |
  User interacts with rotating WebGL / SVG Globe
  Selects CONTINENT (e.g., Asia) -> Selects COUNTRY (e.g., India)
               |
               v
[ Step 2: Smooth Cinematic Camera Descent ]
  Globe camera zooms into Country coordinates -> Seamlessly dissolves into
  Full-Screen High-Resolution Leaflet Cartography (Primland Style)
               |
               v
[ Step 3: Interactive Exploration & Season Controls ]
  User toggles 4-Season Filter [Summer ☀️ | Monsoon 🌧️ | Autumn 🍂 | Winter ❄️]
  Tile tone shifts, ambient particle canvas activates
               |
               v
[ Step 4: Destination Search / Pin Selection ]
  User searches city or taps glowing hotspot on map
               |
               v
[ Step 5: ERA Residence "Portal Gate Reveal" ]
  Grand arched gateway / nature portal smoothly slides open via GSAP
  Revealing:
  - Destination Imagery & Geographic Coordinates
  - Live Open-Meteo Weather Badge (Temp °C, Condition Icon, Wind, Humidity)
  - "+ Add to Itinerary" CTA Button
               |
               v
[ Step 6: Lightship RV Telemetry & Multi-Stop Routing ]
  Adding stops triggers OSRM Routing Engine:
  - Electric Azure road polyline drawn across stops
  - Live HUD metrics updated: Total Distance (km), Drive Time (hrs), Budget (₹)
  - Scrolling through itinerary days triggers smooth drone flyTo along waypoints
               |
               v
[ Step 7: Cloud Synchronization ]
  Trip persisted to Firebase Firestore `trips` collection + localStorage backup.
```

---

## 2. Runtime & Application Lifecycle Flow

When a user visits `Cholo Ghure Asssiii`, the application executes the following sequential boot pipeline:

1. **DOM Content Loaded:**
   - `scripts/main.js` initializes.
   - Reads user theme preference from `localStorage.getItem("cga_theme")` (defaults to dark mode with rich gradients).
   - Mounts the `MapManager.js` instance onto `<div id="map-container">`, setting view to Kolkata coordinates `[22.5726, 88.3639]`.
   - Adds OpenStreetMap tile layer with required attribution.

2. **State Hydration:**
   - `TripStore.js` reads last saved local draft or initializes an empty trip model (`"My Dream Trip"`, Day 1).
   - Asynchronously queries Firebase Firestore for the user's saved trips archive to populate the "Saved Trips" drawer list.

3. **Event Listener Attachment:**
   - Search bar: binds `click` on `#btn-search` and `keypress` on `#input-search` (Enter key only).
   - Map clicks: allows users to click anywhere on the map to reverse-geocode and view coordinates/weather.
   - Itinerary controls: reorder buttons (Move Up, Move Down), Delete stop, Day filter tabs, and Budget inputs.

---

## 3. Screen-Level & Component Flow

`Cholo Ghure Asssiii` employs a responsive split-screen dashboard architecture:

```
+-------------------------------------------------------------------------------------------------+
|  [Logo] Cholo Ghure Asssiii   | [Search Bar & Filter] |  [Theme Switch] [Saved Trips (N)] [Export] |
+-------------------------------------------------------------+-----------------------------------+
|                     LEFT PANEL (38% width)                  |      RIGHT PANEL (62% width)      |
|                                                             |                                   |
|  [ Tab Bar: 1. Explore | 2. Itinerary | 3. Budget ]         |   +---------------------------+   |
|                                                             |   |                           |   |
|  * When Tab 1 (Explore) is active:                          |   |                           |   |
|    - Search result cards (Name, type, coordinates)          |   |     Interactive Leaflet   |   |
|    - Current Destination Weather Badge                      |   |     Map with OSM Tiles    |   |
|      (Live Temp, Icon, Rain %, Wind, 7-Day Forecast)        |   |                           |   |
|    - "Add to Itinerary" prominent button                    |   |     - Custom Pin Markers  |   |
|    - Nearby Attractions list                                |   |     - OSRM Route Polyline |   |
|                                                             |   |     - Distance / Time Tag |   |
|  * When Tab 2 (Itinerary) is active:                        |   |                           |   |
|    - Day selector tabs (Day 1 | Day 2 | + Add Day)          |   |                           |   |
|    - Reorderable stops list with drag / up-down arrows      |   |                           |   |
|    - Distance & drive time between stops                    |   |                           |   |
|    - "Save to Cloud" & "Clear Trip" actions                 |   +---------------------------+   |
|                                                             |   | Route Summary Widget      |   |
|  * When Tab 3 (Budget) is active:                           |   | 🚗 142 km | ⏱ 3h 15m       |   |
|    - Breakdown: Stays + Food + Transport + Attractions     |   +---------------------------+   |
|    - Total estimated expense in INR (₹)                     |                                   |
+-------------------------------------------------------------+-----------------------------------+
```

---

## 4. Error Handling & Edge-Case Flows

| Trigger / Condition | Detected Where | User Experience / UI Flow | Recovery Action |
| :--- | :--- | :--- | :--- |
| **Empty Search Input** | `SearchBar.js` | Input shakes with red outline. Toast: *"Please enter a city or destination name."* | User inputs characters; error resets automatically. |
| **Destination Not Found (404/Empty)** | `NominatimService.js` | Toast: *"No places found matching your search. Try another spelling or popular landmark."* | Clear search loader; focus returns to input. |
| **Nominatim 429 / Rate Limit** | `NominatimService.js` | Toast: *"Search request throttled. Please wait 1 second before searching again."* | Search button is disabled with a 1-second countdown timer. |
| **Open-Meteo Weather Unavailable** | `WeatherService.js` | Destination card displays *"Weather data temporarily unavailable"* with neutral icon. | Core trip planning remains fully functional without crashing. |
| **OSRM Route Failed (Island / Ocean)** | `RoutingService.js` | Toast: *"Driving route cannot cross bodies of water. Displaying direct path."* | Draws dashed geodesic fallback line instead of polyline. |
| **Firestore Disconnected / Offline** | `FirebaseService.js` | Toast: *"Offline mode active. Your itinerary is safely saved in local storage."* | Trip data synced locally in `localStorage`; syncs to Firestore upon reconnection. |
| **Zero Stops in Itinerary** | `ItineraryView.js` | Displays empty state illustration: *"Your journey begins here. Search and add your first stop!"* | CTA redirects focus to search input. |
