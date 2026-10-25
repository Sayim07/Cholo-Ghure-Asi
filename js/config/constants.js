/* ==========================================================================
   Cholo Ghure Asssiii — System Constants (constants.js)
   ========================================================================== */

export const APP_CONSTANTS = {
  APP_NAME: "Cholo Ghure Asssiii",
  DEFAULT_CENTER: [22.5726, 88.3639], // Kolkata Coordinates [Lat, Lon]
  DEFAULT_ZOOM: 11,
  DETAIL_ZOOM: 14,
  NOMINATIM_DEBOUNCE_MS: 800,
  HTTP_TIMEOUT_MS: 8000,
  MAX_STOPS_PER_TRIP: 25,
  MAX_DAYS: 14,
  CURRENCY_SYMBOL: "₹",
  STORAGE_KEYS: {
    ACTIVE_TRIP: "cga_active_trip",
    THEME: "cga_theme",
    SEASON: "cga_season",
    SEARCH_HISTORY: "cga_search_history",
    SAVED_TRIPS: "cga_saved_trips"
  },
  SEASONS: {
    SUMMER: "summer",
    MONSOON: "monsoon",
    AUTUMN: "autumn",
    WINTER: "winter"
  },
  // Major continent anchors for 3D Globe camera focus
  CONTINENT_ANCHORS: {
    asia: { lat: 20.5937, lon: 78.9629, name: "Asia", defaultCountry: "India" },
    europe: { lat: 48.8566, lon: 2.3522, name: "Europe", defaultCountry: "France" },
    americas: { lat: 37.0902, lon: -95.7129, name: "Americas", defaultCountry: "United States" },
    africa: { lat: -1.2921, lon: 36.8219, name: "Africa", defaultCountry: "Kenya" },
    oceania: { lat: -25.2744, lon: 133.7751, name: "Oceania", defaultCountry: "Australia" }
  },
  POPULAR_COUNTRIES: [
    { name: "India", code: "IN", coords: [22.5726, 88.3639], zoom: 6, continent: "asia" },
    { name: "Japan", code: "JP", coords: [35.6762, 139.6503], zoom: 6, continent: "asia" },
    { name: "Switzerland", code: "CH", coords: [46.8182, 8.2275], zoom: 7, continent: "europe" },
    { name: "Italy", code: "IT", coords: [41.8719, 12.5674], zoom: 6, continent: "europe" },
    { name: "United States", code: "US", coords: [37.7749, -122.4194], zoom: 5, continent: "americas" },
    { name: "Egypt", code: "EG", coords: [26.8206, 30.8025], zoom: 6, continent: "africa" },
    { name: "Australia", code: "AU", coords: [-33.8688, 151.2093], zoom: 5, continent: "oceania" }
  ]
};
