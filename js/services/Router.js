/* ==========================================================================
   Cholo Ghure Asssiii — Client-Side SPA Router (Router.js)
   Provides dedicated URL hash routing for all application views:
   - #/globe     : 3D Voyager Globe Onboarding & Global Exploration
   - #/map       : Interactive Leaflet Map, Search & Driving Routes Canvas
   - #/itinerary : Multi-Day Itinerary Drawer & Itemized Budget Manager
   - #/saved     : Cloud Saved Trips & Firestore Archive Modal
   ========================================================================== */

export class AppRouter {
  constructor({ voyagerGlobe, mapManager, itineraryView, savedTripsModal, portalGate, destinationView }) {
    this.voyagerGlobe = voyagerGlobe;
    this.mapManager = mapManager;
    this.itineraryView = itineraryView;
    this.savedTripsModal = savedTripsModal;
    this.portalGate = portalGate;
    this.destinationView = destinationView;

    this.navLinks = document.querySelectorAll(".cga-nav-link");
    this.previousRoute = "#/globe";

    this.routes = {
      "#/globe": () => this.showGlobeView(),
      "#/map": () => this.showMapView(),
      "#/destination": () => this.showDestinationView(),
      "#/itinerary": () => this.showItineraryView(),
      "#/saved": () => this.showSavedTripsView()
    };

    window.addEventListener("hashchange", () => this.handleRoute());
  }

  init() {
    const initialHash = window.location.hash ? window.location.hash.split("?")[0] : "";
    if (!initialHash || !this.routes[initialHash]) {
      // Default initial view
      window.location.hash = "#/globe";
    } else {
      this.handleRoute();
    }
  }

  handleRoute() {
    const rawHash = window.location.hash || "#/globe";
    const path = rawHash.split("?")[0];

    // Ignore in-page section anchor links (e.g., #section-attractions, #section-culture)
    if (!path.startsWith("#/")) {
      return;
    }

    // Update active state on navigation pills (both drawer and any navbar links)
    const links = document.querySelectorAll(".cga-nav-link");
    links.forEach(link => {
      const href = link.getAttribute("href");
      if (href === path) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Close slide-over sheet drawer if open
    const sheetOverlay = document.getElementById("cga-sheet-overlay");
    const sheetDrawer = document.getElementById("cga-sheet-drawer");
    if (sheetOverlay) sheetOverlay.classList.remove("open");
    if (sheetDrawer) sheetDrawer.classList.remove("open");

    const handler = this.routes[path] || this.routes["#/globe"];
    handler();
  }

  showGlobeView() {
    this.previousRoute = "#/globe";

    this.hideDestinationView();

    if (this.savedTripsModal && this.savedTripsModal.modal) {
      this.savedTripsModal.close();
    }
    if (this.itineraryView && this.itineraryView.drawer) {
      this.itineraryView.drawer.classList.add("collapsed");
    }
    if (this.portalGate && this.portalGate.overlay) {
      this.portalGate.closeGate();
    }
    if (this.voyagerGlobe) {
      this.voyagerGlobe.showGlobe();
    }
  }

  showMapView() {
    this.previousRoute = "#/map";

    this.hideDestinationView();

    if (this.savedTripsModal && this.savedTripsModal.modal) {
      this.savedTripsModal.close();
    }
    if (this.itineraryView && this.itineraryView.drawer) {
      this.itineraryView.drawer.classList.add("collapsed");
    }
    if (this.voyagerGlobe && this.voyagerGlobe.section) {
      this.voyagerGlobe.section.classList.add("hidden");
    }
    if (this.mapManager && this.mapManager.map) {
      setTimeout(() => this.mapManager.map.invalidateSize(), 150);
    }
  }

  showDestinationView() {
    this.previousRoute = "#/destination";
    document.body.classList.add("viewing-destination");

    // Hide map-specific search container and HUD
    const searchContainer = document.querySelector(".cga-search-container");
    if (searchContainer) searchContainer.classList.add("hidden");
    const hud = document.getElementById("telemetry-hud");
    if (hud) hud.classList.add("hidden");
    const mapRouteBar = document.getElementById("map-route-bar");
    if (mapRouteBar) mapRouteBar.classList.add("hidden");

    if (this.savedTripsModal && this.savedTripsModal.modal) {
      this.savedTripsModal.close();
    }
    if (this.itineraryView && this.itineraryView.drawer) {
      this.itineraryView.drawer.classList.add("collapsed");
    }
    if (this.voyagerGlobe && this.voyagerGlobe.section) {
      this.voyagerGlobe.section.classList.add("hidden");
    }
    if (this.portalGate && this.portalGate.overlay) {
      this.portalGate.closeGate();
    }

    const destSection = document.getElementById("view-destination");
    if (destSection) {
      destSection.classList.remove("hidden");
    }

    // Extract query parameter ?place=...
    const fullHash = window.location.hash || "";
    const placeMatch = fullHash.match(/[?&]place=([^&]+)/);
    const placeQuery = placeMatch ? decodeURIComponent(placeMatch[1]) : null;

    if (this.destinationView) {
      this.destinationView.loadDestination(placeQuery);
    }
  }

  hideDestinationView() {
    document.body.classList.remove("viewing-destination");

    const searchContainer = document.querySelector(".cga-search-container");
    if (searchContainer) searchContainer.classList.remove("hidden");
    const hud = document.getElementById("telemetry-hud");
    if (hud) hud.classList.remove("hidden");

    const destSection = document.getElementById("view-destination");
    if (destSection) {
      destSection.classList.add("hidden");
    }
  }

  showItineraryView() {
    this.hideDestinationView();

    const hud = document.getElementById("telemetry-hud");
    if (hud) hud.classList.remove("hidden");

    if (this.savedTripsModal && this.savedTripsModal.modal) {
      this.savedTripsModal.close();
    }
    if (this.voyagerGlobe && this.voyagerGlobe.section) {
      this.voyagerGlobe.section.classList.add("hidden");
    }
    if (this.itineraryView && this.itineraryView.drawer) {
      this.itineraryView.drawer.classList.remove("collapsed");
    }
    if (this.mapManager && this.mapManager.map) {
      setTimeout(() => this.mapManager.map.invalidateSize(), 150);
    }
  }

  showSavedTripsView() {
    this.hideDestinationView();

    if (this.itineraryView && this.itineraryView.drawer) {
      this.itineraryView.drawer.classList.add("collapsed");
    }
    if (this.voyagerGlobe && this.voyagerGlobe.section) {
      this.voyagerGlobe.section.classList.add("hidden");
    }
    if (this.savedTripsModal) {
      this.savedTripsModal.open();
    }
  }

  navigateTo(path) {
    window.location.hash = path;
  }
}
