/* ==========================================================================
   Cholo Ghure Asssiii — Thematic Architectural & Nature Gate Reveal (PortalGate.js)
   Inspired by ERA Residence Door Parting + Place Themes:
   - 🏔️ Mountain: Misty alpine peak clouds parting
   - 🏖️ Beach/Sea: Turquoise ocean wave & sunburst parting
   - 🏛️ Heritage/Palace: Royal golden wrought-iron doors opening
   - 🌿 Nature/Forest: Emerald canopy foliage parting
   Includes: Real photos, Google Maps navigation link, Travel Mode selector
   ========================================================================== */

import { tripStore } from "../state/TripStore.js";
import { toast } from "./Toast.js";
import { escapeHTML } from "../utils/helpers.js";

export class PortalGate {
  constructor() {
    this.overlay = document.getElementById("portal-overlay");
    this.content = document.getElementById("portal-content");
    this.closeBtn = document.getElementById("portal-close-btn");
    this.currentDestination = null;
    this.currentWeather = null;
    this.selectedTravelMode = "driving";

    window.portalGateInstance = this;

    this.bindEvents();
  }

  bindEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.closeGate());
    }

    const backdrop = document.querySelector(".cga-portal-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", () => this.closeGate());
    }
  }

  detectPlaceTheme(dest) {
    const text = `${dest.name} ${dest.type || ""} ${dest.desc || ""}`.toLowerCase();
    if (text.includes("mountain") || text.includes("hill") || text.includes("alps") || text.includes("peak") || text.includes("darjeeling") || text.includes("himalaya")) {
      return { key: "mountain", label: "Alpine Peak Expedition", icon: "🏔️", doorClass: "theme-mountain" };
    }
    if (text.includes("beach") || text.includes("sea") || text.includes("coast") || text.includes("ocean") || text.includes("goa") || text.includes("island") || text.includes("bali")) {
      return { key: "beach", label: "Coastal Horizon & Sea", icon: "🏖️", doorClass: "theme-beach" };
    }
    if (text.includes("forest") || text.includes("park") || text.includes("nature") || text.includes("jungle") || text.includes("wildlife")) {
      return { key: "nature", label: "Wild Nature Sanctuary", icon: "🌿", doorClass: "theme-nature" };
    }
    return { key: "heritage", label: "Royal Heritage & Architecture", icon: "🏛️", doorClass: "theme-heritage" };
  }

  getDefaultImageForPlace(dest, themeKey) {
    if (dest.image) return dest.image;
    if (themeKey === "mountain") {
      return "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80";
    }
    if (themeKey === "beach") {
      return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80";
    }
    if (themeKey === "nature") {
      return "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80";
    }
    return "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1000&q=80";
  }

  /**
   * Open the luxury portal with place-specific theme doors
   */
  openGate(destination, weather) {
    this.currentDestination = destination;
    this.currentWeather = weather;

    const theme = this.detectPlaceTheme(destination);

    // Apply theme class to doors
    const doors = document.querySelectorAll(".cga-gate-door");
    doors.forEach(d => {
      d.className = `cga-gate-door ${d.classList.contains("left") ? "left" : "right"} ${theme.doorClass}`;
    });

    this.renderContent(theme);
    this.overlay.classList.add("active");

    // Play ERA Residence Door Parting with GSAP
    if (window.gsap) {
      const tl = window.gsap.timeline();
      tl.to(".cga-gate-door.left", { xPercent: -100, duration: 0.95, ease: "power3.inOut" })
        .to(".cga-gate-door.right", { xPercent: 100, duration: 0.95, ease: "power3.inOut" }, "<")
        .fromTo(this.content, 
          { opacity: 0, scale: 0.92, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(1.3)" }, "-=0.3"
        );
    } else {
      this.overlay.classList.add("open");
    }
  }

  closeGate() {
    if (window.gsap) {
      const tl = window.gsap.timeline({
        onComplete: () => {
          this.overlay.classList.remove("active");
          this.overlay.classList.remove("open");
        }
      });
      tl.to(this.content, { opacity: 0, scale: 0.92, y: 20, duration: 0.35, ease: "power2.in" })
        .to(".cga-gate-door.left", { xPercent: 0, duration: 0.7, ease: "power3.inOut" })
        .to(".cga-gate-door.right", { xPercent: 0, duration: 0.7, ease: "power3.inOut" }, "<");
    } else {
      this.overlay.classList.remove("open");
      setTimeout(() => this.overlay.classList.remove("active"), 400);
    }
  }

  renderContent(theme) {
    if (!this.currentDestination || !this.content) return;
    const dest = this.currentDestination;
    const weather = this.currentWeather || {
      temperature: 24,
      condition: "Pleasant",
      humidity: 58,
      windSpeed: 12,
      icon: "🌤️"
    };

    const container = document.getElementById("portal-destination-details");
    if (!container) return;

    const imageUrl = this.getDefaultImageForPlace(dest, theme.key);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${dest.latitude},${dest.longitude}`;

    container.innerHTML = `
      <!-- Place Hero Image Banner -->
      <div class="dest-hero-image-wrap">
        <img src="${imageUrl}" alt="${escapeHTML(dest.shortName || dest.name)}" class="dest-hero-image" onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80'">
        <div class="dest-hero-gradient"></div>
        <div class="dest-theme-badge">
          <span>${theme.icon} ${theme.label}</span>
        </div>
      </div>

      <!-- Destination Title & Description -->
      <div class="destination-modal-header" style="margin-top: 16px; margin-bottom: 16px;">
        <h2 class="dest-title">${escapeHTML(dest.shortName || dest.name)}</h2>
        <div class="dest-coords">📍 ${dest.latitude.toFixed(4)}° N, ${dest.longitude.toFixed(4)}° E</div>
        <p style="font-size: 13.5px; color: var(--cga-text-secondary); line-height: 1.6; margin-top: 8px;">
          ${escapeHTML(dest.desc || dest.name)}
        </p>
      </div>

      <!-- Live Open-Meteo Weather Widget -->
      <div class="weather-card-container">
        <div class="weather-primary">
          <span class="weather-icon-large">${weather.icon}</span>
          <div class="weather-temp-wrap">
            <span class="weather-temp-number">${weather.temperature}°C</span>
            <span class="weather-condition-text">${escapeHTML(weather.condition)}</span>
          </div>
        </div>

        <div class="weather-metrics-grid">
          <div class="metric-row">
            <span>Humidity</span>
            <span class="metric-val">💧 ${weather.humidity}%</span>
          </div>
          <div class="metric-row">
            <span>Wind Speed</span>
            <span class="metric-val">💨 ${weather.windSpeed} km/h</span>
          </div>
        </div>
      </div>

      <!-- Travel Mode Selection (Lightship RV Style) -->
      <div class="travel-mode-section">
        <span class="travel-mode-label">SELECT TRAVEL MODE:</span>
        <div class="travel-mode-selector">
          <button class="mode-pill active" data-mode="driving">🚗 Drive</button>
          <button class="mode-pill" data-mode="transit">🚆 Train / Transit</button>
          <button class="mode-pill" data-mode="walking">🚶 Walk / Trek</button>
        </div>
      </div>

      <!-- Action Buttons: Add to Trip, Open in Google Maps, Focus -->
      <div class="dest-action-row">
        <button id="modal-add-to-trip-btn" class="cga-btn-pill cga-btn-primary" style="flex: 1.2; justify-content: center; height: 46px; font-size: 14px;">
          <span>➕ Add to Itinerary</span>
        </button>
        <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="cga-btn-pill cga-btn-secondary" style="height: 46px; text-decoration: none; display: flex; align-items: center; gap: 6px;">
          <span>🗺️ Google Maps</span>
        </a>
        <button id="modal-explore-map-btn" class="cga-btn-pill cga-btn-secondary" style="height: 46px; padding: 0 16px;" title="Focus in Leaflet">
          <span>🎯 Focus</span>
        </button>
      </div>
    `;

    // Travel mode buttons
    const modePills = container.querySelectorAll(".mode-pill");
    modePills.forEach(pill => {
      pill.addEventListener("click", () => {
        modePills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.selectedTravelMode = pill.dataset.mode;
        toast.info(`Travel mode set to ${pill.textContent.trim()}`);
      });
    });

    // Add to Itinerary
    document.getElementById("modal-add-to-trip-btn")?.addEventListener("click", () => {
      try {
        tripStore.addStop(dest, weather);
        toast.success(`"${dest.shortName || dest.name}" added to Day ${tripStore.state.activeDay}!`);
        this.closeGate();
      } catch (e) {
        toast.error(e.message);
      }
    });

    // Focus on Map
    document.getElementById("modal-explore-map-btn")?.addEventListener("click", () => {
      this.closeGate();
      tripStore.emit("map:focus", [dest.latitude, dest.longitude], 13);
    });
  }
}
