/* ==========================================================================
   Cholo Ghure Asssiii — Leaflet Map Engine & Cartography (MapManager.js)
   Conforms to TRD.md §2 & ImplementationPlan.md §2.1
   ========================================================================== */

import { APP_CONSTANTS } from "../config/constants.js";
import { tripStore } from "../state/TripStore.js";
import { calculateRoute } from "../services/RoutingService.js";
import { fetchWeather } from "../services/WeatherService.js";
import { toast } from "./Toast.js";

export class MapManager {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.markersLayer = null;
    this.routeLayer = null;

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
    try {
      const weather = await fetchWeather(lat, lon);
      const clickedPlace = {
        name: `Location [${lat.toFixed(3)}, ${lon.toFixed(3)}]`,
        shortName: `Pin @ ${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
        latitude: lat,
        longitude: lon,
        type: "pin"
      };

      // Drop temporary interactive popup pin
      const L = window.L;
      const marker = L.marker([lat, lon], {
        icon: this.createMarkerIcon(0, "dest-pin", "📍")
      }).addTo(this.markersLayer);

      const popupContent = `
        <div class="cga-popup-card">
          <div class="cga-popup-title">Explored Spot</div>
          <div class="cga-popup-meta">Coords: ${lat.toFixed(3)}°, ${lon.toFixed(3)}°</div>
          <div style="font-size: 13px; font-weight: 700; color: var(--cga-gold-accent); margin-bottom: 8px;">
            ${weather.icon} ${weather.temperature}°C • ${weather.condition}
          </div>
          <button id="popup-add-btn" class="cga-popup-btn">➕ Add to Itinerary</button>
        </div>
      `;

      marker.bindPopup(popupContent).openPopup();

      setTimeout(() => {
        document.getElementById("popup-add-btn")?.addEventListener("click", () => {
          tripStore.addStop(clickedPlace, weather);
          toast.success("Spot added to itinerary!");
          marker.closePopup();
        });
      }, 50);

    } catch (e) {
      console.warn("Map click lookup error:", e);
    }
  }

  async renderStopsOnMap(stops) {
    if (!this.map || !window.L) return;
    const L = window.L;

    this.markersLayer.clearLayers();
    this.routeLayer.clearLayers();

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

      marker.bindPopup(`
        <div class="cga-popup-card">
          <div class="cga-popup-title">${stop.name}</div>
          <div class="cga-popup-meta">Stop #${index + 1} • Day ${stop.dayNumber}</div>
          ${stop.weatherSnapshot ? `
            <div style="font-size: 12px; color: var(--cga-gold-accent); font-weight: 600; margin-bottom: 4px;">
              ${stop.weatherSnapshot.icon} ${stop.weatherSnapshot.temperature}°C (${stop.weatherSnapshot.condition})
            </div>
          ` : ""}
        </div>
      `);

      latLngs.push([stop.latitude, stop.longitude]);
    });

    // If 2 or more stops, calculate and draw OSRM driving route
    if (latLngs.length >= 2) {
      try {
        const routeData = await calculateRoute(latLngs);
        if (routeData && routeData.geoJsonGeometry) {
          // Draw Polyline with electric azure styling
          const polyline = L.geoJSON(routeData.geoJsonGeometry, {
            style: {
              color: "#0284c7",
              weight: 5,
              opacity: 0.9,
              dashArray: routeData.isFallback ? "6, 8" : null
            }
          }).addTo(this.routeLayer);

          this.map.fitBounds(polyline.getBounds(), { padding: [80, 80] });

          tripStore.setRouteSummary(
            routeData.distanceKm,
            routeData.durationMins,
            routeData.geoJsonGeometry
          );
        }
      } catch (err) {
        console.error("Route polyline error:", err);
      }
    } else if (latLngs.length === 1) {
      this.map.flyTo(latLngs[0], 12);
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
