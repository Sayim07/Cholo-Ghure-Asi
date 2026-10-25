/* ==========================================================================
   Cholo Ghure Asssiii — Search Bar Component (SearchBar.js)
   Integrates worldwide Nominatim geocoding with real-time suggestions (3+ chars)
   and triggers ERA Portal Gate Reveal & Map navigation
   ========================================================================== */

import { searchDestination } from "../services/NominatimService.js";
import { fetchWeather } from "../services/WeatherService.js";
import { tripStore } from "../state/TripStore.js";
import { toast } from "./Toast.js";
import { escapeHTML } from "../utils/helpers.js";

export class SearchBar {
  constructor(inputSelector, submitSelector, resultsSelector, portalGate) {
    this.input = document.querySelector(inputSelector);
    this.submitBtn = document.querySelector(submitSelector);
    this.resultsContainer = document.querySelector(resultsSelector);
    this.portalGate = portalGate;
    this.isSearching = false;
    this.typingTimer = null;
    this.cachedResults = [];

    this.bindEvents();
  }

  bindEvents() {
    // 1. Submit button click
    if (this.submitBtn) {
      this.submitBtn.addEventListener("click", () => this.handleSearch());
    }

    // 2. Real-time autocomplete suggestions on typing (3+ characters)
    if (this.input) {
      this.input.addEventListener("input", () => {
        const query = this.input.value.trim();
        clearTimeout(this.typingTimer);

        if (query.length < 3) {
          if (this.resultsContainer) {
            this.resultsContainer.classList.remove("active");
            this.resultsContainer.innerHTML = "";
          }
          return;
        }

        // Show immediate subtle loading hint
        if (this.resultsContainer) {
          this.resultsContainer.classList.add("active");
          this.resultsContainer.innerHTML = `
            <div style="padding: 12px 18px; font-size: 12px; color: var(--cga-text-muted); display: flex; align-items: center; gap: 8px;">
              <span>🧭</span>
              <span>Searching worldwide destinations...</span>
            </div>
          `;
        }

        // Debounce 350ms to allow smooth typing without spamming
        this.typingTimer = setTimeout(() => {
          this.fetchLiveSuggestions(query);
        }, 350);
      });

      // Enter key handler
      this.input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          clearTimeout(this.typingTimer);
          if (this.cachedResults && this.cachedResults.length > 0) {
            this.selectPlace(this.cachedResults[0]);
          } else {
            this.handleSearch();
          }
        } else if (e.key === "Escape") {
          if (this.resultsContainer) {
            this.resultsContainer.classList.remove("active");
          }
        }
      });
    }

    // 3. Close dropdown on outside click
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".cga-search-container") && this.resultsContainer) {
        this.resultsContainer.classList.remove("active");
      }
    });
  }

  async fetchLiveSuggestions(query) {
    try {
      const places = await searchDestination(query);
      
      // Ensure input hasn't been cleared while network request was in flight
      if (this.input.value.trim().length < 3) return;

      this.cachedResults = places;

      if (!places || places.length === 0) {
        if (this.resultsContainer) {
          this.resultsContainer.innerHTML = `
            <div style="padding: 14px 18px; font-size: 12px; color: var(--cga-text-muted); text-align: center;">
              No locations found for "<strong>${escapeHTML(query)}</strong>".<br>
              <span style="font-size: 11px; opacity: 0.8;">Try searching any city, town, landmark, or hill station worldwide.</span>
            </div>
          `;
        }
        return;
      }

      this.renderResults(places);
    } catch (err) {
      if (err.name !== "AbortError" && this.resultsContainer) {
        this.resultsContainer.innerHTML = `
          <div style="padding: 12px 18px; font-size: 12px; color: #ef4444;">
            Unable to connect to geocoding. Please check your network.
          </div>
        `;
      }
    }
  }

  async handleSearch() {
    if (this.isSearching) return;
    const query = this.input.value.trim();

    if (!query) {
      toast.error("Please enter a destination or city to explore.");
      this.input.focus();
      return;
    }

    this.isSearching = true;
    const originalText = this.submitBtn.innerHTML;
    this.submitBtn.innerHTML = "<span>Searching...</span>";
    this.submitBtn.disabled = true;

    try {
      const places = await searchDestination(query);
      this.cachedResults = places;

      if (!places || places.length === 0) {
        toast.info(`No destinations found for "${query}". Try searching any worldwide city or landmark.`);
        return;
      }

      // If exactly 1 match, immediately open gate
      if (places.length === 1) {
        await this.selectPlace(places[0]);
      } else {
        // Show dropdown of top results
        this.renderResults(places);
      }
    } catch (err) {
      toast.error("Search temporarily unavailable. Please try again in a moment.");
    } finally {
      this.isSearching = false;
      this.submitBtn.innerHTML = originalText;
      this.submitBtn.disabled = false;
    }
  }

  renderResults(places) {
    if (!this.resultsContainer) return;
    this.resultsContainer.innerHTML = "";
    this.resultsContainer.classList.add("active");

    places.forEach(place => {
      const item = document.createElement("div");
      item.className = "cga-search-item";
      item.innerHTML = `
        <div style="flex: 1; padding-right: 12px; overflow: hidden;">
          <div class="cga-search-item-title" style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">
            📍 ${escapeHTML(place.shortName)}
          </div>
          <div class="cga-search-item-sub" style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">
            ${escapeHTML(place.name)}
          </div>
        </div>
        <span style="font-size: 10.5px; font-weight: 700; color: var(--cga-gold-accent); flex-shrink: 0; text-transform: uppercase;">
          Explore &rarr;
        </span>
      `;

      item.addEventListener("click", () => {
        this.selectPlace(place);
      });

      this.resultsContainer.appendChild(item);
    });
  }

  async selectPlace(place) {
    if (this.resultsContainer) {
      this.resultsContainer.classList.remove("active");
    }

    if (this.input) {
      this.input.value = place.shortName || place.name;
    }

    // Switch route to #/map if on 3D globe so map view & cards are revealed
    if (window.location.hash !== "#/map") {
      window.location.hash = "#/map";
    }

    try {
      toast.info(`Opening gateway to ${place.shortName}...`);
      const weather = await fetchWeather(place.latitude, place.longitude);

      tripStore.setCurrentDestination(place);
      tripStore.emit("map:focus", [place.latitude, place.longitude]);

      // Trigger Thematic Door Parting Portal Gate
      if (this.portalGate) {
        this.portalGate.openGate(place, weather);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load destination details.");
    }
  }
}
