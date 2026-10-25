/* ==========================================================================
   Cholo Ghure Asssiii — Client-Side SPA Router (Router.js)
   Provides dedicated URL hash routing for all application views:
   - #/globe     : 3D Voyager Globe Onboarding & Global Exploration
   - #/map       : Interactive Leaflet Map, Search & Driving Routes Canvas
   - #/itinerary : Multi-Day Itinerary Drawer & Itemized Budget Manager
   - #/saved     : Cloud Saved Trips & Firestore Archive Modal
   ========================================================================== */

export class AppRouter {
  constructor({ voyagerGlobe, mapManager, itineraryView, savedTripsModal, portalGate }) {
    this.voyagerGlobe = voyagerGlobe;
    this.mapManager = mapManager;
    this.itineraryView = itineraryView;
    this.savedTripsModal = savedTripsModal;
    this.portalGate = portalGate;

    this.navLinks = document.querySelectorAll(".cga-nav-link");
    this.previousRoute = "#/globe";

    this.routes = {
      "#/globe": () => this.showGlobeView(),
      "#/map": () => this.showMapView(),
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

    // Update active state on navigation pills
    this.navLinks.forEach(link => {
      const href = link.getAttribute("href");
      if (href === path) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    const handler = this.routes[path] || this.routes["#/globe"];
    handler();
  }

  showGlobeView() {
    this.previousRoute = "#/globe";

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

  showItineraryView() {
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
