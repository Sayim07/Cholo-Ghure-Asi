# Status Board & Tracker (Tracker.md) — Cholo Ghure Asssiii

> **Mandatory Reference:** This document tracks real-time implementation status, blockers, and architectural decisions throughout the development of `Cholo Ghure Asssiii`. Status values: `Not Started`, `In Progress`, `Blocked`, `Done`.

---

## 1. Phase Status Boards (Scroll-Driven Architecture Refactor)

### Phase 1: Scroll Skeleton, Lenis & Pinned Gate Scrub (P1)
| Task ID | Task Description | Owner | Status | Notes / Exit Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `T-P1.1`| Integrate Lenis smooth scroll & GSAP ScrollTrigger via CDN | Lead | **In Progress** | Smooth 60 FPS inertia scroll |
| `T-P1.2`| Build 5-scene HTML vertical scroll container shell | Frontend | **In Progress** | `#scene-gate`, `#scene-globe`, `#scene-explore`, `#scene-journey`, `#scene-saved` |
| `T-P1.3`| Implement scroll-scrubbed ERA Residence double gate doors | UI/UX | **In Progress** | Doors open proportional to scroll progress (0->1 scrub) |
| `T-P1.4`| Verify scroll pinning & smooth unpinning on desktop/mobile | QA | Not Started | **[BLOCKING EXIT CRITERIA]** Smooth gate scrub reveal |

---

### Phase 2: Globe Scroll-Link & Zoom-Through Dive Transition (P2)
| Task ID | Task Description | Owner | Status | Notes / Exit Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `T-P2.1`| Link 3D Earth rotation & scale to ScrollTrigger progress | 3D/WebGL | Not Started | Globe turns and scales as user scrolls scene 2 |
| `T-P2.2`| Continent chips + country dropdown + 3D pins integration | Frontend | Not Started | Retain smooth spherical camera orientation |
| `T-P2.3`| Implement seamless camera dive cross-fade into Leaflet map | UI/UX | Not Started | **[BLOCKING EXIT CRITERIA]** No hard cuts, buttery camera dive |

---

### Phase 3: Explore Map, Right-Side Detail Panel & Wikipedia Images (P3)
| Task ID | Task Description | Owner | Status | Notes / Exit Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `T-P3.1`| Edge-to-edge interactive Leaflet map with Carto/OSM tiles | Maps/GIS | Not Started | Full-screen interactive canvas (Primland style) |
| `T-P3.2`| Build `wikiImages.js` service resolving real photos | Backend/API | Not Started | Wikipedia REST + Wikimedia geosearch (NO wrong images) |
| `T-P3.3`| Build GSAP Right-Side Detail Panel (420px, glass, mobile sheet)| UI/UX | Not Started | Replaces centered modal; map stays draggable |
| `T-P3.4`| Custom SVG pulsing pins + category filter chips | Frontend | Not Started | Heritage, Hills, Beach, Nature, Food, Spiritual |
| `T-P3.5`| Live weather + travel modes + in-panel gate/mist reveal | Frontend | Not Started | **[BLOCKING EXIT CRITERIA]** Kolkata search shows Kolkata photo |

---

### Phase 4: Journey Timeline, Telemetry Scrub & Firebase Sync (P4)
| Task ID | Task Description | Owner | Status | Notes / Exit Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `T-4.1` | Pinned Journey Scene (Sticky left map + right scrolling days) | Frontend | Not Started | Map flies along day stops on scroll |
| `T-4.2` | Telemetry HUD numbers scrub with GSAP numerical tweens | UI/UX | Not Started | Distance, duration, budget, temperature scrub |
| `T-4.3` | Stop controls: reorder up/down, delete, edit budget, add day | Frontend | Not Started | Dynamic route recalculation via OSRM |
| `T-4.4` | Firebase Firestore cloud sync + offline localStorage fallback | Backend/DB | Not Started | **[BLOCKING EXIT CRITERIA]** Scroll scrubs telemetry and route |

---

### Phase 5: Visual Polish, SVG Icons, Responsive & Performance (P5)
| Task ID | Task Description | Owner | Status | Notes / Exit Criteria |
| :--- | :--- | :--- | :--- | :--- |
| `T-5.1` | Replace all raw emojis with 1.5px stroke inline SVG icons | UI/UX | Not Started | Crisp uniform iconography across app |
| `T-5.2` | Add magnetic button effects + card spotlight hover effect | UI/UX | Not Started | Subtle modern micro-interactions |
| `T-5.3` | IntersectionObserver to pause Three.js and particles offscreen | Perf | Not Started | 60 FPS performance optimization |
| `T-5.4` | Support `prefers-reduced-motion` & responsive audit (390-1440px)| QA | Not Started | **[FINAL CRITERIA]** Lighthouse > 80, zero console errors |
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
