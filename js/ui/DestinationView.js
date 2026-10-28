/* ==========================================================================
   Cholo Ghure Asssiii — Dedicated Destination Experience Canvas (DestinationView.js)
   Conforms to shadcn/ui & 21st.dev Design Standards
   Features:
   - Full-Viewport Cinematic Hero with Live Weather, Theme Pill, and Geo-telemetry
   - Sticky Glassmorphism Tabs: Overview, Attractions Bento, Budget Planner, Culture, Gallery
   - Upgraded Multi-Tier Budget Calculator (Backpacker, Comfort, Luxury) with Live Sliders
   - Curated Scenic Photography Gallery (100% Sanitized, Zero Icon/Lock Glitches)
   - 1-Click Route & Itinerary Integration
   ========================================================================== */

import { tripStore } from "../state/TripStore.js";
import { toast } from "./Toast.js";
import { escapeHTML, formatCurrency } from "../utils/helpers.js?v=4.2";
import { WikipediaService } from "../services/WikipediaService.js?v=4.2";
import { fetchWeather } from "../services/WeatherService.js?v=4.2";
import { CuisineCultureService } from "../services/CuisineCultureService.js?v=4.2";
import { 
  TripBudgetEngine, 
  ORIGIN_HUBS, 
  TRANSPORT_MODES, 
  STAY_TIERS 
} from "../services/TripBudgetEngine.js?v=4.2";
import { searchDestination } from "../services/NominatimService.js";

export const CURATED_GLOBAL_DESTINATIONS = [
  {
    name: "Paris, France",
    shortName: "Paris",
    category: "heritage",
    country: "France",
    flag: "🇫🇷",
    badge: "🗼 City of Light",
    desc: "Iconic Eiffel Tower, Louvre masterpieces, romantic Seine cruises & legendary sidewalk bistros.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
    latitude: 48.8566,
    longitude: 2.3522
  },
  {
    name: "Tokyo, Japan",
    shortName: "Tokyo",
    category: "modern",
    country: "Japan",
    flag: "🇯🇵",
    badge: "🍣 Futuristic & Heritage",
    desc: "Shibuya crossing, neon skylines, historic Senso-ji temple, world-class sushi & Mount Fuji day trips.",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
    latitude: 35.6762,
    longitude: 139.6503
  },
  {
    name: "Taj Mahal, Agra, India",
    shortName: "Agra",
    category: "heritage",
    country: "India",
    flag: "🇮🇳",
    badge: "🏛️ Wonder of the World",
    desc: "The timeless ivory-white marble mausoleum on the Yamuna river, Agra Fort & rich Mughal culinary heritage.",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
    latitude: 27.1751,
    longitude: 78.0421
  },
  {
    name: "Bali, Indonesia",
    shortName: "Bali",
    category: "beach",
    country: "Indonesia",
    flag: "🇮🇩",
    badge: "🏖️ Tropical Paradise",
    desc: "Emerald terraced rice paddies in Ubud, sacred sea temples in Tanah Lot, world-class surf & sunset beaches.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    latitude: -8.4095,
    longitude: 115.1889
  },
  {
    name: "Rome, Italy",
    shortName: "Rome",
    category: "heritage",
    country: "Italy",
    flag: "🇮🇹",
    badge: "🏛️ Eternal City",
    desc: "The monumental Colosseum, Roman Forum, Vatican City, St. Peter's Basilica & authentic pasta carbonara.",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
    latitude: 41.9028,
    longitude: 12.4964
  },
  {
    name: "Zermatt & Swiss Alps, Switzerland",
    shortName: "Swiss Alps",
    category: "mountain",
    country: "Switzerland",
    flag: "🇨🇭",
    badge: "🏔️ Alpine Wonderland",
    desc: "Towering Matterhorn peaks, Gornergrat cogwheel train, glacier skiing, fondue & crystal alpine lakes.",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80",
    latitude: 45.9765,
    longitude: 7.7491
  },
  {
    name: "Dubai, United Arab Emirates",
    shortName: "Dubai",
    category: "modern",
    country: "UAE",
    flag: "🇦🇪",
    badge: "✨ Desert Oasis",
    desc: "Towering Burj Khalifa, Dubai Mall fountains, luxury desert dunes safari & Palm Jumeirah vistas.",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    latitude: 25.2048,
    longitude: 55.2708
  },
  {
    name: "New York City, United States",
    shortName: "New York",
    category: "modern",
    country: "United States",
    flag: "🇺🇸",
    badge: "🗽 The Big Apple",
    desc: "Manhattan skyline, Central Park strolls, Broadway theatre, Times Square lights & historic Statue of Liberty.",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
    latitude: 40.7128,
    longitude: -74.0060
  },
  {
    name: "Bangkok, Thailand",
    shortName: "Bangkok",
    category: "beach",
    country: "Thailand",
    flag: "🇹🇭",
    badge: "🍜 Street Food Capital",
    desc: "Ornate Grand Palace, Wat Arun temple on the Chao Phraya river, lively floating markets & legendary Pad Thai.",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80",
    latitude: 13.7563,
    longitude: 100.5018
  },
  {
    name: "Santorini, Greece",
    shortName: "Santorini",
    category: "beach",
    country: "Greece",
    flag: "🇬🇷",
    badge: "🌊 Aegean Dream",
    desc: "Whitewashed cubiform cliff houses in Oia, blue-domed churches, volcanic black sand beaches & caldera sunsets.",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
    latitude: 36.3932,
    longitude: 25.4615
  },
  {
    name: "Kyoto, Japan",
    shortName: "Kyoto",
    category: "heritage",
    country: "Japan",
    flag: "🇯🇵",
    badge: "🍁 Zen Heritage",
    desc: "Fushimi Inari thousand vermillion torii gates, Arashiyama bamboo forest, golden Kinkaku-ji temple & tea ceremonies.",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    latitude: 35.0116,
    longitude: 135.7681
  },
  {
    name: "Manali & Solang Valley, India",
    shortName: "Manali",
    category: "mountain",
    country: "India",
    flag: "🇮🇳",
    badge: "❄️ Himalayan Escape",
    desc: "High-altitude Atal Tunnel, Rohtang Pass snow valleys, Beas river rafting, cedar pine forests & mountain cafes.",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
    latitude: 32.2396,
    longitude: 77.1887
  }
];

export class DestinationView {
  constructor(containerId = "view-destination") {
    this.container = document.getElementById(containerId);
    this.currentDestination = null;
    this.currentWeather = null;
    this.wikiData = null;
    this.galleryImages = [];

    // Active state
    this.activeTab = "overview"; // overview, attractions, budget, culture, gallery, weather
    this.activeCultureCategory = "all"; // all, dishes, eateries, crafts, traditions
    this.currency = "INR"; // INR, USD, EUR
    this.currencyRates = { INR: 1, USD: 0.012, EUR: 0.011 };
    this.currencySymbols = { INR: "₹", USD: "$", EUR: "€" };

    // Budget Planner State
    this.budgetMode = "calculator"; // "calculator" | "reverse"
    this.userCustomBudget = 25000;
    this.budgetTier = "comfort"; // backpacker, comfort, luxury
    this.selectedOrigin = ORIGIN_HUBS[0]; // Default Kolkata
    this.selectedTransport = "driving";
    this.selectedDays = 3;
    this.selectedTravelers = 2;
    this.customPlan = null;
  }

