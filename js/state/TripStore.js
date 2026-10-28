/* ==========================================================================
   Cholo Ghure Asssiii — Reactive State Store (TripStore.js)
   Pub/Sub Architecture conforming to Schema.md §3 & AppFlow.md §1
   ========================================================================== */

import { APP_CONSTANTS } from "../config/constants.js";
import { generateId } from "../utils/helpers.js";
import { TripBudgetEngine } from "../services/TripBudgetEngine.js";

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
      if (raw) {
        const trip = JSON.parse(raw);
        // Dynamically upgrade any stops that had the old static flat ₹3,000 budget
        if (trip && Array.isArray(trip.stops)) {
          trip.stops.forEach(s => {
            const sum = (s.budget?.stay || 0) + (s.budget?.food || 0) + (s.budget?.transport || 0) + (s.budget?.tickets || 0);
            if (sum === 3000 || !s.budget) {
              s.budget = TripBudgetEngine.estimateStopBudget(s);
            }
          });
          // Recalculate dynamic budget
          let total = 0;
          trip.stops.forEach(s => {
            if (s.budget) {
              total += (s.budget.stay || 0) + (s.budget.food || 0) + (s.budget.transport || 0) + (s.budget.tickets || 0);
            }
          });
          trip.totalBudget = total;
        }

        // Clean up legacy hardcoded placeholder title if user didn't explicitly customize it
        if (trip.title === "My Royal Bengal Expedition" && (!trip.stops || trip.stops.length === 0 || trip.stops.some(s => (s.name || "").toLowerCase().includes("paris") || (s.name || "").toLowerCase().includes("tokyo") || (s.name || "").toLowerCase().includes("agra")))) {
          if (trip.stops && trip.stops.length > 0) {
            trip.title = `${trip.stops[0].name} Journey`;
          } else {
            trip.title = "My Travel Journey";
          }
        }
        return trip;
      }
    } catch (e) {}

    return {
      id: generateId(),
      title: "My Travel Journey",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      daysCount: 2,
      totalDistanceKm: 0,
      totalDurationMins: 0,
      totalBudget: 0,
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

    // Calculate realistic dynamic budget based on geographic tier and location
    const dynamicBudget = TripBudgetEngine.estimateStopBudget(destination);

    const newStop = {
      stopId: generateId(),
      orderIndex: existingStops.length,
      dayNumber: this.state.activeDay,
      name: destination.shortName || destination.name,
      fullName: destination.name,
      latitude: destination.latitude,
      longitude: destination.longitude,
      type: destination.type || "attraction",
      budget: dynamicBudget,
      weatherSnapshot: weatherSnapshot || null
    };

    // Auto-update generic title if it's the first stop added
    if (existingStops.length === 0 && (this.state.activeTrip.title === "My Travel Journey" || this.state.activeTrip.title === "New Travel Journey")) {
      this.state.activeTrip.title = `${newStop.name} & Highlights Journey`;
    }

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
