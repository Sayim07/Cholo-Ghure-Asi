/* ==========================================================================
   Cholo Ghure Asssiii — Scene 4: Journey Timeline & Telemetry (js/scenes/journey.js)
   Lightship RV Behavior: Sticky route map on left, scrolling day cards on right,
   scroll-driven telemetry numbers, and day camera fly-through
   ========================================================================== */

import { tripStore } from "../state/TripStore.js";
import { calculateRoute } from "../services/RoutingService.js";
import { FirebaseService } from "../services/FirebaseService.js";
import { toast } from "../components/Toast.js";
import { getIcon } from "../ui/icons.js";
import { formatCurrency, escapeHTML } from "../utils/helpers.js";

export class JourneyScene {
  constructor() {
    this.routeMap = null;
    this.routeMarkers = null;
    this.routePolyline = null;
    this.daysCol = document.getElementById("journey-days-col");

    this.initStickyMap();
    this.bindEvents();
    this.render();
  }

  initStickyMap() {
    const container = document.getElementById("journey-route-map");
    if (!container || !window.L) return;
    const L = window.L;

    this.routeMap = L.map(container, {
      zoomControl: false,
      attributionControl: false
    }).setView([22.5726, 88.3639], 9);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.routeMap);

    L.control.zoom({ position: "topright" }).addTo(this.routeMap);