  /**
   * Mount and load a destination by object or query string
   */
  async loadDestination(placeOrName) {
    if (!this.container) return;

    // 1. If no place specified, show the Worldwide Destination Discovery Hub!
    if (!placeOrName) {
      this.currentDestination = null;
      this.renderDestinationHub();
      return;
    }

    // 2. Geocode dynamically to ensure real coordinates and country
    let placeInfo = null;
    if (typeof placeOrName === "string") {
      const cleanTarget = decodeURIComponent(placeOrName).trim();
      this.renderSkeleton(cleanTarget);

      try {
        const found = await searchDestination(cleanTarget);
        if (found && found.length > 0) {
          placeInfo = found[0];
        }
      } catch (err) {
        console.warn("[DestinationView] Geocoding lookup error:", err);
      }

      if (!placeInfo) {
        // Check curated list fallback
        const match = CURATED_GLOBAL_DESTINATIONS.find(d => 
          d.name.toLowerCase().includes(cleanTarget.toLowerCase()) || 
          d.shortName.toLowerCase().includes(cleanTarget.toLowerCase())
        );
        if (match) {
          placeInfo = match;
        } else {
          placeInfo = {
            name: cleanTarget,
            shortName: cleanTarget,
            latitude: 28.6139,
            longitude: 77.2090,
            type: "city"
          };
        }
      }
    } else {
      placeInfo = placeOrName;
    }

    this.currentDestination = placeInfo;
    tripStore.setCurrentDestination(placeInfo);
    this.renderSkeleton(placeInfo.shortName || placeInfo.name);

    const cleanName = placeInfo.shortName || placeInfo.name;
    const lat = placeInfo.latitude || 28.6139;
    const lon = placeInfo.longitude || 77.2090;

    // Fetch live weather, Wikipedia summary, and sanitized gallery in parallel
    try {
      const [weather, wikiSummary, gallery] = await Promise.all([
        fetchWeather(lat, lon),
        WikipediaService.fetchPlaceSummary(cleanName),
        WikipediaService.fetchPlaceGallery(cleanName)
      ]);

      this.currentWeather = weather;
      this.wikiData = wikiSummary;

      // Ensure gallery has high quality photos (or curated travel fallback)
      if (gallery && gallery.length > 0) {
        this.galleryImages = gallery;
      } else {
        this.galleryImages = [
          "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80"
        ];
      }

      // Determine hero image
      if (wikiSummary && wikiSummary.heroImage) {
        this.heroImage = wikiSummary.heroImage;
      } else if (this.galleryImages.length > 0) {
        this.heroImage = this.galleryImages[0];
      } else {
        this.heroImage = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1920&q=80";
      }

      this.render();
    } catch (e) {
      console.error("[DestinationView] Load error:", e);
      this.render();
    }
  }

  detectPlaceTheme(dest) {
    const text = `${dest.name} ${dest.type || ""} ${dest.desc || ""}`.toLowerCase();
    if (text.includes("mountain") || text.includes("hill") || text.includes("alps") || text.includes("peak") || text.includes("darjeeling") || text.includes("himalaya") || text.includes("manali")) {
      return { key: "mountain", label: "Alpine Peak Expedition", icon: "🏔️", color: "#38bdf8" };
    }
    if (text.includes("beach") || text.includes("sea") || text.includes("coast") || text.includes("ocean") || text.includes("goa") || text.includes("island") || text.includes("bali") || text.includes("puri")) {
      return { key: "beach", label: "Coastal Horizon & Sea", icon: "🏖️", color: "#06b6d4" };
    }
    if (text.includes("forest") || text.includes("park") || text.includes("nature") || text.includes("jungle") || text.includes("wildlife") || text.includes("sundarban")) {
      return { key: "nature", label: "Wild Nature Sanctuary", icon: "🌿", color: "#22c55e" };
    }
    return { key: "heritage", label: "Royal Heritage & Metropolis", icon: "🏛️", color: "#eab308" };
  }

  renderSkeleton() {
    this.container.innerHTML = `
      <div class="dest-skeleton-wrap">
        <!-- Top Navigation Bar Skeleton -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div class="cga-skeleton" style="width: 140px; height: 38px; border-radius: 999px;"></div>
          <div style="display: flex; gap: 10px;">
            <div class="cga-skeleton" style="width: 110px; height: 38px; border-radius: 999px;"></div>
            <div class="cga-skeleton" style="width: 140px; height: 38px; border-radius: 999px;"></div>
          </div>
        </div>

        <!-- Hero Skeleton with Shimmer -->
        <div class="dest-skeleton-hero cga-skeleton">
          <div class="cga-skeleton dark dest-skeleton-hero-badge"></div>
          <div class="cga-skeleton dark dest-skeleton-hero-title"></div>
          <div class="cga-skeleton dark dest-skeleton-hero-subtitle"></div>
          <div class="dest-skeleton-hero-pills">
            <div class="cga-skeleton dark dest-skeleton-hero-pill"></div>
            <div class="cga-skeleton dark dest-skeleton-hero-pill"></div>
            <div class="cga-skeleton dark dest-skeleton-hero-pill"></div>
          </div>
        </div>

        <!-- Sticky Tabs Bar Skeleton -->
        <div class="dest-skeleton-tabs-strip">
          <div class="cga-skeleton dest-skeleton-tab-pill"></div>
          <div class="cga-skeleton dest-skeleton-tab-pill"></div>
          <div class="cga-skeleton dest-skeleton-tab-pill"></div>
          <div class="cga-skeleton dest-skeleton-tab-pill"></div>
          <div class="cga-skeleton dest-skeleton-tab-pill"></div>
          <div class="cga-skeleton dest-skeleton-tab-pill"></div>
        </div>

        <!-- Main Narrative & Overview Skeleton -->
        <div class="dest-skeleton-grid">
          <div class="cga-skeleton dest-skeleton-card-large"></div>
          <div class="cga-skeleton dest-skeleton-card-small"></div>
        </div>

        <!-- Bento Grid Skeleton -->
        <div class="dest-skeleton-bento">
          <div class="cga-skeleton dest-skeleton-bento-card"></div>
          <div class="cga-skeleton dest-skeleton-bento-card"></div>
          <div class="cga-skeleton dest-skeleton-bento-card"></div>
        </div>
      </div>
    `;
  }

