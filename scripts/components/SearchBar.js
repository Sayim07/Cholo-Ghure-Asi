/* ==========================================================================
   Cholo Ghure Asssiii — Search Bar Component (SearchBar.js)
   Integrates Nominatim geocoding & triggers ERA Portal Gate Reveal
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

    this.bindEvents();
  }

  bindEvents() {
    if (this.submitBtn) {
      this.submitBtn.addEventListener("click", () => this.handleSearch());
    }

    if (this.input) {
      this.input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.handleSearch();
        }
      });
    }

    // Close dropdown on outside click
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".cga-search-container") && this.resultsContainer) {
        this.resultsContainer.classList.remove("active");
      }
    });
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

      if (!places || places.length === 0) {
        toast.info(`No destinations found for "${query}". Try popular spots like Darjeeling, Kolkata, or Goa.`);
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
        <div>
          <div class="cga-search-item-title">📍 ${escapeHTML(place.shortName)}</div>
          <div class="cga-search-item-sub">${escapeHTML(place.name)}</div>
        </div>
        <span style="font-size: 11px; font-weight: 700; color: var(--cga-gold-accent);">EXPLORE &rarr;</span>
      `;

      item.addEventListener("click", () => {
        this.resultsContainer.classList.remove("active");
        this.selectPlace(place);
      });

      this.resultsContainer.appendChild(item);
    });
  }

  async selectPlace(place) {
    try {
      toast.info(`Opening gateway to ${place.shortName}...`);
      const weather = await fetchWeather(place.latitude, place.longitude);

      tripStore.setCurrentDestination(place);
      tripStore.emit("map:focus", [place.latitude, place.longitude]);

      // Trigger ERA Residence Door Parting Portal Gate
      if (this.portalGate) {
        this.portalGate.openGate(place, weather);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load destination details.");
    }
  }
}
