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

import { tripStore } from "../state/TripStore.js?v=4.2";
import { toast } from "./Toast.js?v=4.2";
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

    let placeInfo = null;
    if (typeof placeOrName === "string") {
      placeInfo = {
        name: decodeURIComponent(placeOrName),
        shortName: decodeURIComponent(placeOrName),
        latitude: 22.5726,
        longitude: 88.3639,
        type: "city"
      };
    } else if (placeOrName) {
      placeInfo = placeOrName;
    } else {
      // Fallback to active trip destination or default
      placeInfo = tripStore.state.currentDestination || {
        name: "New York City, United States",
        shortName: "New York",
        latitude: 40.7128,
        longitude: -74.0060,
        type: "city",
        flag: "🇺🇸"
      };
    }

    this.currentDestination = placeInfo;
    this.renderSkeleton();

    const cleanName = placeInfo.shortName || placeInfo.name;
    const lat = placeInfo.latitude || 22.5726;
    const lon = placeInfo.longitude || 88.3639;

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
      <div class="dest-skeleton-container">
        <div class="dest-skeleton-hero animate-pulse"></div>
        <div class="dest-skeleton-content">
          <div class="dest-skeleton-line h-8 w-1/3"></div>
          <div class="dest-skeleton-line h-4 w-2/3"></div>
          <div class="dest-skeleton-grid">
            <div class="dest-skeleton-card"></div>
            <div class="dest-skeleton-card"></div>
            <div class="dest-skeleton-card"></div>
          </div>
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

          <!-- Quick Telemetry & Logistics Card -->
          <div class="dest-card">
            <div class="dest-card-header">
              <span class="dest-card-tag">Travel Logistics</span>
              <h3 class="dest-card-title">Journey Essentials</h3>
            </div>
            <div class="dest-quick-stats-list">
              <div class="stat-row">
                <span class="stat-name">🧭 Primary Hub</span>
                <span class="stat-val">${this.selectedOrigin.name}</span>
              </div>
              <div class="stat-row">
                <span class="stat-name">🚗 Transit Distance</span>
                <span class="stat-val">${this.customPlan?.distanceKm || "Calculated on route"} km</span>
              </div>
              <div class="stat-row">
                <span class="stat-name">⏱️ Travel Duration</span>
                <span class="stat-val">${this.customPlan?.durationHours || 4} Hours</span>
              </div>
              <div class="stat-row">
                <span class="stat-name">🛡️ Safe Travel Score</span>
                <span class="stat-val text-green">9.4 / 10 Verified</span>
              </div>
            </div>

            <div class="quick-action-cta">
              <button id="cta-tab-goto-budget" class="btn-block-gold">
                Calculate Trip Cost &rarr;
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
            ⚙️ Custom Expense Calculator
          </button>
          <button class="budget-mode-btn ${this.budgetMode === 'reverse' ? 'active' : ''}" data-budget-mode="reverse">
            💡 Reverse Budget Matcher ("I Have A Budget: Plan For Me")
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
      <!-- Tier Selection (Backpacker, Comfort, Luxury) -->
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
          <h3 class="controls-title">⚙️ Configure Trip Parameters</h3>

          <!-- Departure Hub -->
          <div class="control-field">
            <label class="control-label">Departure Origin Hub</label>
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
            💾 Lock Budget into Active Itinerary
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
              <label class="control-label">Departure Hub</label>
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
                    ${isFeatured ? '⭐ Select Recommended Plan & Lock Route' : '🚀 Select Package & Lock Route'}
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
            <h2 class="tab-heading">Gastronomic Tapestry & Cultural Soul</h2>
            <p class="tab-subheading">Legendary signature dishes, historic food corridors, generational crafts & living folklore</p>
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
        <div class="tab-pane-fade empty-gallery">
          <p>📷 Exploring high-resolution photography archives for this location...</p>
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
            <h2 class="tab-heading">Real-Time Climate & Seasonal Recommendations</h2>
            <p class="tab-subheading">Live satellite readings and optimal visiting calendar</p>
          </div>
        </div>

        <div class="weather-telemetry-grid">
          <div class="weather-card primary">
            <span class="w-label">Live Conditions</span>
            <div class="w-main-stat">
              <span class="w-icon">${weather.icon}</span>
              <span class="w-temp">${weather.temperature}°C</span>
            </div>
            <span class="w-condition">${weather.condition}</span>
          </div>

          <div class="weather-card">
            <span class="w-label">Humidity</span>
            <span class="w-val">💧 ${weather.humidity || 55}%</span>
            <span class="w-sub">Comfortable air density</span>
          </div>

          <div class="weather-card">
            <span class="w-label">Wind Velocity</span>
            <span class="w-val">💨 ${weather.windKmh || 12} km/h</span>
            <span class="w-sub">Gentle breeze</span>
          </div>

          <div class="weather-card">
            <span class="w-label">Atmospheric Advisory</span>
            <span class="w-val text-gold">Optimal for Travel</span>
            <span class="w-sub">Clear visibility across vistas</span>
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
        toast.success(`Locked ₹${this.customPlan.totalCost.toLocaleString('en-IN')} budget into Itinerary! ✈️`);
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
}