    this.routeMarkers = L.layerGroup().addTo(this.routeMap);
    this.routePolyline = L.layerGroup().addTo(this.routeMap);
  }

  bindEvents() {
    tripStore.subscribe("stops:changed", () => {
      this.render();
      this.updateRouteOnMap();
    });

    tripStore.subscribe("trip:updated", () => {
      this.render();
    });

    document.getElementById("btn-journey-save-cloud")?.addEventListener("click", () => {
      this.handleCloudSave();
    });
  }

  render() {
    if (!this.daysCol) return;
    const trip = tripStore.state.activeTrip;
    const stops = trip.stops || [];

    if (stops.length === 0) {
      this.daysCol.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; background: #ffffff; border-radius: var(--cga-radius-lg); border: 1px solid var(--cga-border-subtle); box-shadow: var(--cga-shadow-sm);">
          <div style="font-size: 40px; margin-bottom: 12px;">🎒</div>
          <h3 style="font-family: var(--cga-font-serif); font-size: 24px; color: var(--cga-forest-contrast); margin-bottom: 8px;">Your Journey Awaits</h3>
          <p style="font-size: 14px; color: var(--cga-text-secondary); max-width: 320px; margin: 0 auto 20px;">You haven't added any stops yet. Scroll up to the Explore Map to add destinations to your itinerary!</p>
          <button id="btn-back-to-explore" class="cga-btn-pill cga-btn-primary">
            <span>Explore Map Canvas &rarr;</span>
          </button>
        </div>
      `;

      document.getElementById("btn-back-to-explore")?.addEventListener("click", () => {
        const exploreEl = document.getElementById("scene-explore");
        if (exploreEl) {
          if (window.lenisInstance) window.lenisInstance.scrollTo(exploreEl, { duration: 1.2 });
          else exploreEl.scrollIntoView({ behavior: "smooth" });
        }
      });
      return;
    }

    // Render grouped by Day
    const daysCount = trip.daysCount || 2;
    let html = `
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
        <div>
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.16em; color: var(--cga-gold-accent);">Trip Itinerary</span>
          <h2 style="font-family: var(--cga-font-serif); font-size: 28px; color: var(--cga-forest-contrast);">${escapeHTML(trip.title)}</h2>
        </div>
        <button id="btn-add-journey-day" class="cga-btn-pill cga-btn-secondary" style="height: 36px; padding: 0 14px; font-size: 12px;">
          <span>${getIcon("plus")} Add Day</span>
        </button>
      </div>
    `;

    for (let d = 1; d <= daysCount; d++) {
      const dayStops = stops.filter(s => s.dayNumber === d);
      html += `
        <div class="journey-day-card" data-day="${d}" style="background: #ffffff; border-radius: var(--cga-radius-lg); border: 1px solid var(--cga-border-subtle); box-shadow: var(--cga-shadow-sm); padding: 20px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--cga-border-subtle); padding-bottom: 12px; margin-bottom: 14px;">
            <span style="font-weight: 800; font-size: 16px; color: var(--cga-forest-contrast); font-family: var(--cga-font-serif);">Day ${d}</span>
            <span style="font-size: 12px; color: var(--cga-text-muted); font-weight: 600;">${dayStops.length} Destination${dayStops.length === 1 ? "" : "s"}</span>
          </div>

          <div class="day-stops-list" style="display: flex; flex-direction: column; gap: 10px;">
            ${dayStops.length === 0 ? `<p style="font-size: 12px; color: var(--cga-text-muted); font-style: italic;">No stops assigned to Day ${d}.</p>` : ""}
            ${dayStops.map(stop => `
              <div class="journey-stop-row" style="display: flex; align-items: center; gap: 12px; background: var(--cga-bg-subtle); border-radius: var(--cga-radius-md); padding: 12px 14px; border: 1px solid var(--cga-border-subtle);">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--cga-forest-contrast); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">
                  ${stop.orderIndex + 1}
                </div>
                <div style="flex: 1;">
                  <div style="font-weight: 700; font-size: 13.5px; color: var(--cga-text-primary);">${escapeHTML(stop.name)}</div>
                  <div style="font-size: 11px; color: var(--cga-gold-accent); font-weight: 600;">
                    ${stop.weatherSnapshot ? `${stop.weatherSnapshot.icon} ${stop.weatherSnapshot.temperature}°C` : ""}
                  </div>
                </div>
                <div style="display: flex; gap: 4px;">
                  <button class="reorder-btn btn-stop-up" data-id="${stop.stopId}" style="width: 26px; height: 26px; background: #fff; border-radius: 4px; display: flex; align-items: center; justify-content: center;" title="Move Up">${getIcon("chevronUp")}</button>
                  <button class="reorder-btn btn-stop-down" data-id="${stop.stopId}" style="width: 26px; height: 26px; background: #fff; border-radius: 4px; display: flex; align-items: center; justify-content: center;" title="Move Down">${getIcon("chevronDown")}</button>
                  <button class="reorder-btn btn-stop-del" data-id="${stop.stopId}" style="width: 26px; height: 26px; background: #fee2e2; color: #ef4444; border-radius: 4px; display: flex; align-items: center; justify-content: center;" title="Delete">${getIcon("trash")}</button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }

    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; background: #ffffff; padding: 20px; border-radius: var(--cga-radius-lg); border: 1px solid var(--cga-border-subtle); margin-top: 8px;">
        <div>
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--cga-text-muted);">Total Budget</span>
          <div style="font-family: var(--cga-font-mono); font-size: 22px; font-weight: 800; color: var(--cga-gold-accent);">${formatCurrency(trip.totalBudget)}</div>
        </div>
        <button id="btn-journey-save-cloud" class="cga-btn-pill cga-btn-primary">
          <span>${getIcon("cloudCheck")} Sync to Cloud</span>
        </button>
      </div>
    `;

    this.daysCol.innerHTML = html;

    // Attach row events
    this.daysCol.querySelectorAll(".btn-stop-up").forEach(b => {
      b.addEventListener("click", () => tripStore.reorderStop(b.dataset.id, -1));
    });
    this.daysCol.querySelectorAll(".btn-stop-down").forEach(b => {
      b.addEventListener("click", () => tripStore.reorderStop(b.dataset.id, 1));
    });
    this.daysCol.querySelectorAll(".btn-stop-del").forEach(b => {
      b.addEventListener("click", () => tripStore.removeStop(b.dataset.id));
    });
    document.getElementById("btn-add-journey-day")?.addEventListener("click", () => {
      tripStore.addDay();
      toast.info(`Day ${tripStore.state.activeTrip.daysCount} added!`);
    });
    document.getElementById("btn-journey-save-cloud")?.addEventListener("click", () => {
      this.handleCloudSave();
    });
  }

  async updateRouteOnMap() {
    if (!this.routeMap || !window.L) return;
    const L = window.L;
    this.routeMarkers.clearLayers();
    this.routePolyline.clearLayers();

    const stops = tripStore.state.activeTrip.stops || [];
    if (stops.length === 0) return;

    const latLngs = [];
    stops.forEach((stop, index) => {
      const isStart = index === 0;
      const isFinish = index === stops.length - 1 && stops.length > 1;
      const pinClass = isStart ? "start-pin" : isFinish ? "dest-pin" : "stop-pin";

      L.marker([stop.latitude, stop.longitude], {
        icon: L.divIcon({
          className: "cga-custom-marker",
          html: `<div class="cga-marker-pin ${pinClass}"><span class="cga-marker-inner">${index + 1}</span></div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 36]
        })
      }).addTo(this.routeMarkers);

      latLngs.push([stop.latitude, stop.longitude]);
    });

    if (latLngs.length >= 2) {
      try {
        const routeData = await calculateRoute(latLngs);
        if (routeData && routeData.geoJsonGeometry) {
          const poly = L.geoJSON(routeData.geoJsonGeometry, {
            style: { color: "#0284c7", weight: 5, opacity: 0.95 }
          }).addTo(this.routePolyline);

          this.routeMap.fitBounds(poly.getBounds(), { padding: [60, 60] });
          tripStore.setRouteSummary(routeData.distanceKm, routeData.durationMins, routeData.geoJsonGeometry);
        }
      } catch (err) {
        console.error("Route calculation error:", err);
      }
    } else if (latLngs.length === 1) {
      this.routeMap.flyTo(latLngs[0], 11);
    }
  }

  async handleCloudSave() {
    const trip = tripStore.state.activeTrip;
    if (!trip.stops || trip.stops.length === 0) {
      toast.error("Add destinations before saving to cloud!");
      return;
    }
    toast.info("Syncing itinerary to Firebase Firestore...");
    try {
      const res = await FirebaseService.saveTrip(trip);
      if (res.mode === "cloud") {
        toast.success("Trip synced to Firebase Firestore cloud! ☁️");
      } else {
        toast.success("Trip saved securely in local travel archive! 💾");
      }
    } catch (e) {
      toast.error("Could not complete cloud sync.");
    }
  }
}
