/* ==========================================================================
   Cholo Ghure Asssiii — Saved Trips Archive Modal (SavedTripsModal.js)
   Conforms to PRD.md §5 (F-06) & Tracker.md (T-5.3)
   Displays all trips from Firestore & localStorage with Load and Delete actions
   ========================================================================== */

import { FirebaseService } from "../services/FirebaseService.js";
import { tripStore } from "../state/TripStore.js";
import { toast } from "./Toast.js";
import { formatCurrency, escapeHTML } from "../utils/helpers.js";
import { TripBudgetEngine } from "../services/TripBudgetEngine.js";

// Global Destination Blueprints (dynamic templates for quick start)
const GLOBAL_ROUTE_TEMPLATES = [
  {
    id: "template_golden_triangle",
    title: "Golden Triangle Heritage Expedition",
    badge: "🏛️ Classic India",
    daysCount: 3,
    stops: [
      { name: "New Delhi", latitude: 28.6139, longitude: 77.2090, type: "city", dayNumber: 1 },
      { name: "Taj Mahal, Agra", latitude: 27.1751, longitude: 78.0421, type: "monument", dayNumber: 2 },
      { name: "Hawa Mahal, Jaipur", latitude: 26.9239, longitude: 75.8267, type: "heritage", dayNumber: 3 }
    ]
  },
  {
    id: "template_swiss_alps",
    title: "Swiss Alpine Panorama Trail",
    badge: "🏔️ Swiss Alps",
    daysCount: 3,
    stops: [
      { name: "Zurich", latitude: 47.3769, longitude: 8.5417, type: "city", dayNumber: 1 },
      { name: "Lucerne Lake", latitude: 47.0502, longitude: 8.3093, type: "nature", dayNumber: 2 },
      { name: "Interlaken", latitude: 46.6863, longitude: 7.8632, type: "mountain", dayNumber: 3 }
    ]
  },
  {
    id: "template_japan_discovery",
    title: "Tokyo to Kyoto Cultural Trail",
    badge: "🇯🇵 Japan Discovery",
    daysCount: 3,
    stops: [
      { name: "Tokyo", latitude: 35.6762, longitude: 139.6503, type: "city", dayNumber: 1 },
      { name: "Mount Fuji", latitude: 35.3606, longitude: 138.7274, type: "nature", dayNumber: 2 },
      { name: "Kyoto", latitude: 35.0116, longitude: 135.7681, type: "heritage", dayNumber: 3 }
    ]
  }
];

export class SavedTripsModal {
  constructor(triggerBtnSelector) {
    this.triggerBtn = document.querySelector(triggerBtnSelector);
    this.modal = null;
    this.allTrips = [];
    this.searchQuery = "";

    if (this.triggerBtn) {
      this.triggerBtn.addEventListener("click", () => this.open());
    }
  }

