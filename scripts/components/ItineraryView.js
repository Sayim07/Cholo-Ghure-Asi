/* ==========================================================================
   Cholo Ghure Asssiii — Itinerary & Multi-Day Manager (ItineraryView.js)
   Conforms to PRD.md §5 (F-05, F-06, F-08)
   ========================================================================== */

import { tripStore } from "../state/TripStore.js";
import { FirebaseService } from "../services/FirebaseService.js";
import { toast } from "./Toast.js";
import { formatCurrency, escapeHTML } from "../utils/helpers.js";

export class ItineraryView {
  constructor(drawerId) {
    this.drawer = document.getElementById(drawerId);
    this.dayTabsBar = document.getElementById("itinerary-day-tabs");
    this.stopsList = document.getElementById("itinerary-stops-list");
    this.budgetVal = document.getElementById("itinerary-budget-total");
    this.saveCloudBtn = document.getElementById("btn-save-cloud-trip");
    this.toggleDrawerBtn = document.getElementById("btn-toggle-itinerary");

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    // Drawer toggle
    if (this.toggleDrawerBtn) {
      this.toggleDrawerBtn.addEventListener("click", () => {
        this.drawer.classList.toggle("collapsed");
      });
    }

    const closeBtn = document.getElementById("close-drawer-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.drawer.classList.add("collapsed");
      });
    }

    // Save Trip to Cloud / Firestore
    if (this.saveCloudBtn) {
      this.saveCloudBtn.addEventListener("click", () => this.handleCloudSave());
    }

    // Subscribe to state changes
    tripStore.subscribe("stops:changed", () => this.render());
    tripStore.subscribe("day:changed", () => this.render());
    tripStore.subscribe("trip:updated", () => this.render());
    tripStore.subscribe("trip:loaded", () => this.render());
  }

  render() {
    this.renderDayTabs();
    this.renderStops();
    this.renderBudget();
  }

  renderDayTabs() {
    if (!this.dayTabsBar) return;
    this.dayTabsBar.innerHTML = "";

    const daysCount = tripStore.state.activeTrip.daysCount || 2;
    const activeDay = tripStore.state.activeDay || 1;

    for (let d = 1; d <= daysCount; d++) {
      const tab = document.createElement("button");
      tab.className = `day-tab ${d === activeDay ? "active" : ""}`;
      tab.textContent = `Day ${d}`;
      tab.addEventListener("click", () => {
        tripStore.setActiveDay(d);
      });
      this.dayTabsBar.appendChild(tab);
    }

    // + Add Day button
    const addDayBtn = document.createElement("button");
    addDayBtn.className = "add-day-btn";
    addDayBtn.textContent = "+ Day";
    addDayBtn.title = "Add travel day";
    addDayBtn.addEventListener("click", () => {
      tripStore.addDay();
      toast.info(`Travel Day ${tripStore.state.activeTrip.daysCount} added!`);
    });
    this.dayTabsBar.appendChild(addDayBtn);
  }

  renderStops() {
    if (!this.stopsList) return;
    this.stopsList.innerHTML = "";

    const allStops = tripStore.state.activeTrip.stops || [];
    const activeDay = tripStore.state.activeDay || 1;

    // Filter stops by currently selected day
    const dayStops = allStops.filter(s => s.dayNumber === activeDay);

    if (dayStops.length === 0) {
      this.stopsList.innerHTML = `
        <div style="text-align: center; padding: 40px 10px; color: var(--cga-text-muted);">
          <div style="font-size: 32px; margin-bottom: 8px;">🎒</div>
          <div style="font-weight: 600; color: var(--cga-text-primary); margin-bottom: 4px;">No stops planned for Day ${activeDay}</div>
          <p style="font-size: 12px;">Search a destination above or click on the map to add your first stop!</p>
        </div>
      `;
      return;
    }

    dayStops.forEach((stop, index) => {
      const card = document.createElement("div");
      card.className = "itinerary-stop-card";

      const weather = stop.weatherSnapshot;
      const weatherTag = weather 
        ? `<span class="stop-weather-tag">${weather.icon} ${weather.temperature}°C</span>` 
        : "";

      card.innerHTML = `
        <div class="stop-badge-number">${index + 1}</div>
        <div class="stop-details">
          <div class="stop-name">${escapeHTML(stop.name)}</div>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
            ${weatherTag}
            <span style="font-size: 11px; color: var(--cga-text-muted); font-family: var(--cga-font-mono);">
              ${stop.latitude.toFixed(2)}°, ${stop.longitude.toFixed(2)}°
            </span>
          </div>
        </div>
        <div class="stop-actions-col">
          <button class="reorder-btn btn-up" title="Move Up">▲</button>
          <button class="reorder-btn btn-down" title="Move Down">▼</button>
          <button class="delete-stop-btn btn-del" title="Remove stop">✕</button>
        </div>
      `;

      // Event listeners
      card.querySelector(".btn-up").addEventListener("click", () => {
        tripStore.reorderStop(stop.stopId, -1);
      });

      card.querySelector(".btn-down").addEventListener("click", () => {
        tripStore.reorderStop(stop.stopId, 1);
      });

      card.querySelector(".btn-del").addEventListener("click", () => {
        tripStore.removeStop(stop.stopId);
        toast.info(`"${stop.name}" removed.`);
      });

      this.stopsList.appendChild(card);
    });
  }

  renderBudget() {
    if (!this.budgetVal) return;
    const total = tripStore.state.activeTrip.totalBudget || 0;
    this.budgetVal.textContent = formatCurrency(total);
  }

  async handleCloudSave() {
    const trip = tripStore.state.activeTrip;
    if (!trip.stops || trip.stops.length === 0) {
      toast.error("Add at least 1 destination before saving your trip!");
      return;
    }

    const originalText = this.saveCloudBtn.innerHTML;
    this.saveCloudBtn.innerHTML = "<span>Saving...</span>";
    this.saveCloudBtn.disabled = true;

    try {
      const res = await FirebaseService.saveTrip(trip);
      if (res.mode === "cloud") {
        toast.success("Trip synced to Firebase Firestore cloud! ☁️");
      } else {
        toast.success("Trip saved securely to local travel archive! 💾");
      }
    } catch (e) {
      toast.error("Could not save trip. Saved locally.");
    } finally {
      this.saveCloudBtn.innerHTML = originalText;
      this.saveCloudBtn.disabled = false;
    }
  }
}
