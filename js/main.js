/* ==========================================================================
   Cholo Ghure Asssiii — Main Bootstrapper & Scroll Orchestrator (js/main.js)
   Integrates Lenis smooth scroll + GSAP ScrollTrigger across 5 Pinned Scenes
   ========================================================================== */

import { APP_CONSTANTS } from "./config/constants.js";
import { tripStore } from "./state/TripStore.js";
import { initGateScene } from "./scenes/gate.js";
import { GlobeScene } from "./scenes/globe.js";
import { ExploreMapScene } from "./scenes/exploreMap.js";
import { DetailPanel } from "./ui/detailPanel.js";
import { JourneyScene } from "./scenes/journey.js";
import { SavedTripsScene } from "./scenes/savedTrips.js";
import { SeasonEngine } from "./components/SeasonEngine.js";
import { TelemetryHUD } from "./components/TelemetryHUD.js";
import { toast } from "./components/Toast.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log(`%c${APP_CONSTANTS.APP_NAME} %cScroll-Driven Refactor Bootstrapped`, "color: #c6924b; font-weight: 800; font-size: 16px;", "color: #0284c7;");

  // 1. Initialize Lenis Smooth Scroll
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5
    });

    window.lenisInstance = lenis;

    // Connect Lenis to GSAP ScrollTrigger
    if (window.ScrollTrigger) {
      lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // Register GSAP Plugin
  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  // 2. Initialize 4-Season Particle & Ambient Filter Engine
  const seasonEngine = new SeasonEngine("season-canvas");

  // 3. Initialize Scene 1: Architectural Gate (ERA Residence scroll-scrubbed doors)
  initGateScene();

  // 4. Initialize Scene 2: 3D Voyager Globe (Scroll-linked Earth)
  const globeScene = new GlobeScene("globe-canvas-container");

  // 5. Initialize Scene 3: Explore Map & Right-Side Detail Panel (Primland style)
  const exploreMapScene = new ExploreMapScene("explore-map-container");
  const detailPanel = new DetailPanel("detail-side-panel");

  // 6. Initialize Scene 4: Journey Timeline (Lightship RV style)
  const journeyScene = new JourneyScene();

  // 7. Initialize Scene 5: Saved Trips Archive & Footer
  const savedTripsScene = new SavedTripsScene();

  // 8. Initialize Lightship Telemetry HUD
  const telemetryHUD = new TelemetryHUD("#telemetry-hud");

  // 9. Navbar Seasonal Switcher
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

  // 10. Nav links for smooth scrolling to scenes
  document.getElementById("btn-nav-globe")?.addEventListener("click", () => {
    const el = document.getElementById("scene-globe");
    if (lenis) lenis.scrollTo(el);
    else el?.scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("btn-nav-map")?.addEventListener("click", () => {
    const el = document.getElementById("scene-explore");
    if (lenis) lenis.scrollTo(el);
    else el?.scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("btn-nav-journey")?.addEventListener("click", () => {
    const el = document.getElementById("scene-journey");
    if (lenis) lenis.scrollTo(el);
    else el?.scrollIntoView({ behavior: "smooth" });
  });

  // 11. Refresh ScrollTrigger after initial mount
  if (window.ScrollTrigger) {
    setTimeout(() => {
      window.ScrollTrigger.refresh();
    }, 400);
  }
});