  render() {
    const dest = this.currentDestination || {};
    const weather = this.currentWeather || { icon: "☀️", temperature: 24, condition: "Clear Sky", humidity: 50, windKmh: 12 };
    const wiki = this.wikiData || {};
    const theme = this.detectPlaceTheme(dest);

    const displayName = wiki.title || dest.shortName || dest.name;
    const subText = dest.subText || wiki.description || "Scenic Worldwide Destination";
    const flag = dest.flag || "📍";
    const lat = dest.latitude ? dest.latitude.toFixed(3) : "22.572";
    const lon = dest.longitude ? dest.longitude.toFixed(3) : "88.364";

    // Compute initial budget plan
    this.recalculatePlan();

    this.container.innerHTML = `
      <div class="cga-dest-page">
        <!-- Top Sticky Action Bar & Breadcrumbs -->
        <header class="dest-nav-bar">
          <div class="dest-nav-left">
            <button id="btn-dest-back-map" class="dest-nav-back-btn" title="Return to Interactive Map">
              <span class="back-arrow">←</span>
              <span>Back to Map</span>
            </button>
            <div class="dest-breadcrumbs">
              <span>Home</span>
              <span class="bc-sep">/</span>
              <span>Explore</span>
              <span class="bc-sep">/</span>
              <span class="bc-active">${escapeHTML(displayName)}</span>
            </div>
          </div>

          <div class="dest-nav-actions">
            <div class="dest-quick-search-pill" title="Jump to any global destination">
              <span>🔍</span>
              <input type="text" id="dest-quick-search-input" class="dest-quick-search-input" placeholder="Jump to place (e.g. Darjeeling)..." autocomplete="off">
            </div>
            <button id="btn-dest-view-globe" class="dest-nav-btn secondary" title="View destination on 3D Planetary Globe">
              <span>🌍 View on Globe</span>
            </button>
            <button id="btn-dest-share-link" class="dest-nav-btn secondary" title="Copy shareable link">
              <span>🔗 Share</span>
            </button>
            <button id="btn-dest-add-itinerary" class="dest-nav-btn primary" title="Add to Multi-Day Itinerary and Route">
              <span>➕ Add to Itinerary & Route</span>
            </button>
          </div>
        </header>

        <!-- Cinematic Hero Header (21st.dev Bento Style) -->
        <section class="dest-hero" style="background-image: linear-gradient(180deg, rgba(17, 28, 20, 0.45) 0%, rgba(17, 28, 20, 0.95) 100%), url('${this.heroImage}');">
          <div class="dest-hero-content">
            <div class="dest-hero-badges">
              <span class="dest-pill-theme" style="border-color: ${theme.color}; color: ${theme.color};">
                ${theme.icon} ${theme.label}
              </span>
              <span class="dest-pill-weather">
                ${weather.icon} ${weather.temperature}°C • ${weather.condition}
              </span>
              <span class="dest-pill-geo">
                📍 ${lat}°, ${lon}°
              </span>
            </div>

            <h1 class="dest-hero-title">${flag} ${escapeHTML(displayName)}</h1>
            <p class="dest-hero-subtitle">${escapeHTML(subText)}</p>

            <div class="dest-hero-meta-strip">
              <div class="meta-item">
                <span class="meta-label">Optimal Season</span>
                <span class="meta-val">🍂 Autumn & ☀️ Summer</span>
              </div>
              <div class="meta-divider"></div>
              <div class="meta-item">
                <span class="meta-label">Suggested Stay</span>
                <span class="meta-val">3 to 5 Days</span>
              </div>
              <div class="meta-divider"></div>
              <div class="meta-item">
                <span class="meta-label">Travel Style</span>
                <span class="meta-val">Culture & Exploration</span>
              </div>
            </div>
          </div>
        </section>

        <!-- shadcn-Style Sticky Tabs Navigation -->
        <nav class="dest-tabs-bar">
          <div class="dest-tabs-container">
            <button class="dest-tab-btn ${this.activeTab === 'overview' ? 'active' : ''}" data-tab="overview">
              <span>📖</span> Overview & Story
            </button>
            <button class="dest-tab-btn ${this.activeTab === 'attractions' ? 'active' : ''}" data-tab="attractions">
              <span>🏛️</span> Top Attractions
            </button>
            <button class="dest-tab-btn ${this.activeTab === 'budget' ? 'active' : ''}" data-tab="budget">
              <span>💰</span> Smart Budget Planner
            </button>
            <button class="dest-tab-btn ${this.activeTab === 'culture' ? 'active' : ''}" data-tab="culture">
              <span>🍜</span> Local Food & Culture
            </button>
            <button class="dest-tab-btn ${this.activeTab === 'gallery' ? 'active' : ''}" data-tab="gallery">
              <span>📸</span> Curated Photos (${this.galleryImages.length})
            </button>
            <button class="dest-tab-btn ${this.activeTab === 'weather' ? 'active' : ''}" data-tab="weather">
              <span>⛅</span> Climate & Seasons
            </button>
          </div>
        </nav>

        <!-- Tab Contents Body -->
        <main class="dest-tab-contents">
          ${this.renderActiveTabContent(displayName, wiki, weather, theme)}
        </main>
      </div>
    `;

    this.bindDOMEvents();
  }

  renderActiveTabContent(displayName, wiki, weather, theme) {
    switch (this.activeTab) {
      case "attractions":
        return this.renderAttractionsTab(displayName);
      case "budget":
        return this.renderBudgetTab(displayName);
      case "culture":
        return this.renderCultureTab(displayName);
      case "gallery":
        return this.renderGalleryTab();
      case "weather":
        return this.renderWeatherTab(weather);
      case "overview":
      default:
        return this.renderOverviewTab(displayName, wiki);
    }
  }

  /**
   * Tab 1: Overview & Story
   */
  renderOverviewTab(displayName, wiki) {
    const extractText = wiki.extract || `${displayName} is one of the world's most captivating travel destinations, renowned for its authentic cultural tapestry, breathtaking architecture, and rich historical heritage.`;
    const cleanExtract = extractText.replace(/\s*\([^)]*\)/g, ""); // clean excessive parenthetical citations

    return `
      <div class="tab-pane-fade">
        <div class="dest-bento-grid">
          <!-- Main Narrative Card -->
          <div class="dest-card span-2 highlight">
            <div class="dest-card-header">
              <span class="dest-card-tag">Chronicle & Heritage</span>
              <h2 class="dest-card-title">Authentic History of ${escapeHTML(displayName)}</h2>
            </div>
            <div class="dest-prose-body">
              <p class="drop-cap-paragraph">${escapeHTML(cleanExtract)}</p>
              ${wiki.contentUrls ? `
                <div class="dest-source-ref">
                  <span>Source: Wikimedia Foundation Archive</span>
                  <a href="${wiki.contentUrls}" target="_blank" rel="noopener noreferrer" class="wiki-external-link">
                    Read Full Encyclopedia Entry &rarr;
                  </a>
                </div>
              ` : ""}
            </div>
          </div>

          <!-- Key Travel Details & Overview Card -->
          <div class="dest-card">
            <div class="dest-card-header">
              <span class="dest-card-tag">Travel Essentials</span>
              <h3 class="dest-card-title">Good to Know</h3>
            </div>
            <div class="dest-quick-stats-list">
              <div class="stat-row">
                <span class="stat-name">🧭 Starting From</span>
                <span class="stat-val">${this.selectedOrigin.name}</span>
              </div>
              <div class="stat-row">
                <span class="stat-name">🚗 Driving Distance</span>
                <span class="stat-val">${this.customPlan?.distanceKm || "Calculated on route"} km</span>
              </div>
              <div class="stat-row">
                <span class="stat-name">⏱️ Travel Time</span>
                <span class="stat-val">${this.customPlan?.durationHours || 4} Hours</span>
              </div>
              <div class="stat-row">
                <span class="stat-name">🛡️ Traveler Safety</span>
                <span class="stat-val text-green">9.4 / 10 Excellent</span>
              </div>
            </div>

            <div class="quick-action-cta">
              <button id="cta-tab-goto-budget" class="btn-block-gold">
                Plan Trip Budget &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Tab 2: Top Attractions (Bento Grid)
   */
  renderAttractionsTab(displayName) {
    const attractions = this.generateAttractions(this.currentDestination);

    return `
      <div class="tab-pane-fade">
        <div class="tab-header-strip">
          <div>
            <h2 class="tab-heading">Must-Visit Sights & Attractions</h2>
            <p class="tab-subheading">Hand-curated landmarks, historical monuments, and scenic vistas in ${escapeHTML(displayName)}</p>
          </div>
          <span class="dest-badge-count">${attractions.length} Curated Sights</span>
        </div>

