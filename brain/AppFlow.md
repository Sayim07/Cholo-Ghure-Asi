# Application and Data Flow (AppFlow) — Cholo Ghure Asssiii

> **Mandatory Reference:** This document defines the exact data life-cycles, user interaction journeys, and error handling paths in `Cholo Ghure Asssiii`. All implementations in `scripts/` must respect these flows without deviation.

---

## 1. Scroll-Driven 5-Scene Architecture & Data Flow

`Cholo Ghure Asssiii` is structured as a vertical single-page journey powered by Lenis smooth scroll and GSAP ScrollTrigger pinned scenes:

```
[ SCENE 1: THE ARCHITECTURAL GATE (ERA Residence Behavior) ]
  * Pinned for 120vh scroll distance.
  * Scroll scrub (0 -> 1) progressively parts the golden filigree heritage double doors.
  * Behind the parting doors, the 3D glowing Earth globe is revealed with subtle scale parallax.
  * "Scroll to explore" cue gently fades out.
            |
            v
[ SCENE 2: THE 3D VOYAGER GLOBE (Interactive WebGL) ]
  * Pinned scene: scroll smoothly scales and rotates the 3D Earth.
  * Continent selector chips + Country dropdown + 3D glowing landmark pins.
  * Selecting a continent or country rotates globe coordinates to focus on that territory.
  * End of scene (or "Dive in" button): Camera dives into the globe (zoom-through),
    cross-fading directly into the full-screen interactive Leaflet map canvas.
            |
            v
[ SCENE 3: EXPLORE MAP & SIDE PANEL (Primland Behavior) — CORE PRODUCT ]
  * Full-viewport edge-to-edge interactive Leaflet cartography with custom Carto/OSM tiles.
  * Top floating glass search bar with Nominatim geocoding & category filters (Heritage, Hills, Beach, Nature, Food, Spiritual).
  * 4-Season ambient switcher in navigation (Summer, Monsoon, Autumn, Winter) with dynamic particle physics.
  * Interactive hotspot markers (custom SVG pins with pulse). Hover displays micro tooltip; click smoothly flies camera.
  * Search Flow: User searches place -> Nominatim geocodes -> map.flyTo(lat, lon, zoom 11, duration 2.2s) ->
    Drop animated pin -> Open RIGHT-SIDE DETAIL PANEL (~420px frosted glass, slides in with GSAP).
  * NO centered white modal: Map stays fully visible, draggable, and interactive.
  * Detail Panel:
    - Real Wikipedia / Wikimedia REST photo resolution (no hardcoded generic images!).
    - Place name, administrative region, mono coordinates.
    - Live Open-Meteo weather badge (temp °C, condition, humidity, wind, 3-day forecast strip).
    - Travel mode selector (🚗 Drive | 🚆 Transit | 🚶 Walk).
    - Action buttons: "➕ Add to Itinerary", "🗺️ Open in Google Maps", "✕ Close".
    - In-panel thematic miniature gate/mist/wave reveal (~0.8s).
            |
            v
[ SCENE 4: JOURNEY TIMELINE & ROUTE (Lightship RV Behavior) ]
  * Pinned split scene:
    - Left side (55%): Sticky Leaflet route map showing the full multi-stop itinerary.
    - Right side (45%): Scrolling Day cards (Day 1, Day 2, Day 3) containing scheduled stops.
  * As the user scrolls through each day, the map camera flies (flyToBounds) to that day's stops,
    and that day's OSRM polyline road route segment illuminates.
  * Telemetry HUD (JetBrains Mono font, large numbers) scrubs with scroll:
    - Total Distance km, Travel Duration, Stops count, Est. Budget ₹, Current Stop Temp °C.
    - GSAP number tweens tied to ScrollTrigger progress.
  * Itinerary controls per stop: reorder up/down, delete, edit budget, add day, and Firebase Firestore cloud sync.
            |
            v
[ SCENE 5: SAVED TRIPS ARCHIVE & FOOTER ]
  * Grid of saved trips retrieved from Firestore (and localStorage fallback).
  * Load trip, delete trip, clean export (print stylesheet / JSON download).
  * Attribution footer: OpenStreetMap, Nominatim, Open-Meteo, Project OSRM, Wikimedia.
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
