/* ==========================================================================
   Cholo Ghure Asssiii — System Constants (constants.js)
   ========================================================================== */

import { ALL_COUNTRIES } from "../data/countriesData.js";

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
  POPULAR_COUNTRIES: ALL_COUNTRIES
};
