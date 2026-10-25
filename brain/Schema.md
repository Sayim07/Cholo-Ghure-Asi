# Data, File, and API Contracts (Schema.md) — Cholo Ghure Asssiii

> **Strict AI Instruction:** This is the exact contract every module must follow. If a field is not defined here, do not invent it; add it here first. No other endpoints/fields should be added without updating this section first.

---

## 1. Project Directory & File Structure

```
s:/sayim/GDG/
├── brain/                         # Grounding documentation set
│   ├── PRD.md
│   ├── TRD.md
│   ├── AppFlow.md
│   ├── Design.md
│   ├── Schema.md
│   ├── ImplementationPlan.md
│   ├── Tracker.md
│   └── Rules.md
├── index.html                     # Main application entry point
├── styles/
│   ├── variables.css              # Design tokens, color system, and themes
│   ├── main.css                   # Global reset, typography, base layout
│   ├── map.css                    # Leaflet customizations, popups, route badges
│   ├── components.css             # Search, cards, weather widgets, toasts
│   └── itinerary.css              # Timeline list, reordering, day tabs, budget
├── scripts/
│   ├── main.js                    # Application orchestrator & lifecycle boot
│   ├── config/
│   │   ├── constants.js           # Fixed scope constants and app settings
│   │   └── firebase.config.js     # Firebase credentials and initialization
│   ├── services/
│   │   ├── NominatimService.js    # Geocoding search & coordinate resolution
│   │   ├── WeatherService.js      # Open-Meteo current & forecast API
│   │   ├── RoutingService.js      # OSRM driving route calculations
│   │   └── FirebaseService.js     # Firestore CRUD for trips collection
│   ├── state/
│   │   └── TripStore.js           # Centralized reactive state store
│   ├── components/
│   │   ├── MapManager.js          # Leaflet map, layers, markers, polylines
│   │   ├── SearchBar.js           # Search input, debounce, results renderer
│   │   ├── DestinationCard.js     # Destination overview and weather card
│   │   ├── ItineraryView.js       # Timeline stops, drag/reorder, day tabs
│   │   ├── BudgetPlanner.js       # Cost breakdown and calculations
│   │   └── Toast.js               # Glassmorphic user notification alerts
│   └── utils/
│   │   ├── helpers.js             # Formatting, sanitization, debounce
│   │   └── weatherIcons.js        # WMO weather code to icon/emoji mapper
└── assets/
    ├── icons/                     # SVG icons (travel, weather, actions)
    └── images/                    # Default place imagery and placeholders
```

---

## 2. Fixed Scope Constants

Defined in `scripts/config/constants.js`:

```javascript
export const APP_CONSTANTS = {
  APP_NAME: "Cholo Ghure Asssiii",
  DEFAULT_CENTER: [22.5726, 88.3639], // Kolkata Coordinates [Lat, Lon]
  DEFAULT_ZOOM: 11,
  DETAIL_ZOOM: 14,
  MAX_STOPS_PER_TRIP: 25,
  MAX_DAYS: 14,
  NOMINATIM_DEBOUNCE_MS: 800,
  HTTP_TIMEOUT_MS: 8000,
  STORAGE_KEYS: {
    ACTIVE_TRIP: "cga_active_trip",
    THEME: "cga_theme",
    SEARCH_HISTORY: "cga_search_history"
  }
};
```

---

## 3. Database Schema (Firebase Firestore)

All persistent itineraries are stored in the top-level collection **`trips`**.

### 3.1 Trip Document Schema (`trips/{tripId}`)

| Field Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Unique Firestore Document ID. |
| `title` | `string` | Yes | Human-readable trip title (e.g., *"Weekend in Darjeeling"*). |
| `createdAt` | `timestamp` | Yes | ISO 8601 string or Firestore Timestamp of creation. |
| `updatedAt` | `timestamp` | Yes | ISO 8601 string or Firestore Timestamp of last modification. |
| `totalDistanceKm` | `number` | Yes | Sum of route distances across all stops (e.g., `148.5`). |
| `totalDurationMins`| `number` | Yes | Estimated driving time across all stops (e.g., `210`). |
| `totalBudget` | `number` | Yes | Sum of estimated expenses across all stops in INR (₹). |
| `daysCount` | `number` | Yes | Total number of planned travel days (e.g., `3`). |
| `stops` | `array<Stop>` | Yes | Ordered array of `Stop` objects (see §3.2). |

