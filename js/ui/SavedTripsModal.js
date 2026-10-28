/* ==========================================================================
   Cholo Ghure Asssiii — Saved Trips Archive Modal (SavedTripsModal.js)
   Conforms to PRD.md §5 (F-06) & Tracker.md (T-5.3)
   Displays all trips from Firestore & localStorage with Load and Delete actions
   ========================================================================== */

import { FirebaseService } from "../services/FirebaseService.js";
import { tripStore } from "../state/TripStore.js";
import { toast } from "./Toast.js";
import { formatCurrency, escapeHTML } from "../utils/helpers.js";

const CURATED_GLOBAL_TRIPS = [
  {
    id: "curated_golden_triangle",
    title: "Golden Triangle Heritage Expedition",
    createdAt: new Date().toISOString(),
    daysCount: 3,
    totalDistanceKm: 480,
    totalDurationMins: 420,
    totalBudget: 18500,
    badge: "🏛️ Classic India",
    stops: [
      {
        stopId: "delhi_stop",
        orderIndex: 0,
        dayNumber: 1,
        name: "New Delhi",
        latitude: 28.6139,
        longitude: 77.2090,
        weatherSnapshot: { icon: "☀️", temperature: 28, condition: "Clear Sky" },
        budget: { stay: 2500, food: 1200, transport: 800, tickets: 500 }
      },
      {
        stopId: "agra_stop",
        orderIndex: 1,
        dayNumber: 2,
        name: "Taj Mahal, Agra",
        latitude: 27.1751,
        longitude: 78.0421,
        weatherSnapshot: { icon: "🌤️", temperature: 27, condition: "Partly Cloudy" },
        budget: { stay: 3000, food: 1000, transport: 1200, tickets: 1100 }
      },
      {
        stopId: "jaipur_stop",
        orderIndex: 2,
        dayNumber: 3,
        name: "Hawa Mahal, Jaipur",
        latitude: 26.9239,
        longitude: 75.8267,
        weatherSnapshot: { icon: "☀️", temperature: 30, condition: "Sunny" },
        budget: { stay: 3500, food: 1500, transport: 1000, tickets: 600 }
      }
    ]
  },
  {
    id: "curated_swiss_alps",
    title: "Swiss Alpine Panorama Trail",
    createdAt: new Date().toISOString(),
    daysCount: 3,
    totalDistanceKm: 210,
    totalDurationMins: 240,
    totalBudget: 68000,
    badge: "🏔️ Swiss Alps",
    stops: [
      {
        stopId: "zurich_stop",
        orderIndex: 0,
        dayNumber: 1,
        name: "Zurich",
        latitude: 47.3769,
        longitude: 8.5417,
        weatherSnapshot: { icon: "🌤️", temperature: 16, condition: "Pleasant" },
        budget: { stay: 9500, food: 3500, transport: 2000, tickets: 1500 }
      },
      {
        stopId: "lucerne_stop",
        orderIndex: 1,
        dayNumber: 2,
        name: "Lucerne Lake",
        latitude: 47.0502,
        longitude: 8.3093,
        weatherSnapshot: { icon: "⛅", temperature: 15, condition: "Breezy" },
        budget: { stay: 11000, food: 4000, transport: 2500, tickets: 3000 }
      },
      {
        stopId: "interlaken_stop",
        orderIndex: 2,
        dayNumber: 3,
        name: "Interlaken",
        latitude: 46.6863,
        longitude: 7.8632,
        weatherSnapshot: { icon: "🏔️", temperature: 10, condition: "Alpine Cool" },
        budget: { stay: 14000, food: 4500, transport: 3500, tickets: 8000 }
      }
    ]
  },
  {
    id: "curated_tokyo_kyoto",
    title: "Tokyo to Kyoto Cultural Trail",
    createdAt: new Date().toISOString(),
    daysCount: 3,
    totalDistanceKm: 510,
    totalDurationMins: 150,
    totalBudget: 75000,
    badge: "🇯🇵 Japan Discovery",
    stops: [
      {
        stopId: "tokyo_stop",
        orderIndex: 0,
        dayNumber: 1,
        name: "Tokyo",
        latitude: 35.6762,
        longitude: 139.6503,
        weatherSnapshot: { icon: "🌤️", temperature: 19, condition: "Mild" },
        budget: { stay: 8000, food: 3000, transport: 1500, tickets: 2000 }
      },
      {
        stopId: "fuji_stop",
        orderIndex: 1,
        dayNumber: 2,
        name: "Mount Fuji",
        latitude: 35.3606,
        longitude: 138.7274,
        weatherSnapshot: { icon: "🗻", temperature: 12, condition: "Clear Mountain" },
        budget: { stay: 9000, food: 2500, transport: 2500, tickets: 1500 }
      },
      {
        stopId: "kyoto_stop",
        orderIndex: 2,
        dayNumber: 3,
        name: "Kyoto",
        latitude: 35.0116,
        longitude: 135.7681,
        weatherSnapshot: { icon: "🍂", temperature: 18, condition: "Serene" },
        budget: { stay: 10000, food: 3500, transport: 1500, tickets: 2500 }
      }
    ]
  }
];

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
    container.innerHTML = "";

    // 1. User's Personal Saved Trips
    const userSection = document.createElement("div");
    userSection.style.marginBottom = "20px";

    if (trips && trips.length > 0) {
      userSection.innerHTML = `
        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--cga-forest-contrast); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
          <span>📁</span> Your Created Trips (${trips.length})
        </div>
      `;

      trips.forEach(trip => {
        const card = document.createElement("div");
        card.style.cssText = "background: #ffffff; border: 1px solid var(--cga-border-subtle); border-radius: var(--cga-radius-md); padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; transition: all 0.2s;";

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
              <span>Load Trip</span>
            </button>
            <button class="btn-delete-trip" title="Delete trip" style="width: 32px; height: 32px; border-radius: 50%; background: #fee2e2; color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 13px; cursor: pointer;">
              ✕
            </button>
          </div>
        `;

        card.querySelector(".btn-load-trip").addEventListener("click", () => {
          tripStore.loadSavedTrip(trip);
          toast.success(`Loaded "${trip.title}"! 🚗`);
          this.close();
          window.location.hash = "#/map";
        });

        card.querySelector(".btn-delete-trip").addEventListener("click", async () => {
          await FirebaseService.deleteTrip(trip.id);
          toast.info("Trip removed from saved journeys.");
          const updated = await FirebaseService.getSavedTrips();
          this.renderTripsList(updated);
        });

        userSection.appendChild(card);
      });
    } else {
      userSection.innerHTML = `
        <div style="text-align: center; padding: 20px 10px; background: var(--cga-bg-subtle); border-radius: var(--cga-radius-md); margin-bottom: 16px;">
          <div style="font-size: 26px; margin-bottom: 4px;">📁</div>
          <div style="font-weight: 700; font-size: 13.5px; color: var(--cga-text-primary);">No custom trips saved yet</div>
          <p style="font-size: 12px; color: var(--cga-text-muted); margin-top: 2px;">Plan an itinerary on the map and click 'Save to My Trips' to store your custom journeys here!</p>
        </div>
      `;
    }

    container.appendChild(userSection);

    // 2. Featured Worldwide Expeditions
    const curatedSection = document.createElement("div");
    curatedSection.innerHTML = `
      <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--cga-gold-accent); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
        <span>⭐</span> Featured Global Expeditions (1-Click Load)
      </div>
    `;

    CURATED_GLOBAL_TRIPS.forEach(curated => {
      const card = document.createElement("div");
      card.style.cssText = "background: #ffffff; border: 1px solid var(--cga-border-subtle); border-left: 4px solid var(--cga-gold-accent); border-radius: var(--cga-radius-md); padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; transition: all 0.2s;";

      card.innerHTML = `
        <div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 11px; background: rgba(200, 150, 62, 0.12); color: var(--cga-gold-accent); font-weight: 700; padding: 2px 8px; border-radius: 999px;">${curated.badge}</span>
            <span style="font-size: 11px; color: var(--cga-text-muted);">${curated.daysCount} Days • ${curated.stops.length} Stops</span>
          </div>
          <div style="font-weight: 700; font-size: 14.5px; color: var(--cga-forest-contrast); margin: 4px 0 2px;">
            ${escapeHTML(curated.title)}
          </div>
          <div style="font-size: 11.5px; color: var(--cga-text-muted);">
            Est. Budget: <strong style="color: var(--cga-forest-contrast);">${formatCurrency(curated.totalBudget)}</strong> (${curated.stops.map(s => s.name).join(" ➔ ")})
          </div>
        </div>

        <button class="cga-btn-pill cga-btn-primary btn-load-curated" style="height: 32px; padding: 0 14px; font-size: 12px; flex-shrink: 0;">
          <span>Explore ➔</span>
        </button>
      `;

      card.querySelector(".btn-load-curated").addEventListener("click", () => {
        tripStore.loadSavedTrip(JSON.parse(JSON.stringify(curated)));
        toast.success(`Loaded "${curated.title}"! 🚗`);
        this.close();
        window.location.hash = "#/map";
      });

      curatedSection.appendChild(card);
    });

    container.appendChild(curatedSection);
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

