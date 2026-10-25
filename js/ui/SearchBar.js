/* ==========================================================================
   Cholo Ghure Asssiii — Real-Time Global Search Bar Component (SearchBar.js)
   Features:
   - Instant Dual-Engine Worldwide Autocomplete (Photon + Nominatim)
   - Real-time suggestions on 2+ characters with 200ms debounce
   - Keyboard Navigation (ArrowUp, ArrowDown, Enter, Escape)
   - Visual Place Type Icons & Country Flag Emojis
   - Substring match highlighting & One-click Clear button
   - Seamless Route Transition to #/map & ERA Portal Gate Reveal
   ========================================================================== */

import { searchDestination } from "../services/NominatimService.js";
import { fetchWeather } from "../services/WeatherService.js";
import { tripStore } from "../state/TripStore.js";
import { toast } from "./Toast.js";
import { escapeHTML } from "../utils/helpers.js";

function escapeRegex(string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
}

function highlightMatch(text, query) {
  if (!text) return "";
  if (!query) return escapeHTML(text);
  const escapedText = escapeHTML(text);
  const regex = new RegExp(`(${escapeRegex(escapeHTML(query))})`, "gi");
  return escapedText.replace(regex, "<mark>$1</mark>");
}

export class SearchBar {
  constructor(inputSelector, submitSelector, resultsSelector, portalGate) {
    this.input = document.querySelector(inputSelector);
    this.submitBtn = document.querySelector(submitSelector);
    this.resultsContainer = document.querySelector(resultsSelector);
    this.clearBtn = document.getElementById("btn-clear-search");
    this.portalGate = portalGate;

    this.isSearching = false;
    this.typingTimer = null;
    this.cachedResults = [];
    this.selectedIndex = -1;

    this.bindEvents();
  }

