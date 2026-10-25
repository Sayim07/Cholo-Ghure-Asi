# ✈️ Cholo Ghure Asssiii (চলো ঘুরে আসি)
### *Next-Gen Luxury Travel & Multi-Day Itinerary Planner*

> **GDG BPPIMT Tech Team Selection — 3rd Year Assignment**  
> **Official Application Branding:** `Cholo Ghure Asssiii`  
> **Live Web App:** [https://cholo-ghure-asi.vercel.app](https://cholo-ghure-asi.vercel.app) *(or your Vercel deployment link)*  
> **Source Repository:** [Sayim07/Cholo-Ghure-Asi](https://github.com/Sayim07/Cholo-Ghure-Asi)

---

## 📖 1. Overview & Objectives

**Cholo Ghure Asssiii** is an ultra-premium, high-performance travel discovery and multi-day itinerary planner. Designed without heavy framework overhead using pure modern **HTML5, Vanilla JavaScript (ES6+ Modules), and CSS3**, it fuses real-time geospatial intelligence, live atmospheric weather analytics, 3D cartographic voyages, and cloud persistence.

Engineered with an original luxury editorial design language and bespoke micro-interactions, it delivers:
- **3D Voyager Globe:** An interactive rotating Earth (Three.js WebGL) with high-resolution NASA cartography, dynamic cloud layers, and clickable landmark pins.
- **Atmospheric 4-Season Engine:** Real-time seasonal weather perspectives (*Summer ☀️, Monsoon 🌧️, Autumn 🍂, Winter ❄️*) with live canvas particle physics.
- **Thematic Architectural Gate Portal:** Cinematic double-door portal reveals customized to destination types (*Mountain mist, Coastal waves, Royal heritage palace doors, Rainforest canopies*).
- **Interactive Leaflet Cartography:** OpenStreetMap tiles, custom glowing SVG waypoint pins, and radar ripples.
- **Driving Route Engine (OSRM):** Instant multi-stop road polyline plotting, distance (km), and drive duration calculation.
- **Multi-Day Itinerary & Budget Manager:** Day-wise scheduling (Day 1, Day 2...), stop reordering (`▲` Up, `▼` Down), deletion, and itemized budget calculations (Accommodation, Food, Transport, Tickets).
- **Firebase Firestore Cloud Synchronization:** Zero-server cloud persistence with automatic offline `localStorage` fallback.

---

## 🛠️ 2. Technology Stack & Architecture

| Layer | Technology | Details & Role |
| :--- | :--- | :--- |
| **Frontend Core** | HTML5 + CSS3 + Vanilla JavaScript | Pure ES6+ native browser modules (`type="module"`), zero bundler/npm build bloat. |
| **3D WebGL Engine** | Three.js (r128 CDN) | Realistic 2048px NASA Earth texture, ocean specular maps, atmospheric glow, and spherical raycasting. |
| **Micro-Animations** | GSAP 3.12 (GreenSock CDN) | 60 FPS hardware-accelerated portal door parting, card entrance staggers, and camera zooms. |
| **Mapping Engine** | Leaflet.js v1.9.4 | Interactive map container, zoom controls, attribution, and custom DIV icon markers. |
| **Basemap Cartography** | OpenStreetMap (Standard Carto) | Free, open-source cartographic map tiles. |
| **Geocoding Search** | OpenStreetMap Nominatim API | City/landmark geocoding with 800ms client debouncing and custom User-Agent. |
| **Weather Analytics** | Open-Meteo REST API | Real-time temperature (°C), WMO weather condition icons, humidity (%), and wind speed (km/h). |
| **Driving Routing** | OSRM (Project OSRM Router) | Waypoint sequence polyline calculation, distance in kilometers, driving duration in hours/minutes. |
| **Nearby Attractions**| OpenStreetMap Overpass POI API | Queries tourist attractions, museums, viewpoints, and monuments within a 10km radius. |
| **Cloud Database** | Google Firebase Firestore (Web SDK v10) | Real-time NoSQL cloud document storage in the `trips` collection with offline resilience. |
| **Hosting & CI/CD** | Vercel / GitHub Pages | Static HTTPS zero-config hosting via `vercel.json`. |

---

## 📂 3. Repository Directory Structure

```
Cholo-Ghure-Asi/
├── brain/                         # Grounding Architecture & Specifications
│   ├── PRD.md                     # Product Requirements Document
│   ├── TRD.md                     # Technical Requirements Document
│   ├── AppFlow.md                 # Data pipelines & lifecycle diagrams
│   ├── Design.md                  # Design system, color tokens & tokens
│   ├── Schema.md                  # Database & API JSON contracts
│   ├── ImplementationPlan.md      # Phased execution roadmap with code snippets
│   ├── Tracker.md                 # Real-time task board & decisions log
│   └── Rules.md                   # AI grounding rules & non-negotiables
├── index.html                     # Application entry point
├── vercel.json                    # Vercel deployment routing configuration
├── styles/
│   ├── variables.css              # Design tokens (Champagne Silk, Gold, Azure, 4-Seasons)
│   ├── main.css                   # Global reset, typography, responsive media queries
│   ├── globe.css                  # 3D Voyager Globe and continent selection styles
│   ├── map.css                    # Leaflet map container, custom SVG pins & popups
│   ├── gate.css                   # Thematic architectural gate reveal door styles
│   ├── components.css             # Search bar, telemetry HUD, weather widgets, toasts
│   └── itinerary.css              # Itinerary drawer, day tabs, reorder cards & budget
└── scripts/
    ├── main.js                    # Application orchestrator & lifecycle bootstrapper
    ├── config/
    │   ├── constants.js           # Fixed scope constants, continents & country anchors
    │   └── firebase.config.js     # Firebase modular SDK initialization & offline fallback
    ├── services/
    │   ├── NominatimService.js    # Geocoding search & rate limiting
    │   ├── WeatherService.js      # Open-Meteo weather API caller
    │   ├── RoutingService.js      # OSRM driving routes & geometry calculations
    │   ├── AttractionsService.js  # Nearby POI & tourist spots query
    │   └── FirebaseService.js     # Firestore document CRUD & local storage sync
    ├── state/
    │   └── TripStore.js           # Centralized Pub/Sub reactive state store
    ├── components/
    │   ├── VoyagerGlobe.js        # 3D WebGL Earth globe with raycaster pin clicks
    │   ├── SeasonEngine.js        # Canvas particle physics (Rain, Leaves, Snow, Shimmer)
    │   ├── PortalGate.js          # Thematic gate parting reveal modal & travel modes
    │   ├── MapManager.js          # Leaflet map, layers, markers, polylines
    │   ├── SearchBar.js           # Destination search bar with autocomplete suggestions
    │   ├── ItineraryView.js       # Day-wise itinerary timeline, reorder & budget modal
    │   ├── TelemetryHUD.js        # Lightship RV floating telemetry counter pills
    │   ├── SavedTripsModal.js     # Cloud trip archive viewer, loader, and deleter
    │   └── Toast.js               # Glassmorphic user notification alerts
    └── utils/
        ├── helpers.js             # Formatting, sanitization, debounce
        └── weatherIcons.js        # WMO weather code to icon/emoji mapper
```

---

## 🚀 4. How to Run Locally

Because this project is built using native **ECMAScript Modules (ESM)**, it requires a local HTTP server to run in your browser:

### Option A: Using Python (Recommended & Fastest)
```bash
# Clone the repository
git clone https://github.com/Sayim07/Cholo-Ghure-Asi.git
cd Cholo-Ghure-Asi

# Start local server
python -m http.server 8080
```
Open **`http://localhost:8080`** in any modern web browser.

### Option B: Using Node.js `npx`
```bash
npx serve -l 8080
```

### Option C: VS Code Live Server Extension
Right-click on `index.html` and select **"Open with Live Server"**.

---

## 🔐 5. Database & API Configuration

### Firebase Firestore Setup (Optional Custom Project)
The project comes pre-configured with client-side fallback resilience. To connect your own Firebase project:
1. Open [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Enable **Cloud Firestore** in test mode or with the following security rule:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /trips/{tripId} {
         allow read, write: if true;
       }
     }
   }
   ```
3. Copy your Web App configuration keys into [scripts/config/firebase.config.js](file:///s:/sayim/GDG/scripts/config/firebase.config.js).

---

## 🏆 6. Evaluation Criteria Compliance

- **⚙️ Functionality (40%):** Complete Nominatim geocoding, Open-Meteo real-time weather integration, Leaflet interactive map with custom pins, OSRM multi-stop driving routing, day-wise itinerary management, itemized budget calculator, and Firestore cloud saving.
- **🧹 Code Quality (30%):** 100% Vanilla JS using ES6 modules. Strict Pub/Sub state store separation, separate API services, sanitized DOM templates, and zero framework bloat.
- **🎨 UI/UX (20%):** Bright champagne luxury editorial aesthetics, interactive 3D WebGL Earth globe, 4-Season particle physics, and ERA Residence-inspired thematic portal gate reveals.
- **📚 Documentation (10%):** Comprehensive 8-file `brain/` grounding specification set, atomic Git commit history, and complete instructions.

---

*Crafted with ❤️ for GDG BPPIMT Tech Team Selection 2026.*
