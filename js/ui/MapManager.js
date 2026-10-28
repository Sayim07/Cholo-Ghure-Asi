/* ==========================================================================
   Cholo Ghure Asssiii — Leaflet Map Engine & Cartography (MapManager.js)
   Conforms to TRD.md §2 & ImplementationPlan.md §2.1
   Features:
   - Live Reverse-Geocoding (Real City/Town/Region names on map click)
   - 1-Click Exploration with Thematic Gate Reveal Dossier (Wikipedia photos, history, budget)
   - Interactive Stop Management with "Remove Stop" & "View Guide"
   - Floating Route Control Bar with Live Distance and "Clear Route"
   ========================================================================== */

import { APP_CONSTANTS } from "../config/constants.js";
import { tripStore } from "../state/TripStore.js";
import { calculateRoute } from "../services/RoutingService.js";
import { fetchWeather } from "../services/WeatherService.js";
import { reverseGeocode } from "../services/NominatimService.js";
import { toast } from "./Toast.js";

export class MapManager {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.markersLayer = null;
    this.routeLayer = null;
    this.tempExploreMarker = null;

    this.initMap();
    this.bindStoreEvents();
  }

  initMap() {
    if (!window.L) {
      console.error("[MapManager] Leaflet library not loaded!");
      return;
    }

    const L = window.L;

    // Initialize Leaflet Map
    this.map = L.map(this.containerId, {
      zoomControl: false,
      attributionControl: false
    }).setView(APP_CONSTANTS.DEFAULT_CENTER, APP_CONSTANTS.DEFAULT_ZOOM);

    // OpenStreetMap standard tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Controls
    L.control.zoom({ position: "topright" }).addTo(this.map);
    L.control.attribution({ position: "bottomright", prefix: false }).addTo(this.map);

    // Layers for markers and route polylines
    this.markersLayer = L.layerGroup().addTo(this.map);
    this.routeLayer = L.layerGroup().addTo(this.map);

    // Bind Floating Route Clear Button
    const clearBtn = document.getElementById("btn-clear-map-route");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        tripStore.clearAllStops();
        toast.info("All stops and route cleared");
      });
    }

    // Handle map resize / tab invalidation
    window.addEventListener("resize", () => {
      setTimeout(() => this.map.invalidateSize(), 150);
    });

    // Handle map click for manual exploration
    this.map.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      this.handleMapClick(lat, lng);
    });
  }

  bindStoreEvents() {
    // Focus map camera on given coords
    tripStore.subscribe("map:focus", (coords, zoom = APP_CONSTANTS.DETAIL_ZOOM) => {
      if (!this.map) return;
      this.map.invalidateSize();
      this.map.flyTo(coords, zoom, { duration: 1.5 });
    });

    // Redraw markers and route when stops update
    tripStore.subscribe("stops:changed", (stops) => {
      this.renderStopsOnMap(stops);
    });
  }

  async handleMapClick(lat, lon) {
    const L = window.L;
    if (!L || !this.map) return;

    // Remove any previous temporary exploration pin
    if (this.tempExploreMarker) {
      this.markersLayer.removeLayer(this.tempExploreMarker);
      this.tempExploreMarker = null;
    }

    // Drop new exploration pin with loading state
    this.tempExploreMarker = L.marker([lat, lon], {
      icon: this.createMarkerIcon(0, "dest-pin", "📍")
    }).addTo(this.markersLayer);

    const loadingHtml = `
      <div class="cga-popup-card">
        <div class="cga-popup-loading">
          <span>🔍</span> Identifying location & weather...
        </div>
      </div>
    `;
    this.tempExploreMarker.bindPopup(loadingHtml).openPopup();

    try {
      // 1. In parallel: Reverse geocode real place name & fetch live weather
      const [placeInfo, weather] = await Promise.all([
        reverseGeocode(lat, lon),
        fetchWeather(lat, lon)
      ]);

      const popupContent = `
        <div class="cga-popup-card">
          <div class="cga-popup-title">${placeInfo.flag || "📍"} ${placeInfo.shortName}</div>
          <div class="cga-popup-meta">${placeInfo.subText || "Scenic Destination"}</div>
          <div class="cga-popup-weather">
            ${weather.icon} ${weather.temperature}°C • ${weather.condition}
          </div>
          <div class="cga-popup-actions">
            <button id="popup-explore-dossier" class="cga-popup-btn cga-popup-btn-primary" title="Open complete guide with photos, stories and budget planner">
              🌟 View Travel Guide & Budget
            </button>
            <button id="popup-add-itinerary" class="cga-popup-btn cga-popup-btn-secondary" title="Add directly to your trip route">
              ➕ Add to My Trip
            </button>
          </div>
        </div>
      `;

      this.tempExploreMarker.setPopupContent(popupContent);

      // Attach button event listeners
      setTimeout(() => {
        const exploreBtn = document.getElementById("popup-explore-dossier");
        const addBtn = document.getElementById("popup-add-itinerary");

        if (exploreBtn) {
          exploreBtn.addEventListener("click", () => {
            if (this.tempExploreMarker) {
              this.markersLayer.removeLayer(this.tempExploreMarker);
              this.tempExploreMarker = null;
            }
            tripStore.setCurrentDestination(placeInfo);
            const targetName = placeInfo.shortName || placeInfo.name;
            window.location.hash = `#/destination?place=${encodeURIComponent(targetName)}`;
          });
        }

        if (addBtn) {
          addBtn.addEventListener("click", () => {
            tripStore.addStop(placeInfo, weather);
            const totalStops = tripStore.state.activeTrip.stops.length;
            if (totalStops === 1) {
              toast.success(`📍 ${placeInfo.shortName} added as Stop #1! Click another city on the map to connect the route 🚗`, 4500);
            } else {
              toast.success(`🚗 Route connected to ${placeInfo.shortName}! (${totalStops} stops planned)`, 3500);
            }
            if (this.tempExploreMarker) {
              this.markersLayer.removeLayer(this.tempExploreMarker);
              this.tempExploreMarker = null;
            }
          });
        }
      }, 60);

    } catch (e) {
      console.warn("Map click lookup error:", e);
      if (this.tempExploreMarker) {
        this.tempExploreMarker.setPopupContent(`
          <div class="cga-popup-card">
            <div class="cga-popup-title">Location Pin</div>
            <div class="cga-popup-meta">${lat.toFixed(3)}°, ${lon.toFixed(3)}°</div>
            <button id="popup-fallback-add" class="cga-popup-btn cga-popup-btn-secondary">➕ Add to Route</button>
          </div>
        `);
      }
    }
  }

  async renderStopsOnMap(stops) {
    if (!this.map || !window.L) return;
    const L = window.L;

    this.markersLayer.clearLayers();
    this.routeLayer.clearLayers();
    this.tempExploreMarker = null;

    // Update Floating Map Route Bar
    const routeBar = document.getElementById("map-route-bar");
    const stopsBadge = document.getElementById("map-route-stops-badge");
    const distanceBadge = document.getElementById("map-route-distance-badge");

    if (routeBar) {
      if (!stops || stops.length === 0) {
        routeBar.classList.add("hidden");
        if (distanceBadge) distanceBadge.textContent = "🚗 0 km";
        return;
      } else {
        routeBar.classList.remove("hidden");
        if (stopsBadge) {
          if (stops.length === 1) {
            stopsBadge.textContent = `📍 Stop #1: ${stops[0].name}`;
          } else {
            stopsBadge.textContent = `📍 ${stops.length} Stops Planned`;
          }
        }
      }
    }

    if (!stops || stops.length === 0) return;

    const latLngs = [];

    stops.forEach((stop, index) => {
      const isStart = index === 0;
      const isFinish = index === stops.length - 1 && stops.length > 1;
      const pinType = isStart ? "start-pin" : isFinish ? "dest-pin" : "stop-pin";
      const iconLabel = isStart ? "S" : isFinish ? "🏁" : `${index + 1}`;

      const marker = L.marker([stop.latitude, stop.longitude], {
        icon: this.createMarkerIcon(index, pinType, iconLabel)
      }).addTo(this.markersLayer);

      const popupHtml = `
        <div class="cga-popup-card">
          <div class="cga-popup-title">${stop.name}</div>
          <div class="cga-popup-meta">Stop #${index + 1} • Day ${stop.dayNumber}</div>
          ${stop.weatherSnapshot ? `
            <div class="cga-popup-weather">
              ${stop.weatherSnapshot.icon} ${stop.weatherSnapshot.temperature}°C • ${stop.weatherSnapshot.condition}
            </div>
          ` : ""}
          <div class="cga-popup-actions" style="margin-top: 10px;">
            <button class="cga-popup-btn cga-popup-btn-primary stop-view-dossier-btn" data-stop-id="${stop.stopId}">
              🌟 View Travel Guide
            </button>
            <button class="cga-popup-btn cga-popup-btn-danger stop-remove-btn" data-stop-id="${stop.stopId}">
              🗑️ Remove Stop
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // Wire up buttons when this marker's popup opens
      marker.on("popupopen", () => {
        const viewBtn = document.querySelector(`.stop-view-dossier-btn[data-stop-id="${stop.stopId}"]`);
        const removeBtn = document.querySelector(`.stop-remove-btn[data-stop-id="${stop.stopId}"]`);

        if (viewBtn) {
          viewBtn.addEventListener("click", () => {
            marker.closePopup();
            tripStore.setCurrentDestination(stop);
            window.location.hash = `#/destination?place=${encodeURIComponent(stop.name)}`;
          });
        }

        if (removeBtn) {
          removeBtn.addEventListener("click", () => {
            tripStore.removeStop(stop.stopId);
            toast.info(`Removed ${stop.name} from route`);
            marker.closePopup();
          });
        }
      });

      latLngs.push([stop.latitude, stop.longitude]);
    });

    // If 2 or more stops, calculate and draw driving route
    if (latLngs.length >= 2) {
      if (distanceBadge) {
        distanceBadge.innerHTML = '<span style="display:inline-flex; align-items:center; gap:6px;"><span style="animation: cga-pulse-subtle 0.8s infinite;">🛣️</span> Calculating best route...</span>';
      }
      try {
        const routeData = await calculateRoute(latLngs);
        if (routeData && routeData.geoJsonGeometry) {
          const isFlight = routeData.isFlight;
          const isFallback = routeData.isFallback;

          // Draw Polyline: Solid azure for road trips, dashed gold/amber for flights
          const polyline = L.geoJSON(routeData.geoJsonGeometry, {
            style: {
              color: isFlight ? "#f59e0b" : "#0284c7",
              weight: isFlight ? 3.5 : 5,
              opacity: 0.9,
              dashArray: (isFlight || isFallback) ? "8, 8" : null
            }
          }).addTo(this.routeLayer);

          this.map.fitBounds(polyline.getBounds(), { padding: [80, 80] });

          tripStore.setRouteSummary(
            routeData.distanceKm,
            routeData.durationMins,
            routeData.geoJsonGeometry
          );

          if (distanceBadge) {
            const icon = isFlight ? "✈️ Flight" : "🚗 Road";
            const hours = Math.floor(routeData.durationMins / 60);
            const mins = routeData.durationMins % 60;
            const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
            distanceBadge.textContent = `${icon}: ${routeData.distanceKm} km (${timeStr})`;
          }
        }
      } catch (err) {
        console.error("Route polyline error:", err);
      }
    } else if (latLngs.length === 1) {
      // Don't over-zoom to level 12 so user can easily see surrounding map and click Stop #2
      if (this.map.getZoom() > 9) {
        this.map.panTo(latLngs[0]);
      } else {
        this.map.panTo(latLngs[0]);
      }
      if (distanceBadge) {
        distanceBadge.textContent = "👉 Click 2nd city on map to connect route 🚗";
      }
    }
  }

  createMarkerIcon(index, pinClass, label) {
    const L = window.L;
    return L.divIcon({
      className: "cga-custom-marker",
      html: `
        <div class="cga-marker-pin ${pinClass}">
          <span class="cga-marker-inner">${label}</span>
          ${pinClass === "dest-pin" ? '<div class="cga-marker-pulse"></div>' : ""}
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -36]
    });
  }
}
