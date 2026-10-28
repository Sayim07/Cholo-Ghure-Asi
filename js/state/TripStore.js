/* ==========================================================================
   Cholo Ghure Asssiii — Reactive State Store (TripStore.js)
   Pub/Sub Architecture conforming to Schema.md §3 & AppFlow.md §1
   ========================================================================== */

import { APP_CONSTANTS } from "../config/constants.js";
import { generateId } from "../utils/helpers.js";

class TripStore {
  constructor() {
    this.listeners = new Map();

    const storedSeason = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.SEASON) || APP_CONSTANTS.SEASONS.SUMMER;

    this.state = {
      activeSeason: storedSeason,
      activeDay: 1,
      currentDestination: null,
      currentRoute: null,
      isGlobeView: true,
      activeTrip: this.loadInitialTrip()
    };
  }

  loadInitialTrip() {
    try {
      const raw = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.ACTIVE_TRIP);
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    return {
      id: generateId(),
      title: "My Royal Bengal Expedition",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      daysCount: 2,
      totalDistanceKm: 0,
      totalDurationMins: 0,
      totalBudget: 4500,
      stops: []
    };
  }

  persistTrip() {
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.ACTIVE_TRIP, JSON.stringify(this.state.activeTrip));
    this.emit("trip:updated", this.state.activeTrip);
  }

  // --- Subscriptions ---
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => {
      const arr = this.listeners.get(event) || [];
      this.listeners.set(event, arr.filter(cb => cb !== callback));
    };
  }

  emit(event, payload) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(payload);
        } catch (e) {
          console.error(`Error in event listener for ${event}:`, e);
        }
      });
    }
  }

  // --- Actions ---
  setSeason(season) {
    this.state.activeSeason = season;
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.SEASON, season);
    this.emit("season:changed", season);
  }

  setActiveDay(dayNumber) {
    this.state.activeDay = dayNumber;
    this.emit("day:changed", dayNumber);
  }

  addDay() {
    if (this.state.activeTrip.daysCount < APP_CONSTANTS.MAX_DAYS) {
      this.state.activeTrip.daysCount += 1;
      this.setActiveDay(this.state.activeTrip.daysCount);
      this.persistTrip();
    }
  }

  setGlobeView(isOpen) {
    this.state.isGlobeView = isOpen;
    this.emit("view:mode", isOpen);
  }

  setCurrentDestination(destination) {
    this.state.currentDestination = destination;
    this.emit("destination:selected", destination);
  }

  addStop(destination, weatherSnapshot = null) {
    const existingStops = this.state.activeTrip.stops;
    if (existingStops.length >= APP_CONSTANTS.MAX_STOPS_PER_TRIP) {
      throw new Error("Max itinerary stops reached (25).");
    }

    const newStop = {
      stopId: generateId(),
      orderIndex: existingStops.length,
      dayNumber: this.state.activeDay,
      name: destination.shortName || destination.name,
      fullName: destination.name,
      latitude: destination.latitude,
      longitude: destination.longitude,
      type: destination.type || "attraction",
      budget: {
        stay: 1500,
        food: 800,
        transport: 500,
        tickets: 200
      },
      weatherSnapshot: weatherSnapshot || null
    };

    this.state.activeTrip.stops.push(newStop);
    this.recalculateBudget();
    this.persistTrip();
    this.emit("stops:changed", this.state.activeTrip.stops);
    return newStop;
  }

  removeStop(stopId) {
    this.state.activeTrip.stops = this.state.activeTrip.stops.filter(s => s.stopId !== stopId);
    this.reindexStops();
    this.recalculateBudget();
    this.persistTrip();
    this.emit("stops:changed", this.state.activeTrip.stops);
  }

  reorderStop(stopId, direction) {
    // direction: -1 (up) or 1 (down)
    const stops = this.state.activeTrip.stops;
    const idx = stops.findIndex(s => s.stopId === stopId);
    if (idx === -1) return;

    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= stops.length) return;

    const temp = stops[idx];
    stops[idx] = stops[targetIdx];
    stops[targetIdx] = temp;

    this.reindexStops();
    this.persistTrip();
    this.emit("stops:changed", stops);
  }

  reindexStops() {
    this.state.activeTrip.stops.forEach((s, i) => {
      s.orderIndex = i;
    });
  }

  recalculateBudget() {
    let total = 0;
    this.state.activeTrip.stops.forEach(s => {
      if (s.budget) {
        total += (s.budget.stay || 0) + (s.budget.food || 0) + (s.budget.transport || 0) + (s.budget.tickets || 0);
      }
    });
    this.state.activeTrip.totalBudget = total;
  }

  setRouteSummary(distanceKm, durationMins, geoJson) {
    this.state.activeTrip.totalDistanceKm = distanceKm;
    this.state.activeTrip.totalDurationMins = durationMins;
    this.state.currentRoute = geoJson;
    this.persistTrip();
    this.emit("route:updated", { distanceKm, durationMins, geoJson });
  }

  loadSavedTrip(trip) {
    this.state.activeTrip = trip;
    this.state.activeDay = 1;
    this.persistTrip();
    this.emit("trip:loaded", trip);
    this.emit("stops:changed", trip.stops);
  }

  clearAllStops() {
    this.state.activeTrip.stops = [];
    this.state.activeTrip.totalDistanceKm = 0;
    this.state.activeTrip.totalDurationMins = 0;
    this.state.activeTrip.totalBudget = 0;
    this.state.currentRoute = null;
    this.persistTrip();
    this.emit("stops:changed", []);
    this.emit("route:updated", { distanceKm: 0, durationMins: 0, geoJson: null });
  }
}

export const tripStore = (typeof window !== "undefined" && window.__tripStoreInstance)
  ? window.__tripStoreInstance
  : new TripStore();

if (typeof window !== "undefined") {
  window.__tripStoreInstance = tripStore;
  window.tripStore = tripStore;
}
