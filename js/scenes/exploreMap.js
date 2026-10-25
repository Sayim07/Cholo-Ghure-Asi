/* ==========================================================================
   Cholo Ghure Asssiii — Scene 3: Explore Map (js/scenes/exploreMap.js)
   Primland Behavior: Edge-to-edge interactive Leaflet cartography,
   hotspots, category filters, and search opening the side panel
   ========================================================================== */

import { APP_CONSTANTS } from "../config/constants.js";
import { tripStore } from "../state/TripStore.js";
import { searchDestination } from "../services/NominatimService.js";
import { toast } from "../components/Toast.js";
import { getIcon } from "../ui/icons.js";
import { escapeHTML } from "../utils/helpers.js";

// Curated verified hotspots for India with accurate categories
const CURATED_HOTSPOTS = [
  { name: "Victoria Memorial, Kolkata", shortName: "Victoria Memorial", lat: 22.5448, lon: 88.3426, category: "heritage", desc: "Grand white marble palace and gardens celebrating Kolkata's colonial era." },
  { name: "Howrah Bridge, Kolkata", shortName: "Howrah Bridge", lat: 22.5851, lon: 88.3468, category: "heritage", desc: "Historic cantilever bridge over the Hooghly River." },
  { name: "Darjeeling Mall & Tiger Hill", shortName: "Darjeeling", lat: 27.0410, lon: 88.2663, category: "hills", desc: "Misty tea hills with panoramic views of Mount Kanchenjunga." },
  { name: "Taj Mahal, Agra", shortName: "Taj Mahal", lat: 27.1751, lon: 78.0421, category: "heritage", desc: "UNESCO world heritage white marble mausoleum on the Yamuna." },
  { name: "Calangute & Baga Beach, Goa", shortName: "Goa Coast", lat: 15.5439, lon: 73.7553, category: "beach", desc: "Vibrant golden beaches, coastal shacks, and water sports." },
  { name: "Sundarbans Mangrove Reserve", shortName: "Sundarbans", lat: 21.9497, lon: 89.1833, category: "nature", desc: "World's largest mangrove forest, home of the Royal Bengal Tiger." },
  { name: "Varanasi Ghats, Kashi", shortName: "Varanasi", lat: 25.3176, lon: 82.9739, category: "spiritual", desc: "Spiritual heart of India along the sacred Ganges river." },
  { name: "Manali & Solang Valley", shortName: "Manali", lat: 32.2432, lon: 77.1892, category: "hills", desc: "Snowy Himalayan valley popular for skiing and mountain treks." }
];

export class ExploreMapScene {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.markersLayer = null;
    this.activeFilter = "all";

    this.initMap();
    this.bindSearchAndFilters();
    this.renderHotspots();
    this.bindStoreEvents();
  }

  initMap() {
    if (!window.L) return;
    const L = window.L;

    this.map = L.map(this.containerId, {
      zoomControl: false,
      attributionControl: false
    }).setView(APP_CONSTANTS.DEFAULT_CENTER, 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    L.control.zoom({ position: "topright" }).addTo(this.map);
    L.control.attribution({ position: "bottomright", prefix: false }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);

    // Re-invalidate on resize
    window.addEventListener("resize", () => {
      setTimeout(() => this.map.invalidateSize(), 200);
    });

    // Map click drops temporary spot and opens side panel
    this.map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      const clickedPlace = {
        name: `Location [${lat.toFixed(3)}, ${lng.toFixed(3)}]`,
        shortName: `Spot @ ${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
        latitude: lat,
        longitude: lng,
        type: "pin",
        desc: "Custom explored point on the map canvas."
      };
      tripStore.emit("destination:openDetail", clickedPlace);
    });
  }

  bindStoreEvents() {
    tripStore.subscribe("map:focus", (coords, zoom = 12) => {
      if (!this.map) return;
      this.map.invalidateSize();
      this.map.flyTo(coords, zoom, { duration: 2.2 });
    });
  }

  renderHotspots() {
    if (!this.map || !window.L) return;
    const L = window.L;
    this.markersLayer.clearLayers();

    const filtered = this.activeFilter === "all"
      ? CURATED_HOTSPOTS
      : CURATED_HOTSPOTS.filter(h => h.category === this.activeFilter);

    filtered.forEach(spot => {
      const pinIcon = L.divIcon({
        className: "cga-custom-marker",
        html: `
          <div class="cga-marker-pin dest-pin">
            <span class="cga-marker-inner">📍</span>
            <div class="cga-marker-pulse"></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
      });

      const marker = L.marker([spot.lat, spot.lon], { icon: pinIcon }).addTo(this.markersLayer);

      marker.on("click", () => {
        this.map.flyTo([spot.lat, spot.lon], 12, { duration: 1.8 });
        tripStore.emit("destination:openDetail", {
          name: spot.name,
          shortName: spot.shortName,
          latitude: spot.lat,
          longitude: spot.lon,
          type: spot.category,
          desc: spot.desc
        });
      });
    });
  }

  bindSearchAndFilters() {
    // Category chips
    const chips = document.querySelectorAll(".category-chip");
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        chips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        this.activeFilter = chip.dataset.category;
        this.renderHotspots();
        toast.info(`Filtered by: ${chip.textContent.trim()}`);
      });
    });

    // Search bar
    const searchInput = document.getElementById("input-search");
    const searchBtn = document.getElementById("btn-search");
    const dropdown = document.getElementById("search-dropdown-results");

    const triggerSearch = async () => {
      const query = searchInput.value.trim();
      if (!query) {
        toast.error("Please enter a destination to search.");
        return;
      }

      searchBtn.innerHTML = "<span>Searching...</span>";
      searchBtn.disabled = true;

      try {
        const results = await searchDestination(query);
        if (!results || results.length === 0) {
          toast.info(`No places found for "${query}". Try searching "Kolkata", "Darjeeling", etc.`);
          return;
        }

        if (results.length === 1) {
          this.selectSearchedPlace(results[0]);
        } else {
          this.renderDropdown(results, dropdown);
        }
      } catch (err) {
        toast.error("Search temporarily busy. Try again.");
      } finally {
        searchBtn.innerHTML = "Search";
        searchBtn.disabled = false;
      }
    };

    if (searchBtn) searchBtn.addEventListener("click", triggerSearch);
    if (searchInput) {
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          triggerSearch();
        }
      });
    }

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".cga-search-container") && dropdown) {
        dropdown.classList.remove("active");
      }
    });
  }

  renderDropdown(places, dropdown) {
    dropdown.innerHTML = "";
    dropdown.classList.add("active");

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
        dropdown.classList.remove("active");
        this.selectSearchedPlace(place);
      });
      dropdown.appendChild(item);
    });
  }

  selectSearchedPlace(place) {
    toast.info(`Flying to ${place.shortName}...`);
    this.map.flyTo([place.latitude, place.longitude], 12, { duration: 2.2 });

    // Drop temporary pin
    const L = window.L;
    const tempPin = L.marker([place.latitude, place.longitude], {
      icon: L.divIcon({
        className: "cga-custom-marker",
        html: `<div class="cga-marker-pin dest-pin"><span class="cga-marker-inner">★</span></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
      })
    }).addTo(this.markersLayer);

    // Open right-side detail panel with verified Wikipedia photo & live weather!
    tripStore.emit("destination:openDetail", {
      name: place.name,
      shortName: place.shortName,
      latitude: place.latitude,
      longitude: place.longitude,
      type: place.type,
      desc: place.name
    });
  }
}