  async open() {
    if (this.modal) this.close();

    this.modal = document.createElement("div");
    this.modal.className = "cga-modal-backdrop";
    this.modal.style.cssText = "position: fixed; inset: 0; background: rgba(17, 28, 20, 0.72); backdrop-filter: blur(12px); z-index: 350; display: flex; align-items: center; justify-content: center;";

    this.modal.innerHTML = `
      <div style="background: #ffffff; width: 92%; max-width: 540px; max-height: 85vh; border-radius: var(--cga-radius-lg); border: 1px solid var(--cga-border-glass); box-shadow: var(--cga-shadow-elevated); display: flex; flex-direction: column; overflow: hidden; animation: cga-modal-enter 0.25s ease-out;">
        
        <!-- Header -->
        <div style="padding: 18px 24px; border-bottom: 1px solid var(--cga-border-subtle); display: flex; justify-content: space-between; align-items: center; background: #ffffff;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3 style="font-family: var(--cga-font-serif); font-size: 20px; font-weight: 700; color: var(--cga-forest-contrast); margin: 0;">Saved Journeys</h3>
              <span id="saved-trips-count-badge" style="font-size: 11px; background: rgba(30, 81, 40, 0.1); color: var(--cga-forest-contrast); font-weight: 700; padding: 2px 8px; border-radius: 999px;">Loading...</span>
            </div>
            <p style="font-size: 12px; color: var(--cga-text-muted); margin: 2px 0 0 0;">Manage your customized itineraries & travel records</p>
          </div>
          <button id="close-saved-trips-modal" style="font-size: 18px; color: var(--cga-text-muted); background: transparent; border: none; padding: 6px; cursor: pointer; border-radius: 50%; display: flex; align-items: center; justify-content: center;">✕</button>
        </div>

        <!-- Real-Time Active Trip Spotlight Card -->
        <div id="saved-modal-active-trip-spotlight" style="padding: 12px 24px; background: linear-gradient(135deg, rgba(200, 150, 62, 0.08) 0%, rgba(30, 81, 40, 0.05) 100%); border-bottom: 1px solid var(--cga-border-subtle);">
          <!-- Injected dynamically -->
        </div>

        <!-- Search / Filter Input -->
        <div style="padding: 10px 24px 6px; background: #ffffff;">
          <input type="text" id="saved-trips-search-input" placeholder="🔍 Search saved trips by name or destination..." style="width: 100%; box-sizing: border-box; background: var(--cga-bg-subtle); border: 1px solid var(--cga-border-subtle); border-radius: var(--cga-radius-sm); padding: 8px 12px; font-size: 12.5px; color: var(--cga-text-primary); outline: none;">
        </div>

        <!-- Trips List Container with Skeleton -->
        <div id="saved-trips-body" style="padding: 12px 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 10px;">
          <div class="cga-skeleton" style="height: 64px; border-radius: var(--cga-radius-md);"></div>
          <div class="cga-skeleton" style="height: 64px; border-radius: var(--cga-radius-md);"></div>
        </div>

        <!-- Footer -->
        <div style="padding: 14px 24px; border-top: 1px solid var(--cga-border-subtle); background: var(--cga-bg-subtle); display: flex; justify-content: space-between; align-items: center;">
          <button id="btn-modal-clear-stale" style="font-size: 11.5px; color: var(--cga-text-muted); background: none; border: none; cursor: pointer; text-decoration: underline;">
            Clear All Saved Trips
          </button>
          <button id="btn-start-new-trip" class="cga-btn-pill cga-btn-primary" style="font-size: 12px; height: 34px; padding: 0 16px;">
            <span>➕ Start Fresh Trip</span>
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
        title: "My Travel Journey",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        daysCount: 2,
        totalDistanceKm: 0,
        totalDurationMins: 0,
        totalBudget: 0,
        stops: []
      };
      tripStore.persistTrip();
      toast.success("Started a new travel journey! 🎒");
      this.close();
      window.location.hash = "#/map";
    });

    // Clear All button
    this.modal.querySelector("#btn-modal-clear-stale").addEventListener("click", async () => {
      if (confirm("Are you sure you want to clear your saved trips archive?")) {
        localStorage.removeItem("cga_saved_trips");
        toast.info("Saved trips cleared.");
        this.allTrips = [];
        this.renderTripsList([]);
      }
    });

    // Search filter input
    const searchInput = this.modal.querySelector("#saved-trips-search-input");
    searchInput.addEventListener("input", (e) => {
      this.searchQuery = (e.target.value || "").toLowerCase().trim();
      this.filterAndRenderTrips();
    });

    // Render Active Trip Spotlight
    this.renderActiveTripSpotlight();

    // Fetch and render saved trips
    try {
      this.allTrips = await FirebaseService.getSavedTrips();
      this.filterAndRenderTrips();
    } catch (err) {
      this.allTrips = [];
      this.filterAndRenderTrips();
    }
  }

  renderActiveTripSpotlight() {
    const spotlight = this.modal?.querySelector("#saved-modal-active-trip-spotlight");
    if (!spotlight) return;

    const activeTrip = tripStore.state.activeTrip;
    const stopsCount = (activeTrip.stops || []).length;
    const isSaved = this.allTrips.some(t => t.id === activeTrip.id);

    spotlight.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
            <span style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--cga-gold-accent);">
              📍 Active Working Itinerary
            </span>
          </div>
          <div style="font-weight: 700; font-size: 14.5px; color: var(--cga-forest-contrast); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escapeHTML(activeTrip.title || "My Travel Journey")}
          </div>
          <div style="font-size: 11.5px; color: var(--cga-text-muted); display: flex; gap: 10px; margin-top: 3px;">
            <span>📅 ${activeTrip.daysCount || 2} Days</span>
            <span>📍 ${stopsCount} Stop${stopsCount === 1 ? "" : "s"}</span>
            <span>💰 <strong>${formatCurrency(activeTrip.totalBudget || 0)}</strong></span>
          </div>
        </div>

        <div>
          ${stopsCount > 0 ? `
            <button id="btn-spotlight-save-active" class="cga-btn-pill ${isSaved ? "cga-btn-secondary" : "cga-btn-primary"}" style="height: 32px; font-size: 11.5px; padding: 0 12px; white-space: nowrap;">
              <span>${isSaved ? "✓ Updated" : "💾 Save Journey"}</span>
            </button>
          ` : `
            <button id="btn-spotlight-plan-active" class="cga-btn-pill cga-btn-secondary" style="height: 32px; font-size: 11.5px; padding: 0 12px; white-space: nowrap;">
              <span>➕ Add Stops</span>
            </button>
          `}
        </div>
      </div>
    `;

    spotlight.querySelector("#btn-spotlight-save-active")?.addEventListener("click", async () => {
      const btn = spotlight.querySelector("#btn-spotlight-save-active");
      if (btn) btn.textContent = "Saving...";
      await FirebaseService.saveTrip(activeTrip);
      toast.success(`"${activeTrip.title}" saved to your personal archive! 💾`);
      this.allTrips = await FirebaseService.getSavedTrips();
      this.renderActiveTripSpotlight();
      this.filterAndRenderTrips();
    });

    spotlight.querySelector("#btn-spotlight-plan-active")?.addEventListener("click", () => {
      this.close();
      window.location.hash = "#/map";
    });
  }