### 3.2 Stop Sub-Object Schema (`Stop`)

| Field Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `stopId` | `string` | Yes | UUID or timestamp identifier for the stop. |
| `orderIndex` | `number` | Yes | 0-indexed position within the route sequence. |
| `dayNumber` | `number` | Yes | Travel day assignment (1, 2, 3...). |
| `name` | `string` | Yes | Formatted name of destination (e.g., *"Victoria Memorial, Kolkata"*). |
| `latitude` | `number` | Yes | Floating-point geographic latitude (e.g., `22.5448`). |
| `longitude` | `number` | Yes | Floating-point geographic longitude (e.g., `88.3426`). |
| `type` | `string` | No | Place category (e.g., `"monument"`, `"city"`, `"park"`). |
| `notes` | `string` | No | User-entered visit notes or highlights. |
| `budget` | `object` | Yes | Expense breakdown: `{ stay: number, food: number, transport: number, tickets: number }`. |
| `weatherSnapshot` | `object` | No | Cached snapshot `{ temp: number, condition: string, icon: string }`. |

---

## 4. External REST API Schemas & Contracts

### 4.1 OpenStreetMap Nominatim Geocoding API
- **Endpoint:** `GET https://nominatim.openstreetmap.org/search?q={query}&format=json&addressdetails=1&limit=5`
- **Request Headers:** `User-Agent: CholoGhureAsssiii-TripPlanner/1.0`
- **Response Format Example:**
```json
[
  {
    "place_id": 287492104,
    "lat": "22.572645",
    "lon": "88.363892",
    "display_name": "Kolkata, West Bengal, India",
    "type": "city",
    "boundingbox": ["22.45", "22.62", "88.27", "88.42"],
    "address": {
      "city": "Kolkata",
      "state": "West Bengal",
      "country": "India"
    }
  }
]
```

### 4.2 Open-Meteo Weather API
- **Endpoint:** `GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
- **Response Format Example:**
```json
{
  "latitude": 22.57,
  "longitude": 88.36,
  "current": {
    "time": "2026-10-25T12:00",
    "temperature_2m": 29.4,
    "relative_humidity_2m": 62,
    "weather_code": 1,
    "wind_speed_10m": 12.6
  },
  "daily": {
    "time": ["2026-10-25", "2026-10-26", "2026-10-27"],
    "weather_code": [1, 2, 61],
    "temperature_2m_max": [31.2, 30.8, 28.5],
    "temperature_2m_min": [22.1, 23.0, 21.8]
  }
}
```

### 4.3 OSRM Routing API
- **Endpoint:** `GET https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson`
- **Response Format Example:**
```json
{
  "code": "Ok",
  "routes": [
    {
      "geometry": {
        "coordinates": [
          [88.3638, 22.5726],
          [88.3426, 22.5448]
        ],
        "type": "LineString"
      },
      "distance": 5420.8,
      "duration": 940.2,
      "weight_name": "routability"
    }
  ],
  "waypoints": [
    { "hint": "abc...", "distance": 4.2, "name": "College Street", "location": [88.3638, 22.5726] },
    { "hint": "xyz...", "distance": 1.1, "name": "Queens Way", "location": [88.3426, 22.5448] }
  ]
}
```

---

## 5. WMO Weather Code Contract

The application maps numeric WMO weather codes to user-facing descriptions and Lucide icon classes:

| WMO Code Range | Description | Weather Condition Tag | Visual Icon |
| :--- | :--- | :--- | :--- |
| `0` | Clear Sky | Sunny / Clear | ☀️ `sun` |
| `1, 2, 3` | Mainly Clear, Partly Cloudy, Overcast | Partly Cloudy | ⛅ `cloud-sun` |
| `45, 48` | Fog and Depositing Rime Fog | Foggy | 🌫️ `cloud-fog` |
| `51, 53, 55`| Drizzle (Light, Moderate, Dense) | Drizzle | 🌦️ `cloud-drizzle` |
| `61, 63, 65`| Rain (Slight, Moderate, Heavy) | Rainy | 🌧️ `cloud-rain` |
| `71, 73, 75`| Snow Fall | Snow | ❄️ `snowflake` |
| `80, 81, 82`| Rain Showers | Showers | 🌦️ `cloud-sun-rain` |
| `95, 96, 99`| Thunderstorm with or without Hail | Thunderstorm | ⛈️ `cloud-lightning` |
