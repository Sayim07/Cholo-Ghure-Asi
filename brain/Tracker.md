# Status Board & Tracker (Tracker.md) — Cholo Ghure Asssiii

> **Mandatory Reference:** This document tracks real-time implementation status, blockers, and architectural decisions throughout the development of `Cholo Ghure Asssiii`. Status values: `Not Started`, `In Progress`, `Blocked`, `Done`.

---

## 1. Phase Status Boards

### Phase 0: Project Scaffolding & Layout Shell
| Task ID | Task Description | Owner | Status | Notes / Exit Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `T-0.1` | Create project directory structure & `brain/` doc set | Architect | **Done** | Complete 8-document grounding set established |
| `T-0.2` | Create `index.html` with exact branding & layout slots | Frontend | Not Started | Branded title, navbar, panel wrappers |
| `T-0.3` | Setup `styles/variables.css` & base themes | Frontend | Not Started | Dark/light mode tokens defined |
| `T-0.4` | Connect Leaflet 1.9, GSAP 3.12, Lucide CDNs | Frontend | Not Started | CDN scripts and stylesheets loaded |
| `T-0.5` | Verify split-screen responsive desktop & mobile shells | Frontend | Not Started | **[BLOCKING EXIT CRITERIA]** Zero console errors |

---

### Phase 1: Interactive Map & Leaflet Engine
| Task ID | Task Description | Owner | Status | Notes / Exit Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `T-1.1` | Implement `MapManager.js` instance & OSM tiles | Maps/GIS | Not Started | Map centered on Kolkata `[22.5726, 88.3639]` |
| `T-1.2` | Design custom SVG markers (Origin, Waypoint, Finish)| Maps/GIS | Not Started | High-contrast glowing map pins |
| `T-1.3` | Implement map click listener with reverse coordinates | Maps/GIS | Not Started | User can tap map to drop pins |
| `T-1.4` | Implement `map.invalidateSize()` resize handler | Maps/GIS | Not Started | **[BLOCKING EXIT CRITERIA]** No grey tile glitches |

---

### Phase 2: Geocoding & Live Weather Integration
| Task ID | Task Description | Owner | Status | Notes / Exit Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `T-2.1` | Build `NominatimService.js` with 1s debounce & User-Agent | Backend/API | Not Started | Respects OSM usage policy |
| `T-2.2` | Build `WeatherService.js` for Open-Meteo REST API | Backend/API | Not Started | Fetches temp, humidity, wind, code |
| `T-2.3` | Create `weatherIcons.js` WMO code mapper | Frontend | Not Started | Maps codes 0-99 to Lucide icons |
| `T-2.4` | Implement `DestinationCard.js` with live weather badge | Frontend | Not Started | **[BLOCKING EXIT CRITERIA]** Search displays temp & map pin |

---

### Phase 3: Route Planning & Polyline Rendering
| Task ID | Task Description | Owner | Status | Notes / Exit Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `T-3.1` | Build `RoutingService.js` calling OSRM driving API | Backend/API | Not Started | Multi-point driving route query |
| `T-3.2` | Parse OSRM GeoJSON & render Leaflet polyline | Maps/GIS | Not Started | Electric cyan glowing road line |
| `T-3.3` | Implement route summary badge (Distance km, duration) | Frontend | Not Started | Floating map metric overlay |
| `T-3.4` | Fallback straight-line polyline if OSRM fails | Maps/GIS | Not Started | **[BLOCKING EXIT CRITERIA]** Dynamic road route rendering |

---

### Phase 4: Itinerary Management & Multi-Day Organization
| Task ID | Task Description | Owner | Status | Notes / Exit Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `T-4.1` | Build `TripStore.js` centralized state manager | Frontend | Not Started | Pub/Sub state reactivity |
| `T-4.2` | Implement `ItineraryView.js` day-wise timeline list | Frontend | Not Started | Day 1, Day 2 tabs with stop cards |
| `T-4.3` | Add stop reorder controls (`▲` Up, `▼` Down) & delete | Frontend | Not Started | Triggers route recalculation |
| `T-4.4` | Build `BudgetPlanner.js` cost estimation by category | Frontend | Not Started | **[BLOCKING EXIT CRITERIA]** Stops, reorder, budget update |

---

### Phase 5: Firebase Firestore Cloud Integration
| Task ID | Task Description | Owner | Status | Notes / Exit Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `T-5.1` | Configure `firebase.config.js` with Web SDK v10 | Backend/DB | Not Started | Modular CDN imports |
| `T-5.2` | Build `FirebaseService.js` (`saveTrip`, `getTrips`, `delete`) | Backend/DB | Not Started | CRUD in Firestore `trips` collection |
| `T-5.3` | Implement "Saved Trips" drawer & loader | Frontend | Not Started | Restore previous itineraries |
| `T-5.4` | Implement `localStorage` offline fallback | Frontend | Not Started | **[BLOCKING EXIT CRITERIA]** Cloud save and reload working |

---

### Phase 6: Visual Polish, Testing & Deployment
| Task ID | Task Description | Owner | Status | Notes / Exit Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `T-6.1` | Integrate GSAP micro-interactions & card entrance staggers | UI/UX | Not Started | Fluid 60 FPS feedback |
| `T-6.2` | Add dark/light mode toggle with theme memory | Frontend | Not Started | Instant CSS theme swap |
| `T-6.3` | Add `@media print` clean itinerary export | Frontend | Not Started | Printable trip summary |
| `T-6.4` | Cross-device responsiveness audit (Mobile, Tablet, Desktop) | QA/Test | Not Started | Zero broken layouts |
| `T-6.5` | Write comprehensive `README.md` & deploy to GitHub/Vercel | Lead | Not Started | **[FINAL CRITERIA]** Working live URL + public repo |

---

## 2. Blockers Log
*Currently no active blockers.*

| Blocker ID | Date | Description | Impacted Tasks | Resolution / Action |
| :--- | :--- | :--- | :--- | :--- |
| *None* | - | - | - | - |

---

## 3. Decisions Log

| Date | Decision | Reason | Doc Updated? |
| :--- | :--- | :--- | :--- |
| 2026-10-25 | App name locked as **`Cholo Ghure Asssiii`** | Chosen brand identity representing Bengali wanderlust for GDG selection | Yes ([PRD.md §1](file:///s:/sayim/GDG/brain/PRD.md#1)) |
| 2026-10-25 | Strictly pure Vanilla JS (ESM) with zero UI frameworks | Hard selection requirement forbidding React/Next/Vue | Yes ([TRD.md §2](file:///s:/sayim/GDG/brain/TRD.md#2)) |
| 2026-10-25 | Firebase Firestore locked as default database | Client-side CDN modular SDK enables zero-server setup with offline cache | Yes ([TRD.md §3](file:///s:/sayim/GDG/brain/TRD.md#3)) |
| 2026-10-25 | Leaflet.js + OSM Tiles locked over Mapbox/Google | 100% free, zero credit card requirement, zero paid access token risks | Yes ([TRD.md §2](file:///s:/sayim/GDG/brain/TRD.md#2)) |
| 2026-10-25 | Open-Meteo locked as weather service | Free non-commercial REST API using coordinates with 0 API key headaches | Yes ([TRD.md §4](file:///s:/sayim/GDG/brain/TRD.md#4)) |
