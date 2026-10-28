/* ==========================================================================
   Cholo Ghure Asssiii — Main Application Orchestrator (main.js)
   Integrates VoyagerGlobe, SeasonEngine, PortalGate, MapManager, and Itinerary
   ========================================================================== */

import { APP_CONSTANTS } from "./config/constants.js?v=4.2";
import { tripStore } from "./state/TripStore.js?v=4.2";
import { SeasonEngine } from "./ui/SeasonEngine.js?v=4.2";
import { VoyagerGlobe } from "./scenes/VoyagerGlobe.js?v=4.2";
import { PortalGate } from "./ui/PortalGate.js?v=4.2";
import { MapManager } from "./ui/MapManager.js?v=4.2";
import { SearchBar } from "./ui/SearchBar.js?v=4.2";
import { ItineraryView } from "./ui/ItineraryView.js?v=4.2";
import { SavedTripsModal } from "./ui/SavedTripsModal.js?v=4.2";
import { AppRouter } from "./services/Router.js?v=4.2";
import { DestinationView } from "./ui/DestinationView.js?v=4.2";
import { FirebaseService } from "./services/FirebaseService.js?v=4.2";
import { toast } from "./ui/Toast.js?v=4.2";

document.addEventListener("DOMContentLoaded", () => {
  console.log(`%c${APP_CONSTANTS.APP_NAME} %cInitialized`, "color: #c6924b; font-weight: 800; font-size: 16px;", "color: #0284c7;");

  // 1. Initialize 4-Season Particle & Ambient Engine
  const seasonEngine = new SeasonEngine("season-canvas");

  // 2. Initialize ERA Residence Style Portal Gate Reveal
  const portalGate = new PortalGate();

  // 3. Initialize Dedicated Destination Experience View (shadcn & 21st.dev inspired)
  const destinationView = new DestinationView("view-destination");
  window.destinationViewInstance = destinationView;

  // 4. Initialize 3D Voyager Globe (Continent & Country Onboarding)
  const voyagerGlobe = new VoyagerGlobe("globe-canvas-container");

  // 5. Initialize Interactive Leaflet Map
  const mapManager = new MapManager("map-container");

  // 6. Initialize Search Bar with Geocoding
  const searchBar = new SearchBar(
    "#input-search",
    "#btn-search",
    "#search-dropdown-results",
    portalGate
  );

  // 7. Initialize Itinerary & Multi-Day Manager
  const itineraryView = new ItineraryView("itinerary-drawer");

  // 8. Initialize Saved Trips Modal Drawer
  const savedTripsModal = new SavedTripsModal("#btn-saved-trips");

  // 9. Initialize SPA Section Router (Deep Linking for All Sections)
  const router = new AppRouter({
    voyagerGlobe,
    mapManager,
    itineraryView,
    savedTripsModal,
    portalGate,
    destinationView
  });
  router.init();
  window.appRouter = router;

  // 10. Bind Navbar Seasonal Buttons
  const seasonButtons = document.querySelectorAll(".season-btn");
  seasonButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      seasonButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const season = btn.dataset.season;
      tripStore.setSeason(season);
      toast.info(`Switched to ${season.toUpperCase()} atmosphere 🍂`);
    });
  });

  // 11. Bind Hamburger Menu & Slide-Over Sheet Drawer (shadcn Sheet)
  const hamburgerBtn = document.getElementById("btn-hamburger-menu");
  const sheetOverlay = document.getElementById("cga-sheet-overlay");
  const sheetDrawer = document.getElementById("cga-sheet-drawer");
  const sheetCloseBtn = document.getElementById("btn-sheet-close");
  const sheetExportBtn = document.getElementById("btn-sheet-export");
  const exportBtn = document.getElementById("btn-export-trip");

  const openDrawer = () => {
    if (sheetOverlay && sheetDrawer) {
      sheetOverlay.classList.add("open");
      sheetDrawer.classList.add("open");
    }
  };

  const closeDrawer = () => {
    if (sheetOverlay && sheetDrawer) {
      sheetOverlay.classList.remove("open");
      sheetDrawer.classList.remove("open");
    }
  };

  if (hamburgerBtn) hamburgerBtn.addEventListener("click", openDrawer);
  if (sheetCloseBtn) sheetCloseBtn.addEventListener("click", closeDrawer);
  if (sheetOverlay) sheetOverlay.addEventListener("click", closeDrawer);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  // Close drawer when any route item is selected
  const sheetNavItems = document.querySelectorAll(".cga-sheet-item");
  sheetNavItems.forEach(item => {
    item.addEventListener("click", () => {
      closeDrawer();
    });
  });

  // Bind Export / Print Travel Plan (from Drawer & Navbar)
  const handleExport = () => {
    closeDrawer();
    window.print();
  };

  if (sheetExportBtn) sheetExportBtn.addEventListener("click", handleExport);
  if (exportBtn) exportBtn.addEventListener("click", handleExport);
});
