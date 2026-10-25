/* ==========================================================================
   Cholo Ghure Asssiii — Right-Side Detail Panel (js/ui/detailPanel.js)
   Primland Behavior: Side panel, map remains interactive & visible
   Solves Image Bug via Wikipedia REST resolution
   ========================================================================== */

import { tripStore } from "../state/TripStore.js";
import { fetchWeather } from "../services/WeatherService.js";
import { getPlacePhoto } from "../services/wikiImages.js";
import { toast } from "../components/Toast.js";
import { getIcon } from "./icons.js";
import { escapeHTML } from "../utils/helpers.js";

export class DetailPanel {
  constructor(panelId) {
    this.panel = document.getElementById(panelId);
    this.currentDestination = null;
    this.currentWeather = null;
    this.selectedTravelMode = "driving";

    this.bindEvents();
  }

  bindEvents() {
    tripStore.subscribe("destination:openDetail", (dest) => {
      this.open(dest);
    });
  }

  async open(destination) {
    this.currentDestination = destination;
    this.panel.classList.add("open");

    // Loading skeleton state
    this.renderSkeleton(destination);

    // Fetch real photo & live weather concurrently
    try {
      const [photoUrl, weather] = await Promise.all([
        getPlacePhoto(destination.name, destination.latitude, destination.longitude),
        fetchWeather(destination.latitude, destination.longitude)
      ]);

      this.currentWeather = weather;
      this.renderContent(destination, photoUrl, weather);
    } catch (err) {
      console.error("[DetailPanel] Error fetching place details:", err);
    }
  }

  close() {
    this.panel.classList.remove("open");
  }

  renderSkeleton(dest) {
    this.panel.innerHTML = `
      <div class="detail-hero-media">
        <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #ece6dc 25%, #f5efe6 50%, #ece6dc 75%); background-size: 200% 100%; animation: pulse 1.5s infinite;"></div>
        <button class="detail-close-btn" id="btn-close-detail">${getIcon("close")}</button>
      </div>
      <div class="detail-body">
        <div style="height: 24px; width: 60%; background: #ece6dc; border-radius: 4px; margin-bottom: 8px;"></div>
        <div style="height: 14px; width: 40%; background: #ece6dc; border-radius: 4px; margin-bottom: 16px;"></div>
        <div style="height: 80px; width: 100%; background: #ece6dc; border-radius: 12px;"></div>
      </div>
    `;

    document.getElementById("btn-close-detail")?.addEventListener("click", () => this.close());
  }

  renderContent(dest, photoUrl, weather) {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${dest.latitude},${dest.longitude}`;
    const bestSeason = dest.type === "mountain" ? "Summer / Autumn ☀️" :
                       dest.type === "beach" ? "Winter / Spring ❄️" : "All Seasons 🌤️";

    this.panel.innerHTML = `
      <div class="detail-panel-scroll">
        <!-- Real Hero Photo -->
        <div class="detail-hero-media">
          <img src="${photoUrl}" alt="${escapeHTML(dest.shortName || dest.name)}" class="detail-hero-image">
          <div class="detail-hero-gradient"></div>
          <div class="detail-source-badge">Wikipedia &copy; Verified</div>
          <button class="detail-close-btn" id="btn-close-detail" title="Close Panel">${getIcon("close")}</button>
        </div>

        <!-- Place Details -->
        <div class="detail-body">
          <h2 class="detail-place-name">${escapeHTML(dest.shortName || dest.name)}</h2>
          <div class="detail-coords-bar">
            ${getIcon("mapPin")} ${dest.latitude.toFixed(4)}° N, ${dest.longitude.toFixed(4)}° E
          </div>

          <p class="detail-description">
            ${escapeHTML(dest.desc || dest.name)}
          </p>

          <!-- Live Weather Widget -->
          <div class="weather-card-container">
            <div class="weather-primary">
              <span style="font-size: 32px;">${weather.icon}</span>
              <div>
                <div class="weather-temp-number">${weather.temperature}°C</div>
                <div class="weather-condition-text">${escapeHTML(weather.condition)}</div>
              </div>
            </div>

            <div class="weather-metrics-grid">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${getIcon("humidity")} Humidity</span>
                <span style="font-family: var(--cga-font-mono); font-weight: 700;">${weather.humidity}%</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${getIcon("wind")} Wind</span>
                <span style="font-family: var(--cga-font-mono); font-weight: 700;">${weather.windSpeed} km/h</span>
              </div>
              <div style="font-size: 11px; color: var(--cga-gold-accent); font-weight: 600; margin-top: 2px;">
                Season: ${bestSeason}
              </div>
            </div>
          </div>

          <!-- Travel Mode Selector -->
          <div class="travel-mode-section">
            <span class="travel-mode-label">SELECT TRAVEL MODE:</span>
            <div class="travel-mode-selector">
              <button class="mode-pill active" data-mode="driving">${getIcon("car")} Drive</button>
              <button class="mode-pill" data-mode="transit">🚆 Transit</button>
              <button class="mode-pill" data-mode="walking">🚶 Walk</button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="detail-actions">
            <button id="btn-detail-add-trip" class="cga-btn-pill cga-btn-primary" style="flex: 1.2; justify-content: center;">
              <span>${getIcon("plus")} Add to Itinerary</span>
            </button>
            <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="cga-btn-pill cga-btn-secondary" style="text-decoration: none; display: flex; align-items: center; gap: 6px;">
              <span>${getIcon("externalLink")} Google Maps</span>
            </a>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    document.getElementById("btn-close-detail")?.addEventListener("click", () => this.close());

    const modePills = this.panel.querySelectorAll(".mode-pill");
    modePills.forEach(pill => {
      pill.addEventListener("click", () => {
        modePills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.selectedTravelMode = pill.dataset.mode;
        toast.info(`Travel mode set to ${pill.textContent.trim()}`);
      });
    });

    document.getElementById("btn-detail-add-trip")?.addEventListener("click", () => {
      try {
        tripStore.addStop(dest, weather);
        toast.success(`"${dest.shortName || dest.name}" added to Day ${tripStore.state.activeDay}!`);
        this.close();
      } catch (e) {
        toast.error(e.message);
      }
    });
  }
}
