/* ==========================================================================
   Cholo Ghure Asssiii — Saved Trips Archive Modal (SavedTripsModal.js)
   Conforms to PRD.md §5 (F-06) & Tracker.md (T-5.3)
   Displays all trips from Firestore & localStorage with Load and Delete actions
   ========================================================================== */

import { FirebaseService } from "../services/FirebaseService.js";
import { tripStore } from "../state/TripStore.js";
import { toast } from "./Toast.js";
import { formatCurrency, escapeHTML } from "../utils/helpers.js";

export class SavedTripsModal {
  constructor(triggerBtnSelector) {
    this.triggerBtn = document.querySelector(triggerBtnSelector);
    this.modal = null;

    if (this.triggerBtn) {
      this.triggerBtn.addEventListener("click", () => this.open());
    }
  }

  async open() {
    this.modal = document.createElement("div");
    this.modal.className = "cga-modal-backdrop";
    this.modal.style.cssText = "position: fixed; inset: 0; background: rgba(17, 28, 20, 0.7); backdrop-filter: blur(12px); z-index: 350; display: flex; align-items: center; justify-content: center;";

    this.modal.innerHTML = `
      <div style="background: #ffffff; width: 92%; max-width: 520px; max-height: 80vh; border-radius: var(--cga-radius-lg); border: 1px solid var(--cga-border-glass); box-shadow: var(--cga-shadow-elevated); display: flex; flex-direction: column; overflow: hidden;">
        
        <!-- Header -->
        <div style="padding: 20px 24px; border-bottom: 1px solid var(--cga-border-subtle); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="font-family: var(--cga-font-serif); font-size: 20px; font-weight: 700; color: var(--cga-forest-contrast);">Your Saved Trips</h3>
            <span style="font-size: 12px; color: var(--cga-text-muted);">Personalized itineraries & travel plans</span>
          </div>
          <button id="close-saved-trips-modal" style="font-size: 18px; color: var(--cga-text-muted); padding: 4px; cursor: pointer;">✕</button>
        </div>

        <!-- Trips List Container with Skeleton placeholder -->
        <div id="saved-trips-body" style="padding: 16px 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 12px;">
          <div class="cga-skeleton" style="height: 68px; border-radius: var(--cga-radius-md);"></div>
          <div class="cga-skeleton" style="height: 68px; border-radius: var(--cga-radius-md);"></div>
          <div class="cga-skeleton" style="height: 68px; border-radius: var(--cga-radius-md);"></div>
        </div>

        <!-- Footer -->
        <div style="padding: 16px 24px; border-top: 1px solid var(--cga-border-subtle); background: var(--cga-bg-subtle); display: flex; justify-content: space-between; align-items: center;">
          <span id="saved-trips-count-label" style="font-size: 12px; color: var(--cga-text-muted);">Loading trips...</span>
          <button id="btn-start-new-trip" class="cga-btn-pill cga-btn-primary" style="font-size: 12px; height: 36px;">
            <span>➕ Start New Trip</span>
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(this.modal);

    // Close button
    this.modal.querySelector("#close-saved-trips-modal").addEventListener("click", () => this.close());
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) this.close();
    });

    // Start New Trip button
    this.modal.querySelector("#btn-start-new-trip").addEventListener("click", () => {
      tripStore.state.activeTrip = {
        id: "cga_" + Math.random().toString(36).substr(2, 9),
        title: "New Travel Journey",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        daysCount: 2,
        totalDistanceKm: 0,
        totalDurationMins: 0,
        totalBudget: 0,
        stops: []
      };
      tripStore.persistTrip();
      toast.success("Started a new travel plan!");
      this.close();
    });

    try {
      const trips = await FirebaseService.getSavedTrips();
      const countLabel = this.modal?.querySelector("#saved-trips-count-label");
      if (countLabel) {
        countLabel.textContent = `${trips.length} Saved Trip${trips.length === 1 ? "" : "s"}`;
      }
      this.renderTripsList(trips);
    } catch (err) {
      this.renderTripsList([]);
    }
  }

  renderTripsList(trips) {
    const container = this.modal.querySelector("#saved-trips-body");
    if (!container) return;

    if (!trips || trips.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 10px; color: var(--cga-text-muted);">
          <div style="font-size: 32px; margin-bottom: 8px;">📁</div>
          <div style="font-weight: 600; color: var(--cga-text-primary); margin-bottom: 4px;">No saved trips found</div>
          <p style="font-size: 12px;">Build an itinerary on the map and click 'Save to My Trips' to store it here!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = "";

    trips.forEach(trip => {
      const card = document.createElement("div");
      card.style.cssText = "background: #ffffff; border: 1px solid var(--cga-border-subtle); border-radius: var(--cga-radius-md); padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;";

      const dateStr = trip.createdAt ? new Date(trip.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Recent";
      const stopsCount = (trip.stops || []).length;

      card.innerHTML = `
        <div>
          <div style="font-weight: 700; font-size: 15px; color: var(--cga-forest-contrast); margin-bottom: 2px;">
            ${escapeHTML(trip.title || "Wanderlust Trip")}
          </div>
          <div style="font-size: 11.5px; color: var(--cga-text-muted); display: flex; gap: 10px; align-items: center; margin-top: 4px;">
            <span>📅 ${dateStr}</span>
            <span>📍 ${stopsCount} stop${stopsCount === 1 ? "" : "s"}</span>
            <span>💰 ${formatCurrency(trip.totalBudget || 0)}</span>
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          <button class="cga-btn-pill cga-btn-primary btn-load-trip" style="height: 32px; padding: 0 14px; font-size: 12px;">
            <span>Load</span>
          </button>
          <button class="btn-delete-trip" title="Delete trip" style="width: 32px; height: 32px; border-radius: 50%; background: #fee2e2; color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 13px; cursor: pointer;">
            ✕
          </button>
        </div>
      `;

      card.querySelector(".btn-load-trip").addEventListener("click", () => {
        tripStore.loadSavedTrip(trip);
        toast.success(`Loaded "${trip.title}"!`);
        this.close();
      });

      card.querySelector(".btn-delete-trip").addEventListener("click", async () => {
        await FirebaseService.deleteTrip(trip.id);
        toast.info("Trip deleted from archive.");
        const updated = await FirebaseService.getSavedTrips();
        this.renderTripsList(updated);
      });

      container.appendChild(card);
    });
  }

  close() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
    if (window.location.hash === "#/saved") {
      window.location.hash = "#/map";
    }
  }
}
