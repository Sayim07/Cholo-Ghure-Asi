/* ==========================================================================
   Cholo Ghure Asssiii — Itinerary & Multi-Day Manager (ItineraryView.js)
   Conforms to PRD.md §5 (F-05, F-06, F-08)
   ========================================================================== */

import { tripStore } from "../state/TripStore.js";
import { FirebaseService } from "../services/FirebaseService.js";
import { toast } from "./Toast.js";
import { formatCurrency, escapeHTML } from "../utils/helpers.js";
import { searchDestination } from "../services/NominatimService.js";
import { fetchWeather } from "../services/WeatherService.js";
import { TripExportModal } from "./TripExportModal.js";
import { TripBudgetEngine } from "../services/TripBudgetEngine.js";

export class ItineraryView {
  constructor(drawerId) {
    this.drawer = document.getElementById(drawerId);
    this.dayTabsBar = document.getElementById("itinerary-day-tabs");
    this.stopsList = document.getElementById("itinerary-stops-list");
    this.budgetVal = document.getElementById("itinerary-budget-total");
    this.saveCloudBtn = document.getElementById("btn-save-cloud-trip");
    this.toggleDrawerBtn = document.getElementById("btn-toggle-itinerary");
    this.tripTitleInput = document.getElementById("itinerary-trip-title");
    this.expandBtn = document.getElementById("itinerary-expand-btn");
    this.quickSearchInput = document.getElementById("itinerary-quick-search");
    this.quickAddBtn = document.getElementById("itinerary-quick-add-btn");
    this.exportBtn = document.getElementById("btn-itinerary-export");

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
        if (window.location.hash === "#/itinerary") {
          window.location.hash = "#/map";
        }
      });
    }

    // Toggle wide / docked view
    if (this.expandBtn) {
      this.expandBtn.addEventListener("click", () => {
        if (!this.drawer) return;
        this.drawer.classList.toggle("expanded");
        const isExpanded = this.drawer.classList.contains("expanded");
        this.expandBtn.textContent = isExpanded ? "⤡" : "⤢";
        this.expandBtn.title = isExpanded ? "Dock to side" : "Toggle wide view";
      });
    }

    // Editable Trip Title
    if (this.tripTitleInput) {
      this.tripTitleInput.addEventListener("change", (e) => {
        const newTitle = e.target.value.trim() || "My Travel Journey";
        tripStore.state.activeTrip.title = newTitle;
        tripStore.persistTrip();
        toast.success(`Renamed trip to "${newTitle}"! ✨`);
      });
    }

    // Quick Add Place by text
    const handleQuickAdd = async () => {
      if (!this.quickSearchInput) return;
      const query = this.quickSearchInput.value.trim();
      if (!query) return;

      const origText = this.quickAddBtn.textContent;
      this.quickAddBtn.textContent = "...";
      this.quickAddBtn.disabled = true;

      try {
        const found = await searchDestination(query);
        let place = null;
        if (found && found.length > 0) {
          place = found[0];
        } else {
          place = {
            name: query,
            shortName: query,
            latitude: 28.6139,
            longitude: 77.2090,
            type: "city"
          };
        }

        const weather = await fetchWeather(place.latitude, place.longitude).catch(() => null);
        tripStore.addStop(place, weather);
        this.quickSearchInput.value = "";
        toast.success(`Added "${place.shortName || place.name}" to Day ${tripStore.state.activeDay}! 🚗`);
      } catch (err) {
        toast.error("Could not find location.");
      } finally {
        this.quickAddBtn.textContent = origText;
        this.quickAddBtn.disabled = false;
      }
    };

    if (this.quickAddBtn) this.quickAddBtn.addEventListener("click", handleQuickAdd);
    if (this.quickSearchInput) {
      this.quickSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleQuickAdd();
        }
      });
    }

    // Export / Print Modal
    if (this.exportBtn) {
      this.exportBtn.addEventListener("click", () => {
        TripExportModal.open();
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

    // Sync title input
    if (this.tripTitleInput && document.activeElement !== this.tripTitleInput) {
      this.tripTitleInput.value = tripStore.state.activeTrip.title || "My Travel Journey";
    }

    const allStops = tripStore.state.activeTrip.stops || [];
    const activeDay = tripStore.state.activeDay || 1;

    // Filter stops by currently selected day
    const dayStops = allStops.filter(s => s.dayNumber === activeDay);

    if (dayStops.length === 0) {
      this.stopsList.innerHTML = `
        <div style="text-align: center; padding: 28px 12px; color: var(--cga-text-muted);">
          <div style="font-size: 32px; margin-bottom: 6px;">🎒</div>
          <div style="font-weight: 700; color: var(--cga-text-primary); margin-bottom: 4px;">No stops planned for Day ${activeDay}</div>
          <p style="font-size: 12px; margin-bottom: 12px;">Type a place above or click a popular highlight to add:</p>
          <div class="itinerary-quick-pills" style="display: flex; flex-wrap: wrap; gap: 6px; justify-content: center;">
            <button class="cga-itinerary-preset-btn" data-preset="Taj Mahal, Agra">🏛️ Taj Mahal</button>
            <button class="cga-itinerary-preset-btn" data-preset="Paris, France">🗼 Paris</button>
            <button class="cga-itinerary-preset-btn" data-preset="Tokyo, Japan">🇯🇵 Tokyo</button>
            <button class="cga-itinerary-preset-btn" data-preset="Goa, India">🏖️ Goa</button>
            <button class="cga-itinerary-preset-btn" data-preset="Zermatt, Switzerland">🏔️ Swiss Alps</button>
          </div>
        </div>
      `;

      // Wire preset clicks
      this.stopsList.querySelectorAll(".cga-itinerary-preset-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const presetName = btn.getAttribute("data-preset");
          btn.textContent = "...";
          try {
            const found = await searchDestination(presetName);
            const place = (found && found.length > 0) ? found[0] : {
              name: presetName,
              shortName: presetName,
              latitude: 28.6139,
              longitude: 77.2090,
              type: "city"
            };
            const weather = await fetchWeather(place.latitude, place.longitude).catch(() => null);
            tripStore.addStop(place, weather);
            toast.success(`Added ${place.shortName || place.name} to Day ${activeDay}! 🚗`);
          } catch (err) {
            toast.error("Could not add destination.");
          }
        });
      });
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
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px; flex-wrap: wrap;">
            ${weatherTag}
            <button class="stop-budget-pill btn-edit-budget" title="Lodging: ₹${stop.budget?.stay || 0} • Food: ₹${stop.budget?.food || 0} • Travel: ₹${stop.budget?.transport || 0} • Tickets: ₹${stop.budget?.tickets || 0} (Click to customize)" style="font-size: 11px; font-weight: 700; color: var(--cga-text-primary); background: var(--cga-bg-subtle); border: 1px solid var(--cga-border-subtle); padding: 2px 8px; border-radius: var(--cga-radius-full); cursor: pointer; transition: all 0.2s;">
              💰 ${formatCurrency((stop.budget?.stay || 0) + (stop.budget?.food || 0) + (stop.budget?.transport || 0) + (stop.budget?.tickets || 0))}
            </button>
            <span style="font-size: 11px; color: var(--cga-text-muted);">
              📍 Stop #${index + 1}
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

      card.querySelector(".btn-edit-budget")?.addEventListener("click", () => {
        this.openBudgetEditor(stop);
      });

      this.stopsList.appendChild(card);
    });
  }

  openBudgetEditor(stop) {
    const budget = stop.budget || TripBudgetEngine.estimateStopBudget(stop);

    // Create lightweight budget editor modal
    const modal = document.createElement("div");
    modal.className = "cga-modal-backdrop";
    modal.style.cssText = "position: fixed; inset: 0; background: rgba(17, 28, 20, 0.65); backdrop-filter: blur(8px); z-index: 300; display: flex; align-items: center; justify-content: center;";

    modal.innerHTML = `
      <div style="background: #ffffff; width: 90%; max-width: 380px; border-radius: var(--cga-radius-lg); border: 1px solid var(--cga-border-glass); box-shadow: var(--cga-shadow-elevated); padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h3 style="font-family: var(--cga-font-serif); font-size: 18px; font-weight: 700; color: var(--cga-forest-contrast); margin: 0;">Budget: ${escapeHTML(stop.name)}</h3>
            <span style="font-size: 11px; color: var(--cga-text-muted);">Adjust individual expense categories</span>
          </div>
          <button id="close-budget-modal" style="font-size: 16px; color: var(--cga-text-muted); background: none; border: none; cursor: pointer;">✕</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
          <label style="display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
            <span>🏨 Accommodation (₹)</span>
            <input type="number" id="inp-stay" value="${budget.stay || 0}" style="width: 100px; text-align: right; background: var(--cga-bg-subtle); padding: 6px 10px; border-radius: var(--cga-radius-sm); border: 1px solid var(--cga-border-subtle); font-family: var(--cga-font-mono);">
          </label>
          <label style="display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
            <span>🍽️ Food & Dining (₹)</span>
            <input type="number" id="inp-food" value="${budget.food || 0}" style="width: 100px; text-align: right; background: var(--cga-bg-subtle); padding: 6px 10px; border-radius: var(--cga-radius-sm); border: 1px solid var(--cga-border-subtle); font-family: var(--cga-font-mono);">
          </label>
          <label style="display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
            <span>🚗 Travel & Transit (₹)</span>
            <input type="number" id="inp-transport" value="${budget.transport || 0}" style="width: 100px; text-align: right; background: var(--cga-bg-subtle); padding: 6px 10px; border-radius: var(--cga-radius-sm); border: 1px solid var(--cga-border-subtle); font-family: var(--cga-font-mono);">
          </label>
          <label style="display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
            <span>🎟️ Entry Tickets (₹)</span>
            <input type="number" id="inp-tickets" value="${budget.tickets || 0}" style="width: 100px; text-align: right; background: var(--cga-bg-subtle); padding: 6px 10px; border-radius: var(--cga-radius-sm); border: 1px solid var(--cga-border-subtle); font-family: var(--cga-font-mono);">
          </label>
        </div>

        <div style="display: flex; gap: 8px;">
          <button id="btn-re-estimate-budget" class="cga-btn-pill cga-btn-secondary" style="flex: 1; height: 38px; font-size: 11px; justify-content: center;">
            <span>⚡ Dynamic Est</span>
          </button>
          <button id="save-budget-modal" class="cga-btn-pill cga-btn-primary" style="flex: 1.2; height: 38px; font-size: 12px; justify-content: center;">
            <span>Save Expenses</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const inpStay = modal.querySelector("#inp-stay");
    const inpFood = modal.querySelector("#inp-food");
    const inpTransport = modal.querySelector("#inp-transport");
    const inpTickets = modal.querySelector("#inp-tickets");

    modal.querySelector("#btn-re-estimate-budget")?.addEventListener("click", () => {
      const freshEst = TripBudgetEngine.estimateStopBudget(stop);
      inpStay.value = freshEst.stay;
      inpFood.value = freshEst.food;
      inpTransport.value = freshEst.transport;
      inpTickets.value = freshEst.tickets;
      toast.info(`Updated to real-time dynamic estimate for ${stop.name}!`);
    });

    modal.querySelector("#close-budget-modal").addEventListener("click", () => modal.remove());
    modal.querySelector("#save-budget-modal").addEventListener("click", () => {
      stop.budget = {
        stay: Number(inpStay.value) || 0,
        food: Number(inpFood.value) || 0,
        transport: Number(inpTransport.value) || 0,
        tickets: Number(inpTickets.value) || 0
      };
      tripStore.recalculateBudget();
      tripStore.persistTrip();
      toast.success("Budget updated!");
      modal.remove();
      this.render();
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
    this.saveCloudBtn.innerHTML = "<span style='display:inline-flex; align-items:center; gap:6px;'><span style='animation: cga-pulse-subtle 1s infinite;'>☁️</span> Saving...</span>";
    this.saveCloudBtn.disabled = true;

    try {
      const res = await FirebaseService.saveTrip(trip);
      if (res.mode === "cloud") {
        toast.success("Trip saved safely to your Cloud Account! ☁️");
      } else {
        toast.success("Trip saved securely to your personal archive! 💾");
      }
    } catch (e) {
      toast.error("Could not save to cloud. Saved locally.");
    } finally {
      this.saveCloudBtn.innerHTML = originalText;
      this.saveCloudBtn.disabled = false;
    }
  }
}
