/* ==========================================================================
   Cholo Ghure Asssiii — Scene 5: Saved Trips & Footer (js/scenes/savedTrips.js)
   ========================================================================== */

import { FirebaseService } from "../services/FirebaseService.js";
import { tripStore } from "../state/TripStore.js";
import { toast } from "../components/Toast.js";
import { formatCurrency, escapeHTML } from "../utils/helpers.js";

export class SavedTripsScene {
  constructor() {
    this.grid = document.getElementById("saved-trips-grid");
    this.bindEvents();
    this.loadTrips();
  }

  bindEvents() {
    tripStore.subscribe("trip:updated", () => this.loadTrips());
    document.getElementById("btn-export-trip")?.addEventListener("click", () => {
      window.print();
    });
  }

  async loadTrips() {
    if (!this.grid) return;
    try {
      const trips = await FirebaseService.getSavedTrips();
      if (trips.length === 0) {
        this.grid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--cga-text-muted);">
            <p>No saved trips yet. Compose your itinerary in Scene 4 and click 'Sync to Cloud'!</p>
          </div>
        `;
        return;
      }

      this.grid.innerHTML = trips.map(t => `
        <div class="saved-trip-card" style="background: var(--cga-bg-subtle); border-radius: var(--cga-radius-md); padding: 20px; border: 1px solid var(--cga-border-subtle); display: flex; flex-direction: column; justify-content: space-between; gap: 14px;">
          <div>
            <div style="font-size: 11px; font-weight: 700; color: var(--cga-gold-accent); text-transform: uppercase;">Saved Itinerary</div>
            <h4 style="font-family: var(--cga-font-serif); font-size: 18px; color: var(--cga-forest-contrast); margin-top: 4px;">${escapeHTML(t.title)}</h4>
            <div style="font-size: 12px; color: var(--cga-text-secondary); margin-top: 6px;">
              📍 ${(t.stops || []).length} stops • 🚗 ${t.totalDistanceKm || 0} km • 💰 ${formatCurrency(t.totalBudget || 0)}
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="cga-btn-pill cga-btn-primary btn-load-saved" data-id="${t.id}" style="height: 34px; font-size: 12px; padding: 0 14px;">
              <span>Load Trip</span>
            </button>
            <button class="cga-btn-pill cga-btn-secondary btn-del-saved" data-id="${t.id}" style="height: 34px; font-size: 12px; padding: 0 14px; color: #ef4444;">
              <span>Delete</span>
            </button>
          </div>
        </div>
      `).join("");

      this.grid.querySelectorAll(".btn-load-saved").forEach(b => {
        b.addEventListener("click", () => {
          const trip = trips.find(t => t.id === b.dataset.id);
          if (trip) {
            tripStore.loadSavedTrip(trip);
            toast.success(`Loaded "${trip.title}"!`);
            const journeyEl = document.getElementById("scene-journey");
            if (journeyEl) {
              if (window.lenisInstance) window.lenisInstance.scrollTo(journeyEl);
              else journeyEl.scrollIntoView({ behavior: "smooth" });
            }
          }
        });
      });

      this.grid.querySelectorAll(".btn-del-saved").forEach(b => {
        b.addEventListener("click", async () => {
          await FirebaseService.deleteTrip(b.dataset.id);
          toast.info("Trip deleted from archive.");
          this.loadTrips();
        });
      });
    } catch (e) {
      console.error(e);
    }
  }
}
