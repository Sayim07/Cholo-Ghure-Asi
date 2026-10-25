# Product Requirements Document (PRD) — Cholo Ghure Asssiii

> **Mandatory Branding Notice:** The official, immutable user-facing application name is **`Cholo Ghure Asssiii`** (spelled and capitalized exactly as shown). This exact name must appear in the HTML `<title>`, header navbar, browser tabs, modals, footer, documentation, and all commit messages. No abbreviations (e.g., CGA), variations, or alterations are permitted.

---

## 1. Problem Statement
Travelers frequently struggle to coordinate multiple disparate tools when planning a journey: one app for searching destinations, another for weather forecasts, a third for map navigation/routing, and messy notes or spreadsheets for tracking daily itinerary stops, expenses, and schedules. 

**Cholo Ghure Asssiii** resolves this fragmentation into a unified, lightweight, highly responsive Single Page Application (SPA). Built without heavyweight framework bloat using pure Vanilla JavaScript, modern CSS, Leaflet.js, and Firebase Firestore, it provides seamless destination exploration, real-time weather analytics, route estimation, day-wise itinerary composition, expense tracking, and persistent cloud synchronization.

---

## 2. Goals (Scoped to 7-Day Solo Delivery)
- Deliver 100% of the GDG BPPIMT Tech Team Selection core requirements using pure HTML5, Modern CSS, and Vanilla JavaScript (ES6+ modules).
- Provide instant geocoded destination searching powered by OpenStreetMap Nominatim with respectful rate-limiting and attribution.
- Display pinpointed coordinates on an interactive Leaflet.js map with custom markers, popup cards, and visual route lines.
- Fetch live atmospheric weather conditions (temperature in °C, WMO weather descriptions, icons, humidity, wind speed) via the Open-Meteo Weather API.
- Calculate driving routes between itinerary waypoints via OSRM (Open Source Routing Machine), plotting polyline geometries and displaying distance (km) and estimated travel duration.
- Enable full day-wise itinerary management: adding/deleting stops, reordering destinations, organizing schedules by travel days, and calculating travel budgets.
- Persist trip plans in Firebase Firestore (Spark Free Tier) with instant cloud load, save, and update operations.
- Wow evaluators with a 60 FPS glassmorphic, travel-inspired Bengali wanderlust UI, dark/light theme toggle, and smooth GSAP-powered micro-animations.

---

## 3. Non-Goals (Explicit "Do NOT Build" List)
To eliminate scope creep and prevent disqualification under selection rules, the following are strictly **prohibited**:
1. **NO Frontend Frameworks:** Do NOT use React, Next.js, Vue, Svelte, or Angular. All logic must be written in modular Vanilla JavaScript (ES6+).
2. **NO Custom Backend Servers:** Do NOT write Express.js, Django, FastAPI, or Node backends. Authentication-free or anonymous Firebase Firestore client SDK handles cloud persistence directly.
3. **NO Paid APIs or Credit-Card Gated Services:** Do NOT use Google Maps JavaScript API, Mapbox GL (access tokens), OpenWeatherMap (requires paid plans/restricted keys). Only 100% free, non-key or free-tier public APIs (Open-Meteo, Nominatim, OSRM, Firebase) are allowed.
4. **NO Nominatim Autocomplete on Keystroke:** Do NOT fire geocoding requests on every input keypress (`input` event); Nominatim's strict usage policy forbids automated keystroke queries. Searches must be triggered strictly by search button click or Enter key press.
5. **NO Complex Booking/Payment Gateways:** Do NOT implement mock hotel/flight booking checkouts or Stripe/Razorpay integrations. Itinerary planning and budget estimation are the scope.

---

## 4. Target Users & Stakeholders
- **Primary User:** Independent travelers, backpackers, college students, and road-trippers planning weekend getaways, multi-day tours, or road trips across India and global destinations.
- **Evaluators / GDG BPPIMT Selection Committee:** Reviewing technical fundamentals, DOM manipulation, asynchronous state management, clean architecture, responsive design aesthetics, and error handling.

---

## 5. Core Features & Prioritization (P0 / P1 / P2)