        <div class="attractions-bento-grid">
          ${attractions.map((att, i) => `
            <div class="attraction-card">
              <div class="attraction-img-wrapper" style="background-image: url('${this.galleryImages[i % this.galleryImages.length] || this.heroImage}');">
                <span class="attraction-type-badge">${att.type}</span>
                <span class="attraction-cost-tag">${att.estTicket}</span>
              </div>
              <div class="attraction-content">
                <div class="attraction-header">
                  <h3 class="attraction-name">${escapeHTML(att.name)}</h3>
                  <span class="attraction-time">⏱️ ${att.duration}</span>
                </div>
                <p class="attraction-desc">${escapeHTML(att.desc)}</p>
                <div class="attraction-footer">
                  <span class="attraction-rating">⭐ 4.9 (Top Rated)</span>
                  <button class="attraction-add-btn" data-attraction="${escapeHTML(att.name)}">
                    ➕ Add to Day Plan
                  </button>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  /**
   * Tab 3: Upgraded Smart Budget Planner (Dual Mode: Custom Calculator + Reverse Budget Matcher)
   */
  renderBudgetTab(displayName) {
    const plan = this.customPlan;
    const currSym = this.currencySymbols[this.currency] || "₹";
    const rate = this.currencyRates[this.currency] || 1;

    const formatMoney = (val) => `${currSym} ${Math.round(val * rate).toLocaleString("en-IN")}`;

    return `
      <div class="tab-pane-fade">
        <div class="tab-header-strip">
          <div>
            <h2 class="tab-heading">Smart Budget & Expense Planner</h2>
            <p class="tab-subheading">Real-time expenditure calculator and reverse package solver for ${escapeHTML(displayName)}</p>
          </div>

          <!-- Currency Switcher Toggle -->
          <div class="currency-toggle-dock">
            <button class="curr-pill ${this.currency === 'INR' ? 'active' : ''}" data-currency="INR">₹ INR</button>
            <button class="curr-pill ${this.currency === 'USD' ? 'active' : ''}" data-currency="USD">$ USD</button>
            <button class="curr-pill ${this.currency === 'EUR' ? 'active' : ''}" data-currency="EUR">€ EUR</button>
          </div>
        </div>

        <!-- Mode Switcher Tabs (shadcn Segmented Control) -->
        <div class="budget-mode-switch-dock">
          <button class="budget-mode-btn ${this.budgetMode === 'calculator' ? 'active' : ''}" data-budget-mode="calculator">
            🧮 Estimate My Trip Cost
          </button>
          <button class="budget-mode-btn ${this.budgetMode === 'reverse' ? 'active' : ''}" data-budget-mode="reverse">
            💡 Plan Around My Budget ("I Have a Budget")
          </button>
        </div>

        ${this.budgetMode === 'calculator' 
          ? this.renderCustomCalculatorSection(displayName, plan, formatMoney)
          : this.renderReverseBudgetSection(displayName, currSym, rate, formatMoney)}
      </div>
    `;
  }

  renderCustomCalculatorSection(displayName, plan, formatMoney) {
    return `
      <!-- Travel Style Selection (Backpacker, Comfort, Luxury) -->
      <div class="budget-tiers-container">
        <div class="tier-card ${this.budgetTier === 'backpacker' ? 'active' : ''}" data-tier="backpacker">
          <div class="tier-icon">🎒</div>
          <div class="tier-info">
            <span class="tier-title">Backpacker & Explorer</span>
            <span class="tier-desc">Hostels, local transit, authentic street food</span>
          </div>
        </div>
        <div class="tier-card ${this.budgetTier === 'comfort' ? 'active' : ''}" data-tier="comfort">
          <div class="tier-icon">✨</div>
          <div class="tier-info">
            <span class="tier-title">Comfort Boutique (Recommended)</span>
            <span class="tier-desc">3-4★ Heritage stays, private transport, cafes</span>
          </div>
        </div>
        <div class="tier-card ${this.budgetTier === 'luxury' ? 'active' : ''}" data-tier="luxury">
          <div class="tier-icon">👑</div>
          <div class="tier-info">
            <span class="tier-title">Ultra Luxury Suite</span>
            <span class="tier-desc">5★ Luxury resorts, chauffeur / flight, fine dining</span>
          </div>
        </div>
      </div>

      <div class="dest-budget-layout">
        <!-- Controls Panel -->
        <div class="budget-controls-card">
          <h3 class="controls-title">✨ Customize Your Trip</h3>

          <!-- Departure City -->
          <div class="control-field">
            <label class="control-label">Departure City</label>
            <select id="budget-origin-select" class="cga-select">
              ${ORIGIN_HUBS.map(hub => `
                <option value="${hub.id}" ${hub.id === this.selectedOrigin.id ? 'selected' : ''}>
                  ${hub.name}
                </option>
              `).join("")}
            </select>
          </div>

          <!-- Transport Mode -->
          <div class="control-field">
            <label class="control-label">Transit Mode</label>
            <div class="transport-options-grid">
              ${Object.values(TRANSPORT_MODES).map(tm => `
                <button class="transport-chip ${this.selectedTransport === tm.id ? 'active' : ''}" data-transport="${tm.id}">
                  <span>${tm.icon}</span> ${tm.name}
                </button>
              `).join("")}
            </div>
          </div>

          <!-- Duration Slider (Days) -->
          <div class="control-field">
            <div class="slider-header">
              <label class="control-label">Trip Duration</label>
              <span class="slider-badge" id="val-days-badge">${this.selectedDays} Days</span>
            </div>
            <input type="range" id="slider-days" min="1" max="14" step="1" value="${this.selectedDays}" class="cga-slider">
          </div>

          <!-- Travelers Count Slider -->
          <div class="control-field">
            <div class="slider-header">
              <label class="control-label">Travelers</label>
              <span class="slider-badge" id="val-travelers-badge">${this.selectedTravelers} Persons</span>
            </div>
            <input type="range" id="slider-travelers" min="1" max="8" step="1" value="${this.selectedTravelers}" class="cga-slider">
          </div>
        </div>

        <!-- Total Prediction Summary Card -->
        <div class="budget-summary-card">
          <div class="summary-top">
            <span class="summary-tag">Total Estimated Outlay</span>
            <div class="summary-total-price">${formatMoney(plan.totalCost)}</div>
            <span class="summary-subtext">${formatMoney(plan.costPerPerson)} per traveler (${this.selectedDays} days)</span>
          </div>

          <!-- Itemized Cost Breakdown Progress Bars -->
          <div class="breakdown-list">
            <div class="breakdown-item">
              <div class="item-head">
                <span>🏨 Lodging & Stay</span>
                <span class="item-cost">${formatMoney(plan.breakdown.stay)}</span>
              </div>
              <div class="progress-bar"><div class="fill" style="width: 45%;"></div></div>
            </div>

            <div class="breakdown-item">
              <div class="item-head">
                <span>🚗 Transit & Travel</span>
                <span class="item-cost">${formatMoney(plan.breakdown.transit)}</span>
              </div>
              <div class="progress-bar"><div class="fill" style="width: 30%;"></div></div>
            </div>

            <div class="breakdown-item">
              <div class="item-head">
                <span>🍽️ Food & Dining</span>
                <span class="item-cost">${formatMoney(plan.breakdown.food)}</span>
              </div>
              <div class="progress-bar"><div class="fill" style="width: 15%;"></div></div>
            </div>

            <div class="breakdown-item">
              <div class="item-head">
                <span>🎟️ Passes & Activities</span>
                <span class="item-cost">${formatMoney(plan.breakdown.activities)}</span>
              </div>
              <div class="progress-bar"><div class="fill" style="width: 10%;"></div></div>
            </div>
          </div>

          <button id="btn-budget-save-to-trip" class="btn-save-plan-primary">
            💾 Save Budget to My Trip Plan
          </button>
        </div>
      </div>
    `;
  }

  renderReverseBudgetSection(displayName, currSym, rate, formatMoney) {
    const packages = TripBudgetEngine.generateBudgetPackages({
      origin: this.selectedOrigin,
      destination: this.currentDestination,
      userBudget: this.userCustomBudget,
      travelers: this.selectedTravelers
    });

    return `
      <div class="reverse-budget-panel">
        <div class="reverse-budget-control-card">
          <div class="reverse-budget-inputs-row">
            <div>
              <label class="control-label">Your Target Budget</label>
              <div class="reverse-budget-input-group">
                <span class="reverse-currency-symbol">${currSym}</span>
                <input type="number" id="input-reverse-budget" class="reverse-budget-input" value="${this.userCustomBudget}" min="5000" max="500000" step="1000">
              </div>
              <input type="range" id="slider-reverse-budget" min="5000" max="250000" step="1000" value="${this.userCustomBudget}" class="cga-slider" style="margin-top: 10px;">
              <div class="budget-preset-chips">
                <button class="preset-chip ${this.userCustomBudget === 15000 ? 'active' : ''}" data-preset="15000">₹15,000</button>
                <button class="preset-chip ${this.userCustomBudget === 25000 ? 'active' : ''}" data-preset="25000">₹25,000</button>
                <button class="preset-chip ${this.userCustomBudget === 50000 ? 'active' : ''}" data-preset="50000">₹50,000</button>
                <button class="preset-chip ${this.userCustomBudget === 100000 ? 'active' : ''}" data-preset="100000">₹1,00,000</button>
                <button class="preset-chip ${this.userCustomBudget === 200000 ? 'active' : ''}" data-preset="200000">₹2,00,000</button>
              </div>
            </div>

            <div>
              <label class="control-label">Departure City</label>
              <select id="budget-origin-select-reverse" class="cga-select">
                ${ORIGIN_HUBS.map(hub => `
                  <option value="${hub.id}" ${hub.id === this.selectedOrigin.id ? 'selected' : ''}>
                    ${hub.name}
                  </option>
                `).join("")}
              </select>
            </div>

            <div>
              <label class="control-label">Travelers</label>
              <select id="select-travelers-reverse" class="cga-select">
                ${[1, 2, 3, 4, 5, 6, 8].map(n => `
                  <option value="${n}" ${n === this.selectedTravelers ? 'selected' : ''}>
                    ${n} Traveler${n > 1 ? 's' : ''}
                  </option>
                `).join("")}
              </select>
            </div>
          </div>
        </div>

        <div class="reverse-packages-bento-grid">
          ${packages.map((pkg, idx) => {
            const isFeatured = pkg.id === 'case-comfort';
            const costFormatted = formatMoney(pkg.plan.breakdown.total);
            const perPersonFormatted = formatMoney(Math.round(pkg.plan.breakdown.total / pkg.travelers));
            const savingsFormatted = formatMoney(pkg.savings);
            const deficitFormatted = formatMoney(pkg.plan.breakdown.total - this.userCustomBudget);

            return `
              <div class="reverse-package-card ${isFeatured ? 'featured' : ''}">
                <div>
                  <span class="reverse-package-badge">${pkg.badge}</span>
                  <h3 class="reverse-package-title">${escapeHTML(pkg.title)}</h3>
                  <div class="reverse-package-price-wrap">
                    <span class="reverse-package-price">${costFormatted}</span>
                    <span class="reverse-package-per-person">/ total (${pkg.days} Days)</span>
                  </div>
                  <div style="font-size: 12.5px; color: var(--cga-text-secondary); margin-bottom: 8px;">
                    ${perPersonFormatted} per person (${pkg.travelers} traveler${pkg.travelers > 1 ? 's' : ''})
                  </div>

                  <div class="reverse-package-savings ${pkg.fits ? 'fit' : 'over'}">
                    ${pkg.fits 
                      ? `✨ Within Budget! Surplus: ${savingsFormatted}` 
                      : `⚡ Requires +${deficitFormatted} over budget`}
                  </div>

                  <ul class="reverse-package-list">
                    ${pkg.highlights.map(h => `<li>${escapeHTML(h)}</li>`).join("")}
                  </ul>
                </div>

                <div>
                  <button class="btn-select-package" data-pkg-id="${pkg.id}" data-pkg-days="${pkg.days}" data-pkg-transport="${pkg.transportMode}" data-pkg-stay="${pkg.stayTier}" data-pkg-cost="${pkg.plan.breakdown.total}" data-pkg-title="${escapeHTML(pkg.title)}">
                    ${isFeatured ? '⭐ Choose Recommended Plan & Add to Trip' : '🚀 Choose This Plan & Add to Trip'}
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  /**
   * Tab 4: Upgraded Living Food & Culture Experience (Bento Grid, Authentic Dishes, Street Eateries & Heritage Arts)
   */
  renderCultureTab(displayName) {
    const cultureData = CuisineCultureService.getCuisineAndCulture(this.currentDestination, this.wikiData);
    const filter = this.activeCultureCategory || "all";

    const showDishes = filter === "all" || filter === "dishes";
    const showEateries = filter === "all" || filter === "eateries";
    const showCrafts = filter === "all" || filter === "crafts";
    const showTraditions = filter === "all" || filter === "traditions";

    return `
      <div class="tab-pane-fade">
        <div class="tab-header-strip">
          <div>
            <h2 class="tab-heading">Local Food Flavors & Living Culture</h2>
            <p class="tab-subheading">Legendary signature dishes, famous food spots, traditional crafts & folklore</p>
          </div>
        </div>

        <!-- Atmospheric Quote Banner -->
        <div class="culture-quote-banner">
          <p class="culture-quote-text">"${cultureData.quote}"</p>
          <span class="culture-quote-tagline">${cultureData.tagline}</span>
        </div>

        <!-- Interactive Category Filter Chips -->
        <div class="culture-filter-dock">
          <button class="culture-filter-btn ${filter === 'all' ? 'active' : ''}" data-culture-filter="all">
            🌟 All Experiences
          </button>
          <button class="culture-filter-btn ${filter === 'dishes' ? 'active' : ''}" data-culture-filter="dishes">
            🍛 Must-Eat Dishes (${cultureData.signatureDishes.length})
          </button>
          <button class="culture-filter-btn ${filter === 'eateries' ? 'active' : ''}" data-culture-filter="eateries">
            🍢 Street Eateries & Cafes (${cultureData.streetEateries.length})
          </button>
          <button class="culture-filter-btn ${filter === 'crafts' ? 'active' : ''}" data-culture-filter="crafts">
            🏺 Living Crafts & Guilds (${cultureData.craftsAndArts.length})
          </button>
          <button class="culture-filter-btn ${filter === 'traditions' ? 'active' : ''}" data-culture-filter="traditions">
            🎭 Festivals & Etiquette
          </button>
        </div>

        <!-- Section 1: Signature Culinary Legends -->
        ${showDishes ? `
          <div class="culture-section-title-wrap">
            <h3 class="culture-section-heading">
              <span>🍛</span> Must-Taste Culinary Legends of ${escapeHTML(displayName)}
            </h3>
            <span class="culture-section-count">${cultureData.signatureDishes.length} Iconic Specialties</span>
          </div>

          <div class="food-dishes-grid">
            ${cultureData.signatureDishes.map(dish => `
              <div class="food-dish-card">
                <div class="food-dish-img-wrap" style="background-image: url('${dish.image}');">
                  <span class="food-diet-badge ${dish.diet === 'Veg' ? 'veg' : 'non-veg'}">
                    ${dish.diet === 'Veg' ? '🟢 100% Veg' : '🔴 ' + dish.diet}
                  </span>
                  <span class="food-price-badge">${dish.price}</span>
                  <div class="food-dish-bottom-overlay">
                    <span class="food-tag-pill">${dish.tag}</span>
                    <span class="food-rating-pill">⭐ ${dish.rating}</span>
                  </div>
                </div>

                <div class="food-dish-body">
                  <div class="food-dish-header">
                    <h4 class="food-dish-title">${escapeHTML(dish.name)}</h4>
                    ${dish.localName ? `<div class="food-dish-local-name">${escapeHTML(dish.localName)}</div>` : ""}
                  </div>

                  <p class="food-dish-desc">${escapeHTML(dish.desc)}</p>

                  <div class="food-dish-spot-box">
                    <span class="food-dish-spot-label">📍 Best Legendary Spots</span>
                    <div>${escapeHTML(dish.famousSpot)}</div>
                    ${dish.timing ? `<div class="food-dish-timing">⏱️ ${escapeHTML(dish.timing)}</div>` : ""}
                  </div>

                  <button class="btn-add-food-stop" data-dish-name="${escapeHTML(dish.name)}" data-dish-spot="${escapeHTML(dish.famousSpot)}">
                    <span>➕ Add Food Stop to Itinerary</span>
                  </button>
                </div>
              </div>
            `).join("")}
          </div>
        ` : ""}

        <!-- Section 2: Legendary Street Food Eateries & Cafes -->
        ${showEateries && cultureData.streetEateries.length > 0 ? `
          <div class="culture-section-title-wrap">
            <h3 class="culture-section-heading">
              <span>🍢</span> Iconic Heritage Eateries & Food Corridors
            </h3>
            <span class="culture-section-count">${cultureData.streetEateries.length} Foodie Landmarks</span>
          </div>

          <div class="eateries-grid">
            ${cultureData.streetEateries.map(eatery => `
              <div class="eatery-card">
                <div class="eatery-img-wrap" style="background-image: url('${eatery.image}');">
                  <span class="eatery-badge">${eatery.badge}</span>
                </div>
                <div class="eatery-body">
                  <h4 class="eatery-name">${escapeHTML(eatery.name)}</h4>
                  <p class="eatery-specialty"><strong>Signature:</strong> ${escapeHTML(eatery.specialty)}</p>
                  <p style="font-size: 12.5px; color: var(--cga-text-muted); line-height: 1.4; margin-bottom: 12px;">
                    <em>${escapeHTML(eatery.vibe)}</em>
                  </p>
                  <div class="eatery-footer">
                    <span>⏱️ ${escapeHTML(eatery.hours)}</span>
                    <span class="eatery-price">${eatery.priceRange}</span>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        ` : ""}

        <!-- Section 3: Living Crafts & Artisanship -->
        ${showCrafts && cultureData.craftsAndArts.length > 0 ? `
          <div class="culture-section-title-wrap">
            <h3 class="culture-section-heading">
              <span>🏺</span> Living Crafts, Master Artisans & Souvenirs
            </h3>
            <span class="culture-section-count">${cultureData.craftsAndArts.length} Generational Guilds</span>
          </div>

          <div class="crafts-grid">
            ${cultureData.craftsAndArts.map(craft => `
              <div class="craft-card">
                <div class="craft-img-wrap" style="background-image: url('${craft.image}');"></div>
                <div class="craft-body">
                  <span class="craft-tag">${craft.category}</span>
                  <h4 class="craft-title">${escapeHTML(craft.title)}</h4>
                  <p class="craft-desc">${escapeHTML(craft.desc)}</p>
                  <div class="craft-souvenir-box">
                    <strong>🎁 Recommended Souvenir:</strong> ${escapeHTML(craft.souvenir)}
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        ` : ""}

        <!-- Section 4: Festivals & Cultural Etiquette -->
        ${showTraditions ? `
          <div class="culture-section-title-wrap">
            <h3 class="culture-section-heading">
              <span>🎭</span> Living Traditions & Cultural Etiquette
            </h3>
            <span class="culture-section-count">Local Wisdom</span>
          </div>

          <div class="crafts-grid" style="margin-bottom: 24px;">
            ${cultureData.festivalsAndTraditions.map(fest => `
              <div class="craft-card" style="padding: 20px;">
                <span class="craft-tag" style="color: var(--cga-forest-contrast);">📅 ${fest.season}</span>
                <h4 class="craft-title" style="margin-top: 6px;">${escapeHTML(fest.title)}</h4>
                <p class="craft-desc">${escapeHTML(fest.desc)}</p>
                <div class="craft-souvenir-box" style="background: rgba(34, 197, 94, 0.08); border-left-color: #16a34a;">
                  <strong>✨ Cultural Significance:</strong> ${escapeHTML(fest.highlight)}
                </div>
              </div>
            `).join("")}
          </div>

          <h4 style="font-family: var(--cga-font-serif); font-size: 16px; font-weight: 700; color: var(--cga-forest-contrast); margin-bottom: 12px;">
            💡 Insider Traveler Etiquette for ${escapeHTML(displayName)}
          </h4>
          <div class="etiquette-bento-strip">
            ${cultureData.etiquette.map(tip => `
              <div class="etiquette-card">
                <span class="etiquette-icon">🧭</span>
                <span class="etiquette-text">${escapeHTML(tip)}</span>
              </div>
            `).join("")}
          </div>
        ` : ""}
      </div>
    `;
  }

  /**
   * Tab 5: Sanitized Curated Photo Gallery
   */
  renderGalleryTab() {
    if (!this.galleryImages || this.galleryImages.length === 0) {
      return `
        <div class="tab-pane-fade">
          <div class="tab-header-strip">
            <div>
              <h2 class="tab-heading">Curated Scenic Photography Gallery</h2>
              <p class="tab-subheading">Loading high-resolution photos captured by travelers...</p>
            </div>
            <span class="dest-badge-count">Finding Photos...</span>
          </div>
          <div class="dest-photo-gallery-grid">
            <div class="cga-skeleton" style="height: 220px; border-radius: 14px;"></div>
            <div class="cga-skeleton" style="height: 220px; border-radius: 14px;"></div>
            <div class="cga-skeleton" style="height: 220px; border-radius: 14px;"></div>
            <div class="cga-skeleton" style="height: 220px; border-radius: 14px;"></div>
            <div class="cga-skeleton" style="height: 220px; border-radius: 14px;"></div>
            <div class="cga-skeleton" style="height: 220px; border-radius: 14px;"></div>
          </div>
        </div>
      `;
    }

    return `
      <div class="tab-pane-fade">
        <div class="tab-header-strip">
          <div>
            <h2 class="tab-heading">Curated Scenic Photography Gallery</h2>
            <p class="tab-subheading">Authentic high-resolution imagery captured by travelers & Wikimedia Commons</p>
          </div>
          <span class="dest-badge-count">${this.galleryImages.length} High-Res Photos</span>
        </div>

        <div class="dest-photo-gallery-grid">
          ${this.galleryImages.map((imgUrl, i) => `
            <div class="gallery-photo-item" style="background-image: url('${imgUrl}');" data-img-url="${imgUrl}" title="Click to view full photo">
              <div class="photo-overlay">
                <span>🔍 View Image</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  /**
   * Tab 6: Weather & Climate
   */
  renderWeatherTab(weather) {
    return `
      <div class="tab-pane-fade">
        <div class="tab-header-strip">
          <div>
            <h2 class="tab-heading">Real-Time Climate & Travel Conditions</h2>
            <p class="tab-subheading">Live weather readings and best times to visit</p>
          </div>
        </div>

        <div class="weather-telemetry-grid">
          <div class="weather-card primary">
            <span class="w-label">Current Weather</span>
            <div class="w-main-stat">
              <span class="w-icon">${weather.icon}</span>
              <span class="w-temp">${weather.temperature}°C</span>
            </div>
            <span class="w-condition">${weather.condition}</span>
          </div>

          <div class="weather-card">
            <span class="w-label">Humidity</span>
            <span class="w-val">💧 ${weather.humidity || 55}%</span>
            <span class="w-sub">Pleasant and comfortable</span>
          </div>

          <div class="weather-card">
            <span class="w-label">Wind Speed</span>
            <span class="w-val">💨 ${weather.windKmh || 12} km/h</span>
            <span class="w-sub">Gentle breeze</span>
          </div>

          <div class="weather-card">
            <span class="w-label">Travel Weather Tip</span>
            <span class="w-val text-gold">Great for Travel</span>
            <span class="w-sub">Clear skies and great visibility</span>
          </div>
        </div>
      </div>
    `;
  }

  recalculatePlan() {
    if (!this.currentDestination) return;

    const stayTierMap = {
      backpacker: "budget",
      comfort: "comfort",
      luxury: "luxury"
    };
    const mappedStay = stayTierMap[this.budgetTier] || "comfort";

    const planData = TripBudgetEngine.calculateTripPlan({
      origin: this.selectedOrigin,
      destination: this.currentDestination,
      transportMode: this.selectedTransport,
      stayTier: mappedStay,
      days: this.selectedDays,
      travelers: this.selectedTravelers
    });

    const total = planData.breakdown.total;
    const perPerson = Math.round(total / (this.selectedTravelers || 1));
    const hours = Math.round(planData.travelTimeMins / 60);

    this.customPlan = {
      distanceKm: planData.distanceKm,
      durationHours: hours > 0 ? hours : 1,
      totalCost: total,
      costPerPerson: perPerson,
      breakdown: {
        stay: planData.breakdown.lodgingCost,
        transit: planData.breakdown.transportCost,
        food: planData.breakdown.foodCost,
        activities: planData.breakdown.activitiesCost,
        buffer: planData.breakdown.bufferCost
      }
    };
  }

  generateAttractions(dest) {
    const name = dest?.shortName || dest?.name || "Destination";
    const theme = this.detectPlaceTheme(dest || {});
    
    if (theme.key === "mountain") {
      return [
        { name: `${name} Sunrise Viewpoint`, type: "Scenic Vista", duration: "2 - 3 Hours", estTicket: "Free Entry", desc: "Panoramic high-altitude vantage point offering breathtaking sunrise vistas over snow-clad mountain peaks." },
        { name: `${name} Heritage Monastery`, type: "Spiritual Monument", duration: "1.5 Hours", estTicket: "₹ 50", desc: "Centuries-old sanctuary adorned with prayer flags, ancient frescoes, and tranquil meditation gardens." },
        { name: `${name} Alpine Botanical Sanctuary`, type: "Nature & Flora", duration: "2 Hours", estTicket: "₹ 120", desc: "Lush protected reserve featuring rare rhododendrons, alpine flora, and mist-laden pine canopy trails." },
        { name: `${name} Mall Road & Promenade`, type: "Cultural Promenade", duration: "2 - 3 Hours", estTicket: "Free Entry", desc: "Lively heritage pedestrian square brimming with artisan cafes, craft boutiques, and historic architecture." }
      ];
    } else if (theme.key === "beach") {
      return [
        { name: `${name} Golden Sands Beach`, type: "Coastal Shoreline", duration: "3 - 4 Hours", estTicket: "Free Entry", desc: "Pristine sun-drenched coastline offering azure waters, gentle ocean breezes, and golden sunset horizons." },
        { name: `${name} Historic Lighthouse & Cliff`, type: "Maritime Monument", duration: "1.5 Hours", estTicket: "₹ 80", desc: "Colonial-era clifftop beacon offering 360-degree ocean panoramas and dramatic wave breaks below." },
        { name: `${name} Marine Sanctuary & Coral Cove`, type: "Eco Adventure", duration: "3 Hours", estTicket: "₹ 450", desc: "Protected marine reserve popular for snorkeling, coastal birdwatching, and vibrant sea fauna." },
        { name: `${name} Sunset Promenade & Seafood Pier`, type: "Culinary & Evening", duration: "2 Hours", estTicket: "Free Entry", desc: "Bustling coastal pier with grilled ocean catches, beachside shacks, and live acoustic music." }
      ];
    } else {
      return [
        { name: `${name} Royal Palace & Fortress`, type: "Historic Architecture", duration: "3 Hours", estTicket: "₹ 150", desc: "Magnificent heritage complex showcasing royal dynastic opulence, grand archways, and museum galleries." },
        { name: `${name} Central Heritage Square`, type: "Urban Monument", duration: "2 Hours", estTicket: "Free Entry", desc: "Historic epicenter flanked by iconic landmarks, colonial monuments, and vibrant cultural fountains." },
        { name: `${name} Artisans Craft Bazaar`, type: "Living Tradition", duration: "2 - 3 Hours", estTicket: "Free Entry", desc: "Atmospheric traditional market known for indigenous handlooms, brass antiquities, and street gastronomy." },
        { name: `${name} Riverside Memorial & Gardens`, type: "Serene Landmark", duration: "1.5 Hours", estTicket: "₹ 40", desc: "Peaceful manicured sanctuary with classical marble sculptures, walking trails, and sunset promenades." }
      ];
    }
  }

  bindDOMEvents() {
    // 1. Navigation buttons & quick search
    document.getElementById("btn-dest-back-map")?.addEventListener("click", () => {
      window.location.hash = "#/map";
    });

    document.getElementById("btn-dest-view-globe")?.addEventListener("click", () => {
      window.location.hash = "#/globe";
    });

    const quickInput = document.getElementById("dest-quick-search-input");
    if (quickInput) {
      quickInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && quickInput.value.trim()) {
          window.location.hash = `#/destination?place=${encodeURIComponent(quickInput.value.trim())}`;
        }
      });
    }

    document.getElementById("btn-dest-share-link")?.addEventListener("click", () => {
      const url = `${window.location.origin}/#/destination?place=${encodeURIComponent(this.currentDestination.shortName || this.currentDestination.name)}`;
      navigator.clipboard?.writeText(url);
      toast.success("Destination link copied to clipboard! 📋");
    });

    document.getElementById("btn-dest-add-itinerary")?.addEventListener("click", () => {
      if (this.currentDestination) {
        tripStore.addStop(this.currentDestination, this.currentWeather);
        toast.success(`Added ${this.currentDestination.shortName || this.currentDestination.name} to itinerary! 🚗`);
        window.location.hash = "#/map";
      }
    });

    // 2. Tab switcher
    const tabBtns = document.querySelectorAll(".dest-tab-btn");
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        this.activeTab = btn.getAttribute("data-tab");
        this.render();
      });
    });

    // 3. CTA in Overview
    document.getElementById("cta-tab-goto-budget")?.addEventListener("click", () => {
      this.activeTab = "budget";
      this.render();
    });

    // 4. Currency Switcher
    const currBtns = document.querySelectorAll(".curr-pill");
    currBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        this.currency = btn.getAttribute("data-currency");
        this.render();
      });
    });

    // 5. Budget Mode Switcher (Custom Calculator vs Reverse Matcher)
    const modeBtns = document.querySelectorAll(".budget-mode-btn");
    modeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        this.budgetMode = btn.getAttribute("data-budget-mode");
        this.render();
      });
    });

    // 6. Reverse Budget Controls & Presets
    const revInput = document.getElementById("input-reverse-budget");
    if (revInput) {
      revInput.addEventListener("change", (e) => {
        const val = parseInt(e.target.value, 10);
        if (val && val >= 1000) {
          this.userCustomBudget = val;
          this.render();
        }
      });
    }

    const revSlider = document.getElementById("slider-reverse-budget");
    if (revSlider) {
      revSlider.addEventListener("input", (e) => {
        this.userCustomBudget = parseInt(e.target.value, 10);
        this.render();
      });
    }

    const presetChips = document.querySelectorAll(".preset-chip");
    presetChips.forEach(chip => {
      chip.addEventListener("click", () => {
        this.userCustomBudget = parseInt(chip.getAttribute("data-preset"), 10);
        this.render();
      });
    });

    const revOrigin = document.getElementById("budget-origin-select-reverse");
    if (revOrigin) {
      revOrigin.addEventListener("change", (e) => {
        const found = ORIGIN_HUBS.find(h => h.id === e.target.value);
        if (found) {
          this.selectedOrigin = found;
          this.render();
        }
      });
    }

    const revTravelers = document.getElementById("select-travelers-reverse");
    if (revTravelers) {
      revTravelers.addEventListener("change", (e) => {
        this.selectedTravelers = parseInt(e.target.value, 10);
        this.render();
      });
    }

    // 7. Select Curated Budget Package
    const pkgBtns = document.querySelectorAll(".btn-select-package");
    pkgBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const pkgDays = parseInt(btn.getAttribute("data-pkg-days"), 10);
        const pkgTransport = btn.getAttribute("data-pkg-transport");
        const pkgStay = btn.getAttribute("data-pkg-stay");
        const pkgCost = parseInt(btn.getAttribute("data-pkg-cost"), 10);
        const pkgTitle = btn.getAttribute("data-pkg-title");

        this.selectedDays = pkgDays;
        this.selectedTransport = pkgTransport;
        this.budgetTier = pkgStay === "budget" ? "backpacker" : pkgStay;

        if (this.currentDestination) {
          tripStore.addStop(this.currentDestination, this.currentWeather);
          tripStore.state.activeTrip.totalBudget = pkgCost;
          tripStore.persistTrip();
          toast.success(`Selected "${pkgTitle}"! Budget set to ₹${pkgCost.toLocaleString('en-IN')}. ✈️`);
        }
      });
    });

    // 8. Custom Calculator Tier Switcher
    const tierCards = document.querySelectorAll(".tier-card");
    tierCards.forEach(card => {
      card.addEventListener("click", () => {
        this.budgetTier = card.getAttribute("data-tier");
        this.recalculatePlan();
        this.render();
      });
    });

    // 9. Custom Calculator Origin Hub Select
    const originSelect = document.getElementById("budget-origin-select");
    if (originSelect) {
      originSelect.addEventListener("change", (e) => {
        const found = ORIGIN_HUBS.find(h => h.id === e.target.value);
        if (found) {
          this.selectedOrigin = found;
          this.recalculatePlan();
          this.render();
        }
      });
    }

    // 10. Transport Chips
    const transChips = document.querySelectorAll(".transport-chip");
    transChips.forEach(chip => {
      chip.addEventListener("click", () => {
        this.selectedTransport = chip.getAttribute("data-transport");
        this.recalculatePlan();
        this.render();
      });
    });

    // 11. Sliders (Days & Travelers)
    const daysSlider = document.getElementById("slider-days");
    if (daysSlider) {
      daysSlider.addEventListener("input", (e) => {
        this.selectedDays = parseInt(e.target.value, 10);
        this.recalculatePlan();
        this.render();
      });
    }

    const travelersSlider = document.getElementById("slider-travelers");
    if (travelersSlider) {
      travelersSlider.addEventListener("input", (e) => {
        this.selectedTravelers = parseInt(e.target.value, 10);
        this.recalculatePlan();
        this.render();
      });
    }

    // 12. Save Plan into Active Trip
    document.getElementById("btn-budget-save-to-trip")?.addEventListener("click", () => {
      if (this.currentDestination && this.customPlan) {
        tripStore.addStop(this.currentDestination, this.currentWeather);
        tripStore.state.activeTrip.totalBudget = this.customPlan.totalCost;
        tripStore.persistTrip();
        toast.success(`Saved ₹${this.customPlan.totalCost.toLocaleString('en-IN')} budget into your Trip Plan! ✈️`);
      }
    });

    // 13. Photo Gallery Lightbox Click
    const galleryItems = document.querySelectorAll(".gallery-photo-item");
    galleryItems.forEach(item => {
      item.addEventListener("click", () => {
        const url = item.getAttribute("data-img-url");
        if (url) {
          window.open(url, "_blank");
        }
      });
    });

    // 14. Culture Category Filter Switcher
    const cultureFilterBtns = document.querySelectorAll(".culture-filter-btn");
    cultureFilterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        this.activeCultureCategory = btn.getAttribute("data-culture-filter");
        this.render();
      });
    });

    // 15. Add Food Stop to Itinerary
    const addFoodBtns = document.querySelectorAll(".btn-add-food-stop");
    addFoodBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const dishName = btn.getAttribute("data-dish-name");
        const dishSpot = btn.getAttribute("data-dish-spot");
        if (this.currentDestination) {
          const cleanSpot = dishSpot ? dishSpot.split('&')[0].trim() : "";
          const foodPlace = {
            name: `${dishName} (${cleanSpot})`,
            shortName: dishName,
            latitude: this.currentDestination.latitude,
            longitude: this.currentDestination.longitude,
            type: "food_experience"
          };
          tripStore.addStop(foodPlace, this.currentWeather);
          toast.success(`Added "${dishName}" to your Itinerary! 🍽️`);
        }
      });
    });
  }

  /**
   * Worldwide Destination Guide Hub (When no specific place is requested)
   */
  renderDestinationHub() {
    if (!this.container) return;
    const activeStops = tripStore.state.activeTrip?.stops || [];
    const filter = this.activeHubCategory || "all";

    const filtered = filter === "all" 
      ? CURATED_GLOBAL_DESTINATIONS 
      : CURATED_GLOBAL_DESTINATIONS.filter(d => d.category === filter);

    this.container.innerHTML = `
      <div class="dest-hub-wrapper">
        
        <!-- Hero Search Section -->
        <div class="dest-hub-hero">
          <span class="dest-hub-badge">🌍 Worldwide Travel Guides</span>
          <h1 class="dest-hub-title">Explore Destination Guides</h1>
          <p class="dest-hub-subtitle">
            Authentic history, signature food, living cultures, real-time weather, and smart budgets for iconic destinations across the globe.
          </p>

          <div class="dest-hub-search-box">
            <span style="font-size: 18px; color: var(--cga-gold-accent);">🔍</span>
            <input type="text" id="dest-hub-search-input" class="dest-hub-search-input" placeholder="Search any city, country, or landmark (e.g. Paris, Tokyo, Bali, Agra, Dubai, Rome)..." autocomplete="off" />
            <button id="dest-hub-search-submit" class="dest-hub-search-btn">Search Guide</button>
          </div>
        </div>

        <!-- Optional: From Your Active Trip -->
        ${activeStops.length > 0 ? `
          <div class="dest-hub-trip-strip">
            <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--cga-forest-contrast);">
              📍 From Your Current Trip:
            </span>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
              ${activeStops.map(s => `
                <button class="cga-hub-trip-chip" data-dest-name="${escapeHTML(s.name)}">
                  <span>${escapeHTML(s.name)}</span>
                  <span style="font-size: 10px; opacity: 0.7;">Day ${s.dayNumber} ➔</span>
                </button>
              `).join("")}
            </div>
          </div>
        ` : ""}

        <!-- Category Filter Chips -->
        <div class="dest-hub-filter-dock">
          <button class="dest-hub-filter-chip ${filter === 'all' ? 'active' : ''}" data-hub-cat="all">🌟 Worldwide Highlights (${CURATED_GLOBAL_DESTINATIONS.length})</button>
          <button class="dest-hub-filter-chip ${filter === 'heritage' ? 'active' : ''}" data-hub-cat="heritage">🏛️ Heritage & History</button>
          <button class="dest-hub-filter-chip ${filter === 'mountain' ? 'active' : ''}" data-hub-cat="mountain">🏔️ Mountains & Alpine</button>
          <button class="dest-hub-filter-chip ${filter === 'beach' ? 'active' : ''}" data-hub-cat="beach">🏖️ Beaches & Tropical</button>
          <button class="dest-hub-filter-chip ${filter === 'modern' ? 'active' : ''}" data-hub-cat="modern">🌆 Iconic Cities</button>
        </div>

        <!-- Curated Destinations Grid -->
        <div class="dest-hub-grid">
          ${filtered.map(dest => `
            <div class="dest-hub-card">
              <div class="dest-hub-card-img" style="background-image: url('${dest.image}');">
                <span class="dest-hub-card-badge">${dest.badge}</span>
                <span class="dest-hub-card-flag">${dest.flag}</span>
              </div>
              <div class="dest-hub-card-body">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--cga-gold-accent);">
                  ${dest.country}
                </div>
                <h3 class="dest-hub-card-name">${escapeHTML(dest.name)}</h3>
                <p class="dest-hub-card-desc">${escapeHTML(dest.desc)}</p>
                <button class="btn-hub-open-guide" data-dest-name="${escapeHTML(dest.shortName)}">
                  <span>Explore Guide &rarr;</span>
                </button>
              </div>
            </div>
          `).join("")}
        </div>

      </div>
    `;

    this.bindHubEvents();
  }

  bindHubEvents() {
    const input = document.getElementById("dest-hub-search-input");
    const submitBtn = document.getElementById("dest-hub-search-submit");

    const doSearch = () => {
      const q = input?.value.trim();
      if (q) {
        window.location.hash = `#/destination?place=${encodeURIComponent(q)}`;
      }
    };

    if (submitBtn) submitBtn.addEventListener("click", doSearch);
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          doSearch();
        }
      });
    }

    // Filter chips
    const filterChips = document.querySelectorAll(".dest-hub-filter-chip");
    filterChips.forEach(chip => {
      chip.addEventListener("click", () => {
        this.activeHubCategory = chip.getAttribute("data-hub-cat");
        this.renderDestinationHub();
      });
    });

    // Card buttons
    const guideBtns = document.querySelectorAll(".btn-hub-open-guide, .cga-hub-trip-chip");
    guideBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const name = btn.getAttribute("data-dest-name");
        if (name) {
          window.location.hash = `#/destination?place=${encodeURIComponent(name)}`;
        }
      });
    });
  }
}