  filterAndRenderTrips() {
    let filtered = this.allTrips;
    if (this.searchQuery) {
      filtered = this.allTrips.filter(t => {
        const titleMatch = (t.title || "").toLowerCase().includes(this.searchQuery);
        const stopMatch = (t.stops || []).some(s => (s.name || "").toLowerCase().includes(this.searchQuery));
        return titleMatch || stopMatch;
      });
    }

    const countBadge = this.modal?.querySelector("#saved-trips-count-badge");
    if (countBadge) {
      countBadge.textContent = `${this.allTrips.length} Trip${this.allTrips.length === 1 ? "" : "s"}`;
    }

    this.renderTripsList(filtered);
  }

  renderTripsList(trips) {
    const container = this.modal?.querySelector("#saved-trips-body");
    if (!container) return;
    container.innerHTML = "";

    // 1. User's Personal Saved Journeys
    const userSection = document.createElement("div");
    userSection.style.marginBottom = "14px";

    if (trips && trips.length > 0) {
      userSection.innerHTML = `
        <div style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--cga-forest-contrast); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <span>📁</span> Saved Journeys (${trips.length})
        </div>
      `;

      trips.forEach(trip => {
        const card = document.createElement("div");
        card.style.cssText = "background: #ffffff; border: 1px solid var(--cga-border-subtle); border-radius: var(--cga-radius-md); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.02);";

        const dateStr = trip.createdAt 
          ? new Date(trip.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) 
          : "Recent";
        const stopsCount = (trip.stops || []).length;
        const stopNames = (trip.stops || []).slice(0, 3).map(s => escapeHTML(s.name)).join(" ➔ ");
        const moreStops = stopsCount > 3 ? ` +${stopsCount - 3} more` : "";

        card.innerHTML = `
          <div style="flex: 1; min-width: 0; padding-right: 12px;">
            <div style="font-weight: 700; font-size: 14.5px; color: var(--cga-forest-contrast); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${escapeHTML(trip.title || "Travel Journey")}
            </div>
            ${stopsCount > 0 ? `
              <div style="font-size: 11px; color: var(--cga-text-secondary); margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${stopNames}${moreStops}
              </div>
            ` : ""}
            <div style="font-size: 11px; color: var(--cga-text-muted); display: flex; gap: 10px; align-items: center;">
              <span>📅 ${dateStr}</span>
              <span>📍 ${stopsCount} stop${stopsCount === 1 ? "" : "s"}</span>
              <span>💰 <strong style="color: var(--cga-forest-contrast);">${formatCurrency(trip.totalBudget || 0)}</strong></span>
            </div>
          </div>

          <div style="display: flex; gap: 6px; align-items: center; flex-shrink: 0;">
            <button class="cga-btn-pill cga-btn-primary btn-load-trip" style="height: 30px; padding: 0 12px; font-size: 11.5px;">
              <span>Load Trip</span>
            </button>
            <button class="btn-delete-trip" title="Delete journey" style="width: 28px; height: 28px; border-radius: 50%; background: #fee2e2; border: none; color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; transition: background 0.2s;">
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
          toast.info("Journey removed from your archive.");
          this.allTrips = await FirebaseService.getSavedTrips();
          this.renderActiveTripSpotlight();
          this.filterAndRenderTrips();
        });

        userSection.appendChild(card);
      });
    } else {
      userSection.innerHTML = `
        <div style="text-align: center; padding: 22px 12px; background: var(--cga-bg-subtle); border-radius: var(--cga-radius-md); border: 1px dashed var(--cga-border-subtle); margin-bottom: 12px;">
          <div style="font-size: 28px; margin-bottom: 4px;">🧳</div>
          <div style="font-weight: 700; font-size: 14px; color: var(--cga-text-primary);">No journeys saved yet</div>
          <p style="font-size: 12px; color: var(--cga-text-muted); max-width: 340px; margin: 4px auto 0;">Plan an itinerary on the map and click <strong>'Save Journey'</strong> above to store your trips safely here!</p>
        </div>
      `;
    }

    container.appendChild(userSection);

    // 2. Global Route Blueprints (collapsible dynamic templates)
    const templatesSection = document.createElement("div");
    templatesSection.innerHTML = `
      <div style="margin-top: 8px;">
        <button id="toggle-templates-btn" style="background: none; border: none; padding: 0; width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; margin-bottom: 8px;">
          <span style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--cga-gold-accent); display: flex; align-items: center; gap: 6px;">
            <span>✨</span> Explore Popular Route Blueprints
          </span>
          <span id="templates-chevron" style="font-size: 11px; color: var(--cga-text-muted);">▼</span>
        </button>
        <div id="templates-list-container" style="display: flex; flex-direction: column; gap: 8px;">
          <!-- Injected templates -->
        </div>
      </div>
    `;

    const templatesContainer = templatesSection.querySelector("#templates-list-container");
    const toggleBtn = templatesSection.querySelector("#toggle-templates-btn");
    const chevron = templatesSection.querySelector("#templates-chevron");

    GLOBAL_ROUTE_TEMPLATES.forEach(tpl => {
      // Dynamically calculate realistic blueprint budget using TripBudgetEngine
      let calculatedTotal = 0;
      const dynamicallyPricedStops = tpl.stops.map(s => {
        const est = TripBudgetEngine.estimateStopBudget(s);
        calculatedTotal += (est.stay + est.food + est.transport + est.tickets);
        return {
          ...s,
          stopId: "tpl_" + Math.random().toString(36).substr(2, 7),
          budget: est
        };
      });

      const tplCard = document.createElement("div");
      tplCard.style.cssText = "background: #ffffff; border: 1px solid var(--cga-border-subtle); border-left: 3px solid var(--cga-gold-accent); border-radius: var(--cga-radius-md); padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;";

      tplCard.innerHTML = `
        <div style="flex: 1; min-width: 0; padding-right: 10px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 10px; background: rgba(200, 150, 62, 0.12); color: var(--cga-gold-accent); font-weight: 700; padding: 1px 6px; border-radius: 999px;">${tpl.badge}</span>
            <span style="font-size: 11px; color: var(--cga-text-muted);">${tpl.daysCount} Days • ${tpl.stops.length} Stops</span>
          </div>
          <div style="font-weight: 700; font-size: 13.5px; color: var(--cga-forest-contrast); margin: 3px 0 1px;">
            ${escapeHTML(tpl.title)}
          </div>
          <div style="font-size: 11px; color: var(--cga-text-muted);">
            Live Est: <strong style="color: var(--cga-forest-contrast);">${formatCurrency(calculatedTotal)}</strong> (${tpl.stops.map(s => s.name.split(",")[0]).join(" ➔ ")})
          </div>
        </div>

        <button class="cga-btn-pill cga-btn-secondary btn-load-blueprint" style="height: 28px; padding: 0 10px; font-size: 11px; flex-shrink: 0;">
          <span>Use Template ➔</span>
        </button>
      `;

      tplCard.querySelector(".btn-load-blueprint").addEventListener("click", () => {
        tripStore.state.activeTrip = {
          id: "cga_" + Math.random().toString(36).substr(2, 9),
          title: tpl.title,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          daysCount: tpl.daysCount,
          totalDistanceKm: 0,
          totalDurationMins: 0,
          totalBudget: calculatedTotal,
          stops: dynamicallyPricedStops
        };
        tripStore.persistTrip();
        toast.success(`Loaded blueprint: "${tpl.title}"! 🚗`);
        this.close();
        window.location.hash = "#/map";
      });

      templatesContainer.appendChild(tplCard);
    });

    let isExpanded = true;
    toggleBtn.addEventListener("click", () => {
      isExpanded = !isExpanded;
      templatesContainer.style.display = isExpanded ? "flex" : "none";
      chevron.textContent = isExpanded ? "▼" : "▶";
    });

    container.appendChild(templatesSection);
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