| Priority | Feature ID | Feature Name | Description | Cross-Ref |
| :--- | :--- | :--- | :--- | :--- |
| **P0** | `F-01` | **Destination Search & Geocoding** | Search input + button fetching coordinates (lat/lon), display name, and bounding box via Nominatim API with attribution. | [TRD.md §4](file:///s:/sayim/GDG/brain/TRD.md#4), [Schema.md §4.1](file:///s:/sayim/GDG/brain/Schema.md#41) |
| **P0** | `F-02` | **Interactive Leaflet Map** | OpenStreetMap tile layer, smooth fly-to animations, custom pins, popups displaying place info and quick "Add to Itinerary" action. | [TRD.md §2](file:///s:/sayim/GDG/brain/TRD.md#2), [AppFlow.md §3](file:///s:/sayim/GDG/brain/AppFlow.md#3) |
| **P0** | `F-03` | **Live Weather Display** | Real-time weather cards using Open-Meteo: temperature (°C), weather code icons, humidity (%), and wind speed (km/h). | [TRD.md §4](file:///s:/sayim/GDG/brain/TRD.md#4), [Schema.md §4.2](file:///s:/sayim/GDG/brain/Schema.md#42) |
| **P0** | `F-04` | **OSRM Route Planning** | Calculate driving route between origin and destination; draw route polyline on map; display distance (km) and travel duration (hrs/mins). | [TRD.md §4](file:///s:/sayim/GDG/brain/TRD.md#4), [Schema.md §4.3](file:///s:/sayim/GDG/brain/Schema.md#43) |
| **P0** | `F-05` | **Itinerary Management** | Add/remove stops, reorder stops up/down, organize by Day 1, Day 2, etc., view complete planned itinerary. | [AppFlow.md §2](file:///s:/sayim/GDG/brain/AppFlow.md#2), [Schema.md §3](file:///s:/sayim/GDG/brain/Schema.md#3) |
| **P0** | `F-06` | **Firebase Cloud Sync** | Save, fetch, update, and delete trip itineraries in Firestore (`trips` collection) with instant feedback. | [TRD.md §2](file:///s:/sayim/GDG/brain/TRD.md#2), [Schema.md §3](file:///s:/sayim/GDG/brain/Schema.md#3) |
| **P0** | `F-07` | **Error & State Handling** | Beautiful toast notifications for invalid destinations, network failures, route calculation errors, and empty states. | [AppFlow.md §4](file:///s:/sayim/GDG/brain/AppFlow.md#4), [Design.md §5](file:///s:/sayim/GDG/brain/Design.md#5) |
| **P1** | `F-08` | **Multi-Day & Budget Planner** | Assign budget per stop (stay, travel, food), auto-calculate total trip cost, and filter stops by day tabs. | [Schema.md §3](file:///s:/sayim/GDG/brain/Schema.md#3), [Design.md §4](file:///s:/sayim/GDG/brain/Design.md#4) |
| **P1** | `F-09` | **7-Day Weather Forecast** | Multi-day daily forecast strip (min/max temps, rain probability) from Open-Meteo for itinerary dates. | [Schema.md §4.2](file:///s:/sayim/GDG/brain/Schema.md#42) |
| **P1** | `F-10` | **Dark / Light Mode Toggle** | System-aware, persistable theme switch styled with custom CSS variables and smooth transitions. | [Design.md §3](file:///s:/sayim/GDG/brain/Design.md#3) |
| **P2** | `F-11` | **Nearby Attractions Discovery**| Query tourist attractions, heritage spots, and scenic places near the selected destination coordinates. | [TRD.md §4](file:///s:/sayim/GDG/brain/TRD.md#4) |
| **P2** | `F-12` | **Itinerary Print & Export** | One-click clean print stylesheet and JSON export to download trip summaries offline. | [AppFlow.md §3](file:///s:/sayim/GDG/brain/AppFlow.md#3) |

---

## 6. Success Metrics
- **Zero Framework Violations:** 100% pure Vanilla JS, HTML5, CSS3 with 0 build dependency lockups.
- **Map Interaction Latency:** Leaflet map tiles load within < 1.5s; smooth fly-to transition < 800ms.
- **Search-to-Render Time:** From search click to map pin + weather card rendered in < 1.2s on normal broadband.
- **Code Quality Score:** 100% modular code separation (`api/`, `components/`, `state/`, `utils/`) with zero global variable pollution.
- **Responsive Adaptability:** Flawless rendering on mobile screens (375px), tablets (768px), and desktop widescreen monitors (1440px+).

---

## 7. Key Risks & Mitigation

| Risk | Impact | Mitigation Strategy | Reference |
| :--- | :--- | :--- | :--- |
| **Nominatim 429 Rate Limit** | Search fails if user clicks repeatedly | Implement 1s client debounce on search button, disable button while searching, and cache recent destination searches in `localStorage`. | [TRD.md §4](file:///s:/sayim/GDG/brain/TRD.md#4), [Rules.md §4](file:///s:/sayim/GDG/brain/Rules.md#4) |
| **OSRM Public Server Routing Failure** | Routes cross-ocean or over 5000km may fail | Fallback to straight-line geodesic polyline with an informative banner: "Driving route unavailable; displaying direct path." | [AppFlow.md §4](file:///s:/sayim/GDG/brain/AppFlow.md#4), [ImplementationPlan.md §4](file:///s:/sayim/GDG/brain/ImplementationPlan.md#4) |
| **Firebase Configuration Leakage / Quota** | Unauthorized DB writes or credential exposure | Use Firebase client config with restricted Firestore security rules (read/write access to valid trip documents only). | [TRD.md §2](file:///s:/sayim/GDG/brain/TRD.md#2), [Schema.md §3](file:///s:/sayim/GDG/brain/Schema.md#3) |
| **Map Rendering Glitches in Hidden Tabs** | Leaflet gray tile bug when container size changes | Call `map.invalidateSize()` whenever tab, drawer, or modal view changes. | [TRD.md §6](file:///s:/sayim/GDG/brain/TRD.md#6), [Rules.md §4](file:///s:/sayim/GDG/brain/Rules.md#4) |

---

## 8. Deliverables Checklist
- [ ] Complete Source Code: `index.html`, `styles/`, `scripts/` (Vanilla JS ES6 Modules).
- [ ] Working Map, Weather, Geocoding, Routing, and Firestore integrations.
- [ ] Comprehensive `README.md` with demo screenshots, architecture breakdown, setup guide, and API credits.
- [ ] Public GitHub repository with clean, atomic commit history.
- [ ] Live deployment URL hosted on GitHub Pages / Vercel with HTTPS enabled.
