/* ==========================================================================
   Cholo Ghure Asssiii — Telemetry HUD (TelemetryHUD.js)
   Inspired by Lightship RV (Live Travel Telemetry)
   ========================================================================== */

import { tripStore } from "../state/TripStore.js";
import { formatCurrency } from "../utils/helpers.js";

export class TelemetryHUD {
  constructor(hudSelector) {
    this.hud = document.querySelector(hudSelector);
    this.distVal = document.getElementById("hud-distance");
    this.timeVal = document.getElementById("hud-time");
    this.stopsVal = document.getElementById("hud-stops");
    this.budgetVal = document.getElementById("hud-budget");

    this.bindEvents();
    this.update();
  }

  bindEvents() {
    tripStore.subscribe("route:updated", () => this.update());
    tripStore.subscribe("stops:changed", () => this.update());
    tripStore.subscribe("trip:updated", () => this.update());
  }

  update() {
    const trip = tripStore.state.activeTrip;
    if (!trip) return;

    if (this.distVal) {
      this.distVal.textContent = trip.totalDistanceKm ? `${trip.totalDistanceKm} km` : "0 km";
    }

    if (this.timeVal) {
      if (trip.totalDurationMins) {
        const hrs = Math.floor(trip.totalDurationMins / 60);
        const mins = trip.totalDurationMins % 60;
        this.timeVal.textContent = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
      } else {
        this.timeVal.textContent = "0m";
      }
    }

    if (this.stopsVal) {
      const count = (trip.stops || []).length;
      this.stopsVal.textContent = `${count} stop${count === 1 ? "" : "s"}`;
    }

    if (this.budgetVal) {
      this.budgetVal.textContent = formatCurrency(trip.totalBudget || 0);
    }
  }
}