  bindEvents() {
    // 1. Submit button click
    if (this.submitBtn) {
      this.submitBtn.addEventListener("click", () => this.handleSearch());
    }

    // 2. Clear button click
    if (this.clearBtn) {
      this.clearBtn.addEventListener("click", () => {
        this.input.value = "";
        this.clearBtn.style.display = "none";
        this.closeResults();
        this.input.focus();
      });
    }

    // 3. Real-time typing & Autocomplete
    if (this.input) {
      this.input.addEventListener("input", () => {
        const query = this.input.value.trim();

        // Toggle clear button
        if (this.clearBtn) {
          this.clearBtn.style.display = query.length > 0 ? "inline-flex" : "none";
        }

        clearTimeout(this.typingTimer);

        if (query.length < 2) {
          this.closeResults();
          return;
        }

        // Show instant loading skeleton
        this.showLoadingHint(query);

        // Snappy 200ms debounce for natural typing flow
        this.typingTimer = setTimeout(() => {
          this.fetchLiveSuggestions(query);
        }, 200);
      });

      // 4. Keyboard Navigation (ArrowUp, ArrowDown, Enter, Escape)
      this.input.addEventListener("keydown", (e) => {
        if (!this.resultsContainer || !this.resultsContainer.classList.contains("active")) {
          if (e.key === "Enter") {
            e.preventDefault();
            this.handleSearch();
          }
          return;
        }

        const items = this.resultsContainer.querySelectorAll(".cga-search-item");

        if (e.key === "ArrowDown") {
          e.preventDefault();
          this.selectedIndex = (this.selectedIndex + 1) % items.length;
          this.updateHighlight(items);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
          this.updateHighlight(items);
        } else if (e.key === "Enter") {
          e.preventDefault();
          clearTimeout(this.typingTimer);

          if (this.selectedIndex >= 0 && this.cachedResults[this.selectedIndex]) {
            this.selectPlace(this.cachedResults[this.selectedIndex]);
          } else if (this.cachedResults.length > 0) {
            this.selectPlace(this.cachedResults[0]);
          } else {
            this.handleSearch();
          }
        } else if (e.key === "Escape") {
          this.closeResults();
        }
      });
    }

    // 5. Close on outside click
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".cga-search-container")) {
        this.closeResults();
      }
    });
  }

  showLoadingHint(query) {
    if (!this.resultsContainer) return;
    this.resultsContainer.classList.add("active");
    this.resultsContainer.innerHTML = `
      <div style="padding: 12px 16px; font-size: 12.5px; color: var(--cga-text-muted); display: flex; align-items: center; gap: 10px;">
        <span style="display: inline-block; animation: pulse 0.8s infinite alternate;">🧭</span>
        <span>Searching global destinations for "<strong>${escapeHTML(query)}</strong>"...</span>
      </div>
    `;
  }

  updateHighlight(items) {
    items.forEach((item, idx) => {
      if (idx === this.selectedIndex) {
        item.classList.add("highlighted");
        item.scrollIntoView({ block: "nearest", behavior: "smooth" });
      } else {
        item.classList.remove("highlighted");
      }
    });
  }

  closeResults() {
    if (this.resultsContainer) {
      this.resultsContainer.classList.remove("active");
      this.resultsContainer.innerHTML = "";
    }
    this.selectedIndex = -1;
  }

  async fetchLiveSuggestions(query) {
    try {
      const places = await searchDestination(query);

      // Verify input hasn't been emptied or replaced
      if (this.input.value.trim().length < 2) return;

      this.cachedResults = places || [];
      this.selectedIndex = -1;

      if (!places || places.length === 0) {
        if (this.resultsContainer) {
          this.resultsContainer.innerHTML = `
            <div style="padding: 16px 18px; font-size: 12px; color: var(--cga-text-muted); text-align: center;">
              No places found matching "<strong>${escapeHTML(query)}</strong>".<br>
              <span style="font-size: 11px; opacity: 0.8; margin-top: 4px; display: inline-block;">
                Search any city, town, hill station, street, or country worldwide.
              </span>
            </div>
          `;
        }
        return;
      }

      this.renderResults(places, query);
    } catch (err) {
      // Stale/aborted searches are ignored
    }
  }

  async handleSearch() {
    if (this.isSearching) return;
    const query = this.input.value.trim();

    if (!query) {
      toast.error("Please enter a destination to explore.");
      this.input.focus();
      return;
    }

    this.isSearching = true;
    const originalText = this.submitBtn.innerHTML;
    this.submitBtn.innerHTML = "<span>Searching...</span>";
    this.submitBtn.disabled = true;

    try {
      const places = await searchDestination(query);
      this.cachedResults = places || [];

      if (!places || places.length === 0) {
        toast.info(`No destinations found for "${query}". Try searching any worldwide location.`);
        return;
      }

      // Automatically select and dive into the top destination match!
      const target = (this.selectedIndex >= 0 && this.cachedResults[this.selectedIndex])
        ? this.cachedResults[this.selectedIndex]
        : places[0];
      await this.selectPlace(target);
    } catch (err) {
      toast.error("Search temporarily unavailable. Please try again.");
    } finally {
      this.isSearching = false;
      this.submitBtn.innerHTML = originalText;
      this.submitBtn.disabled = false;
    }
  }

  renderResults(places, query) {
    if (!this.resultsContainer) return;
    this.resultsContainer.innerHTML = "";
    this.resultsContainer.classList.add("active");

    places.forEach((place, index) => {
      const item = document.createElement("div");
      item.className = "cga-search-item";
      item.dataset.index = index;

      const titleHTML = highlightMatch(place.shortName, query);
      const subHTML = escapeHTML(place.subText || place.name);
      const badgeText = place.countryCode || place.type || "VISIT";

      item.innerHTML = `
        <div class="cga-search-item-icon">
          ${place.icon || "📍"}
        </div>
        <div class="cga-search-item-info">
          <div class="cga-search-item-title">
            <span>${titleHTML}</span>
            <span style="font-size: 13px;" title="${escapeHTML(place.countryCode || '')}">${place.flag || ""}</span>
          </div>
          <div class="cga-search-item-sub">
            ${subHTML}
          </div>
        </div>
        <div class="cga-search-item-badge">
          ${escapeHTML(badgeText)}
        </div>
      `;

      item.addEventListener("click", () => {
        this.selectPlace(place);
      });

      item.addEventListener("mouseenter", () => {
        this.selectedIndex = index;
        const allItems = this.resultsContainer.querySelectorAll(".cga-search-item");
        allItems.forEach((it, i) => it.classList.toggle("highlighted", i === index));
      });

      this.resultsContainer.appendChild(item);
    });
  }

  async selectPlace(place) {
    this.closeResults();

    if (this.input) {
      this.input.value = place.shortName || place.name;
      if (this.clearBtn) this.clearBtn.style.display = "inline-flex";
    }

    // Switch route to #/map if currently on #/globe
    if (window.location.hash !== "#/map") {
      window.location.hash = "#/map";
    }

    try {
      toast.info(`Opening gateway to ${place.shortName}...`);
      const weather = await fetchWeather(place.latitude, place.longitude);

      tripStore.setCurrentDestination(place);
      tripStore.emit("map:focus", [place.latitude, place.longitude], 13);

      // Open Thematic Door Parting Portal Gate
      if (this.portalGate) {
        this.portalGate.openGate(place, weather);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load destination details.");
    }
  }
}
