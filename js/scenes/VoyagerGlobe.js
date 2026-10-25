/* ==========================================================================
   Cholo Ghure Asssiii — Realistic 3D Voyager Globe & Interactive Pins (VoyagerGlobe.js)
   Renders:
   - High-res 2048px NASA Earth Texture & Real Atmospheric Clouds
   - Real interactive 3D pins on the globe for top global & Indian destinations
   - Smooth 3D spherical rotation to selected Continents and Countries
   - Interactive Raycaster to click pins directly on the 3D Earth
   ========================================================================== */

import { APP_CONSTANTS } from "../config/constants.js";
import { tripStore } from "../state/TripStore.js";
import { toast } from "../ui/Toast.js";

// Top Curated Wonder Destinations with exact coordinates
export const GLOBE_DESTINATIONS = [
  { id: "darjeeling", name: "Darjeeling", country: "India", continent: "asia", type: "mountain", lat: 27.0410, lon: 88.2663, desc: "Queen of the Hills, misty tea estates & Kanchenjunga view.", img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80" },
  { id: "kolkata", name: "Victoria Memorial, Kolkata", country: "India", continent: "asia", type: "heritage", lat: 22.5448, lon: 88.3426, desc: "Magnificent white marble palace and cultural capital.", img: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80" },
  { id: "taj_mahal", name: "Taj Mahal, Agra", country: "India", continent: "asia", type: "heritage", lat: 27.1751, lon: 78.0421, desc: "The timeless ivory-white marble monument of eternal love.", img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80" },
  { id: "goa", name: "Goa Beaches", country: "India", continent: "asia", type: "beach", lat: 15.2993, lon: 74.1240, desc: "Golden sands, azure Arabian Sea, and vibrant coastal culture.", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80" },
  { id: "kyoto", name: "Kyoto", country: "Japan", continent: "asia", type: "heritage", lat: 35.0116, lon: 135.7681, desc: "Ancient wooden temples, bamboo groves, and geisha districts.", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80" },
  { id: "swiss_alps", name: "Zermatt & Matterhorn", country: "Switzerland", continent: "europe", type: "mountain", lat: 45.9765, lon: 7.7491, desc: "Breathtaking snow-capped peaks and pristine alpine trails.", img: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80" },
  { id: "paris", name: "Eiffel Tower, Paris", country: "France", continent: "europe", type: "heritage", lat: 48.8584, lon: 2.2945, desc: "City of lights, world-class art, and iconic iron spire.", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80" },
  { id: "giza", name: "Pyramids of Giza", country: "Egypt", continent: "africa", type: "heritage", lat: 29.9792, lon: 31.1342, desc: "Ancient wonder of the world rising over desert sands.", img: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80" },
  { id: "grand_canyon", name: "Grand Canyon", country: "United States", continent: "americas", type: "nature", lat: 36.1069, lon: -112.1129, desc: "Massive natural gorge carved by Colorado River.", img: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=800&q=80" },
  { id: "sydney", name: "Sydney Harbour", country: "Australia", continent: "oceania", type: "beach", lat: -33.8568, lon: 151.2153, desc: "Iconic opera house and radiant blue bay waters.", img: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80" }
];

export class VoyagerGlobe {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.section = document.getElementById("voyager-globe-section");
    if (!this.container || !this.section) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.globe = null;
    this.clouds = null;
    this.pinsGroup = null;
    this.isDragging = false;
    this.prevMousePos = { x: 0, y: 0 };
    this.rotationSpeed = { x: 0.0008, y: 0 };
    this.targetRotation = { x: 0.2, y: 0 };
    this.targetCameraZ = 240;

    this.selectedContinent = "asia";
    this.selectedCountry = APP_CONSTANTS.POPULAR_COUNTRIES[0];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.interactivePins = [];

    this.initThree();
    this.bindDOMControls();
  }

  initThree() {
    if (!window.THREE) {
      console.warn("[VoyagerGlobe] Three.js not loaded.");
      return;
    }

    const THREE = window.THREE;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.z = 240;

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.container.appendChild(this.renderer.domElement);

    // 3. Globe Group
    this.globeGroup = new THREE.Group();
    this.scene.add(this.globeGroup);

    // 4. Real High-Res Earth Texture
    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load("https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg");
    const earthSpecular = textureLoader.load("https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg");
    const earthClouds = textureLoader.load("https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png");

    const sphereGeo = new THREE.SphereGeometry(75, 64, 64);
    const globeMat = new THREE.MeshPhongMaterial({
      map: earthMap,
      specularMap: earthSpecular,
      specular: new THREE.Color(0x333333),
      shininess: 15
    });

    this.globe = new THREE.Mesh(sphereGeo, globeMat);
    this.globeGroup.add(this.globe);

    // 5. Realistic Cloud Sphere
    const cloudGeo = new THREE.SphereGeometry(76, 48, 48);
    this.cloudMat = new THREE.MeshLambertMaterial({
      map: earthClouds,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending
    });
    this.clouds = new THREE.Mesh(cloudGeo, this.cloudMat);
    this.globeGroup.add(this.clouds);

    // 6. Atmosphere Glow Rim
    const atmosGeo = new THREE.SphereGeometry(79, 32, 32);
    this.atmosMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.16,
      side: THREE.BackSide
    });
    this.atmosphere = new THREE.Mesh(atmosGeo, this.atmosMat);
    this.scene.add(this.atmosphere);

    // 7. Interactive 3D Destination Pins
    this.pinsGroup = new THREE.Group();
    this.globeGroup.add(this.pinsGroup);
    this.createDestinationPins();

    // 8. Lights
    this.ambientLight = new THREE.AmbientLight(0xfffbe8, 1.3);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    this.sunLight.position.set(160, 100, 140);
    this.scene.add(this.sunLight);

    // 9. Subscribe to 4-Season Atmosphere Dynamics
    tripStore.subscribe("season:changed", (season) => this.applySeasonToGlobe(season));
    this.applySeasonToGlobe(tripStore.state.activeSeason || "summer");

    // 10. Interaction Listeners
    this.addInteractions();

    // 11. Start Render Loop
    this.animate();

    window.addEventListener("resize", () => this.onResize());
  }

  // Convert Latitude & Longitude to 3D Cartesian coordinates on sphere
  latLonToVector3(lat, lon, radius = 76.5) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }

  createDestinationPins() {
    const THREE = window.THREE;

    GLOBE_DESTINATIONS.forEach(dest => {
      const pos = this.latLonToVector3(dest.lat, dest.lon, 76.2);

      // Pin Pinhead Geometry
      const pinGeo = new THREE.SphereGeometry(1.6, 16, 16);
      const isIndia = dest.country === "India";
      const pinColor = isIndia ? 0xe27238 : 0x0284c7; // Terracotta for India, Azure for international

      const pinMat = new THREE.MeshBasicMaterial({ color: pinColor });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      pinMesh.userData = dest;

      // Glowing Pulse Ring around Pin
      const ringGeo = new THREE.RingGeometry(1.8, 2.8, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xc6924b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0)); // Face outward

      this.pinsGroup.add(pinMesh);
      this.pinsGroup.add(ringMesh);
      this.interactivePins.push(pinMesh);
    });
  }

  addInteractions() {
    const el = this.renderer.domElement;

    el.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("mousemove", (e) => {
      // Raycast hover check on pins
      this.checkPinHover(e);

      if (!this.isDragging || !this.globeGroup) return;
      const deltaX = e.clientX - this.prevMousePos.x;
      const deltaY = e.clientY - this.prevMousePos.y;

      this.globeGroup.rotation.y += deltaX * 0.005;
      this.globeGroup.rotation.x += deltaY * 0.005;

      this.prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("mouseup", (e) => {
      if (this.isDragging) {
        this.isDragging = false;
      }
    });

    // Click pin to dive into destination
    el.addEventListener("click", (e) => {
      this.checkPinClick(e);
    });

    // Touch support
    el.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });

    window.addEventListener("touchmove", (e) => {
      if (!this.isDragging || e.touches.length !== 1 || !this.globeGroup) return;
      const deltaX = e.touches[0].clientX - this.prevMousePos.x;
      const deltaY = e.touches[0].clientY - this.prevMousePos.y;

      this.globeGroup.rotation.y += deltaX * 0.005;
      this.globeGroup.rotation.x += deltaY * 0.005;

      this.prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    window.addEventListener("touchend", () => {
      this.isDragging = false;
    });
  }

  checkPinHover(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactivePins);

    if (intersects.length > 0) {
      document.body.style.cursor = "pointer";
      const dest = intersects[0].object.userData;
      this.showPinTooltip(e.clientX, e.clientY, dest);
    } else {
      document.body.style.cursor = "default";
      this.hidePinTooltip();
    }
  }

  checkPinClick(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactivePins);

    if (intersects.length > 0) {
      const dest = intersects[0].object.userData;
      this.zoomToAndOpenDestination(dest);
    }
  }

  showPinTooltip(x, y, dest) {
    let tip = document.getElementById("globe-pin-tooltip");
    if (!tip) {
      tip = document.createElement("div");
      tip.id = "globe-pin-tooltip";
      tip.className = "globe-pin-tooltip";
      document.body.appendChild(tip);
    }
    tip.style.left = `${x + 15}px`;
    tip.style.top = `${y - 20}px`;
    tip.style.display = "block";
    tip.innerHTML = `
      <div style="font-weight: 700; color: #111c14;">📍 ${dest.name}</div>
      <div style="font-size: 11px; color: #576356;">${dest.country} • Click to explore</div>
    `;
  }

  hidePinTooltip() {
    const tip = document.getElementById("globe-pin-tooltip");
    if (tip) tip.style.display = "none";
  }

  applySeasonToGlobe(season) {
    if (!this.scene) return;
    const THREE = window.THREE;
    if (!THREE) return;

    // 1. Update Section Background Theme
    if (this.section) {
      this.section.classList.remove("season-summer", "season-monsoon", "season-autumn", "season-winter");
      this.section.classList.add(`season-${season}`);
    }

    // 2. Update Drawer Indicator if available
    const drawerIndicator = document.getElementById("drawer-season-indicator");
    if (drawerIndicator) {
      const labelMap = {
        summer: "☀️ Summer Mode",
        monsoon: "🌧️ Monsoon Mode",
        autumn: "🍂 Autumn Mode",
        winter: "❄️ Winter Mode"
      };
      drawerIndicator.textContent = labelMap[season] || `${season} Mode`;
    }

    // 3. Realistic Atmospheric Lighting & Cloud Matrix
    const SEASON_CONFIGS = {
      summer: {
        sunColor: 0xfff5e6,
        sunIntensity: 2.2,
        ambientColor: 0xfff8e7,
        ambientIntensity: 1.25,
        atmosColor: 0x38bdf8,
        atmosOpacity: 0.18,
        cloudOpacity: 0.35,
        cloudRotationMult: 1.2
      },
      monsoon: {
        sunColor: 0x94a3b8,
        sunIntensity: 1.1,
        ambientColor: 0x64748b,
        ambientIntensity: 0.85,
        atmosColor: 0x0ea5e9,
        atmosOpacity: 0.32,
        cloudOpacity: 0.68,
        cloudRotationMult: 2.0
      },
      autumn: {
        sunColor: 0xfbbf24,
        sunIntensity: 1.85,
        ambientColor: 0xfef3c7,
        ambientIntensity: 1.15,
        atmosColor: 0xf59e0b,
        atmosOpacity: 0.24,
        cloudOpacity: 0.40,
        cloudRotationMult: 1.4
      },
      winter: {
        sunColor: 0xe0f2fe,
        sunIntensity: 2.0,
        ambientColor: 0xf0f9ff,
        ambientIntensity: 1.4,
        atmosColor: 0x7dd3fc,
        atmosOpacity: 0.35,
        cloudOpacity: 0.54,
        cloudRotationMult: 1.0
      }
    };

    const cfg = SEASON_CONFIGS[season] || SEASON_CONFIGS.summer;

    if (window.gsap && this.ambientLight && this.sunLight && this.cloudMat && this.atmosMat) {
      // Smoothly tween intensities
      window.gsap.to(this.ambientLight, { intensity: cfg.ambientIntensity, duration: 1.2, ease: "power2.out" });
      window.gsap.to(this.sunLight, { intensity: cfg.sunIntensity, duration: 1.2, ease: "power2.out" });
      window.gsap.to(this.cloudMat, { opacity: cfg.cloudOpacity, duration: 1.2, ease: "power2.out" });
      window.gsap.to(this.atmosMat, { opacity: cfg.atmosOpacity, duration: 1.2, ease: "power2.out" });

      // Smoothly tween 3D lighting & atmospheric colors
      const targetSunColor = new THREE.Color(cfg.sunColor);
      const targetAmbColor = new THREE.Color(cfg.ambientColor);
      const targetAtmosColor = new THREE.Color(cfg.atmosColor);

      window.gsap.to(this.sunLight.color, {
        r: targetSunColor.r,
        g: targetSunColor.g,
        b: targetSunColor.b,
        duration: 1.2,
        ease: "power2.out"
      });
      window.gsap.to(this.ambientLight.color, {
        r: targetAmbColor.r,
        g: targetAmbColor.g,
        b: targetAmbColor.b,
        duration: 1.2,
        ease: "power2.out"
      });
      window.gsap.to(this.atmosMat.color, {
        r: targetAtmosColor.r,
        g: targetAtmosColor.g,
        b: targetAtmosColor.b,
        duration: 1.2,
        ease: "power2.out"
      });
    } else {
      if (this.ambientLight) {
        this.ambientLight.color.setHex(cfg.ambientColor);
        this.ambientLight.intensity = cfg.ambientIntensity;
      }
      if (this.sunLight) {
        this.sunLight.color.setHex(cfg.sunColor);
        this.sunLight.intensity = cfg.sunIntensity;
      }
      if (this.cloudMat) this.cloudMat.opacity = cfg.cloudOpacity;
      if (this.atmosMat) {
        this.atmosMat.color.setHex(cfg.atmosColor);
        this.atmosMat.opacity = cfg.atmosOpacity;
      }
    }
  }

  bindDOMControls() {
    // Continent selection chips
    const chips = document.querySelectorAll(".continent-chip");
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        chips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        const continentKey = chip.dataset.continent;
        this.selectContinent(continentKey);
      });
    });

    // Country Carousel Scroll Arrows
    const scrollbox = document.getElementById("globe-country-scrollbox");
    const btnLeft = document.getElementById("btn-country-scroll-left");
    const btnRight = document.getElementById("btn-country-scroll-right");

    if (btnLeft && scrollbox) {
      btnLeft.addEventListener("click", () => {
        scrollbox.scrollBy({ left: -280, behavior: "smooth" });
      });
    }

    if (btnRight && scrollbox) {
      btnRight.addEventListener("click", () => {
        scrollbox.scrollBy({ left: 280, behavior: "smooth" });
      });
    }

    // Enable mouse wheel horizontal scrolling on the country carousel
    if (scrollbox) {
      scrollbox.addEventListener("wheel", (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          scrollbox.scrollLeft += e.deltaY;
        }
      }, { passive: false });
    }

    // Country Search / Filter input
    const searchInput = document.getElementById("globe-country-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.renderCountryCards(this.selectedContinent, e.target.value.trim().toLowerCase());
      });
    }

    // Initial render of countries for default continent ("asia")
    this.renderCountryCards("asia");

    // Dive into Map Button
    const diveBtn = document.getElementById("btn-dive-into-map");
    if (diveBtn) {
      diveBtn.addEventListener("click", () => this.diveIntoDestination());
    }

    // Top Bar "World View" / Drawer 3D Globe button
    const worldBtn = document.getElementById("btn-world-view");
    if (worldBtn) {
      worldBtn.addEventListener("click", () => this.showGlobe());
    }
  }

  renderCountryCards(continentKey, query = "") {
    const scrollbox = document.getElementById("globe-country-scrollbox");
    if (!scrollbox) return;

    scrollbox.innerHTML = "";
    let filtered = APP_CONSTANTS.POPULAR_COUNTRIES.filter(c => c.continent === continentKey);
    if (query) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.code.toLowerCase().includes(query) ||
        (c.highlight && c.highlight.toLowerCase().includes(query))
      );
    }

    const list = filtered;

    // Update Country Count Badge
    const countBadge = document.getElementById("globe-country-count");
    if (countBadge) {
      countBadge.textContent = `${list.length} ${list.length === 1 ? "Country" : "Countries"}`;
    }

    if (list.length === 0) {
      scrollbox.innerHTML = `
        <div style="padding: 6px 14px; font-size: 12px; color: var(--cga-text-muted); font-weight: 600;">
          No countries found for "${query}"
        </div>
      `;
      return;
    }

    // If current selected country is in the filtered list, keep it; otherwise select first
    const matchSelected = list.find(c => this.selectedCountry && c.name === this.selectedCountry.name);
    if (!matchSelected) {
      this.selectedCountry = list[0];
    }
    this.updateDiveButtonText(this.selectedCountry);

    list.forEach((country) => {
      const isSelected = this.selectedCountry && country.name === this.selectedCountry.name;
      const card = document.createElement("div");
      card.className = `country-card ${isSelected ? "active" : ""}`;
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.dataset.countryName = country.name;

      card.innerHTML = `
        <span class="country-card-flag">${country.flag || "🌍"}</span>
        <span class="country-card-code">${country.code}</span>
        <div class="country-card-info">
          <span class="country-card-name">${country.name}</span>
          <span class="country-card-highlight">${country.highlight || "Explore territory"}</span>
        </div>
      `;

      // Click: focus 3D globe and select
      card.addEventListener("click", () => {
        scrollbox.querySelectorAll(".country-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        this.selectedCountry = country;
        this.updateDiveButtonText(country);
        this.focusCountry(country);
      });

      // Double-click: dive into map directly
      card.addEventListener("dblclick", () => {
        this.selectedCountry = country;
        this.diveIntoDestination();
      });

      scrollbox.appendChild(card);
    });

    if (!query) {
      scrollbox.scrollLeft = 0;
    }
  }

  updateDiveButtonText(country) {
    const btnText = document.getElementById("dive-into-btn-text");
    if (btnText && country) {
      btnText.innerHTML = `Dive into ${country.name} &rarr;`;
    }
  }

  selectContinent(continentKey) {
    this.selectedContinent = continentKey;

    // Reset search input if any
    const searchInput = document.getElementById("globe-country-search");
    if (searchInput) searchInput.value = "";

    const anchor = APP_CONSTANTS.CONTINENT_ANCHORS[continentKey];
    if (anchor && this.globeGroup && window.gsap) {
      // Rotate 3D Earth smoothly to center on the selected continent
      const targetY = -((anchor.lon + 90) * Math.PI) / 180;
      const targetX = ((anchor.lat) * Math.PI) / 180 * 0.6;
      window.gsap.to(this.globeGroup.rotation, {
        y: targetY,
        x: targetX,
        duration: 1.4,
        ease: "power2.out"
      });
    }

    // Render all countries for this continent
    this.renderCountryCards(continentKey);
  }

  focusCountry(country) {
    if (!country || !this.globeGroup || !window.gsap) return;
    const [lat, lon] = country.coords;
    const targetY = -((lon + 90) * Math.PI) / 180;
    const targetX = (lat * Math.PI) / 180 * 0.6;

    window.gsap.to(this.globeGroup.rotation, {
      y: targetY,
      x: targetX,
      duration: 1.2,
      ease: "power2.out"
    });

    // Zoom camera in closer
    window.gsap.to(this.camera.position, {
      z: 180,
      duration: 1.2,
      ease: "power2.out"
    });
  }

  zoomToAndOpenDestination(dest) {
    this.hidePinTooltip();
    toast.info(`Diving into ${dest.name}...`);

    if (window.gsap) {
      const targetY = -((dest.lon + 90) * Math.PI) / 180;
      const targetX = (dest.lat * Math.PI) / 180 * 0.6;

      const tl = window.gsap.timeline({
        onComplete: () => {
          this.section.classList.add("hidden");
          tripStore.setGlobeView(false);
          window.location.hash = "#/map";
          tripStore.emit("map:focus", [dest.lat, dest.lon], 13);

          // Open the Thematic Gate Reveal for this place!
          const placeObj = {
            name: dest.name,
            shortName: dest.name,
            latitude: dest.lat,
            longitude: dest.lon,
            type: dest.type,
            image: dest.img,
            description: dest.desc
          };

          // Fetch weather and open gate
          import("../services/WeatherService.js").then(({ fetchWeather }) => {
            fetchWeather(dest.lat, dest.lon).then(weather => {
              if (window.portalGateInstance) {
                window.portalGateInstance.openGate(placeObj, weather);
              }
            });
          });

          this.camera.position.z = 240; // reset
        }
      });

      tl.to(this.globeGroup.rotation, { y: targetY, x: targetX, duration: 1 })
        .to(this.camera.position, { z: 85, duration: 1.2, ease: "power3.in" }, "-=0.3");
    } else {
      this.section.classList.add("hidden");
      tripStore.setGlobeView(false);
      window.location.hash = "#/map";
      tripStore.emit("map:focus", [dest.lat, dest.lon], 13);
    }
  }

  diveIntoDestination() {
    const target = this.selectedCountry || APP_CONSTANTS.POPULAR_COUNTRIES[0];

    if (window.gsap && this.camera) {
      window.gsap.to(this.camera.position, {
        z: 90,
        duration: 1.4,
        ease: "power3.in",
        onComplete: () => {
          this.section.classList.add("hidden");
          tripStore.setGlobeView(false);
          window.location.hash = "#/map";
          tripStore.emit("map:focus", target.coords, target.zoom);
          this.camera.position.z = 240; // reset
        }
      });
    } else {
      this.section.classList.add("hidden");
      tripStore.setGlobeView(false);
      window.location.hash = "#/map";
      tripStore.emit("map:focus", target.coords, target.zoom);
    }
  }

  showGlobe() {
    this.section.classList.remove("hidden");
    tripStore.setGlobeView(true);
    if (this.camera) {
      this.camera.position.z = 240;
    }
  }

  onResize() {
    if (!this.renderer || !this.camera) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (!this.isDragging && this.globeGroup) {
      this.globeGroup.rotation.y += this.rotationSpeed.x;
      if (this.clouds) {
        this.clouds.rotation.y += this.rotationSpeed.x * 1.4;
      }
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
