/* ==========================================================================
   Cholo Ghure Asssiii — Scene 2: 3D Voyager Globe (js/scenes/globe.js)
   WebGL Interactive Earth + Scroll-Linked Camera
   ========================================================================== */

import { APP_CONSTANTS } from "../config/constants.js";
import { tripStore } from "../state/TripStore.js";
import { GLOBE_DESTINATIONS } from "../components/VoyagerGlobe.js";
import { toast } from "../components/Toast.js";

export class GlobeScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.globe = null;
    this.clouds = null;
    this.globeGroup = null;
    this.isDragging = false;
    this.prevMousePos = { x: 0, y: 0 };
    this.rotationSpeed = { x: 0.0008, y: 0 };
    this.interactivePins = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.selectedContinent = "asia";
    this.selectedCountry = APP_CONSTANTS.POPULAR_COUNTRIES[0];

    this.initThree();
    this.bindDOMControls();
    this.initScrollTrigger();
  }

  initThree() {
    if (!window.THREE) return;
    const THREE = window.THREE;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.z = 240;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.container.appendChild(this.renderer.domElement);

    this.globeGroup = new THREE.Group();
    this.scene.add(this.globeGroup);

    // 2048px NASA Earth Texture
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

    // Cloud Sphere
    const cloudGeo = new THREE.SphereGeometry(76, 48, 48);
    const cloudMat = new THREE.MeshLambertMaterial({
      map: earthClouds,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending
    });
    this.clouds = new THREE.Mesh(cloudGeo, cloudMat);
    this.globeGroup.add(this.clouds);

    // 3D Destination Pins
    this.createDestinationPins();

    // Lights
    const ambientLight = new THREE.AmbientLight(0xfffbe8, 1.3);
    this.scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(160, 100, 140);
    this.scene.add(sunLight);

    this.addInteractions();
    this.animate();

    window.addEventListener("resize", () => this.onResize());
  }

  latLonToVector3(lat, lon, radius = 76.2) {
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
      const pinGeo = new THREE.SphereGeometry(1.6, 16, 16);
      const isIndia = dest.country === "India";
      const pinColor = isIndia ? 0xe27238 : 0x0284c7;

      const pinMat = new THREE.MeshBasicMaterial({ color: pinColor });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      pinMesh.userData = dest;

      const ringGeo = new THREE.RingGeometry(1.8, 2.8, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xc6924b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));

      this.globeGroup.add(pinMesh);
      this.globeGroup.add(ringMesh);
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
      this.checkPinHover(e);
      if (!this.isDragging || !this.globeGroup) return;
      const deltaX = e.clientX - this.prevMousePos.x;
      const deltaY = e.clientY - this.prevMousePos.y;
      this.globeGroup.rotation.y += deltaX * 0.005;
      this.globeGroup.rotation.x += deltaY * 0.005;
      this.prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("mouseup", () => { this.isDragging = false; });
    el.addEventListener("click", (e) => this.checkPinClick(e));
  }

  checkPinHover(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactivePins);

    if (intersects.length > 0) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "default";
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
      this.diveIntoPlace(dest);
    }
  }

  initScrollTrigger() {
    if (!window.gsap || !window.ScrollTrigger) return;
    const gsap = window.gsap;

    gsap.timeline({
      scrollTrigger: {
        trigger: "#scene-globe",
        start: "top top",
        end: "+=100%",
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          if (this.globeGroup) {
            this.globeGroup.rotation.y = self.progress * Math.PI * 0.8;
          }
        }
      }
    });
  }

  bindDOMControls() {
    const chips = document.querySelectorAll(".continent-chip");
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        chips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        this.selectContinent(chip.dataset.continent);
      });
    });

    const dropdown = document.getElementById("globe-country-select");
    if (dropdown) {
      this.populateCountries(dropdown, "asia");
      dropdown.addEventListener("change", (e) => {
        const found = APP_CONSTANTS.POPULAR_COUNTRIES.find(c => c.name === e.target.value);
        if (found) {
          this.selectedCountry = found;
          this.focusCountry(found);
        }
      });
    }

    const diveBtn = document.getElementById("btn-dive-into-map");
    if (diveBtn) {
      diveBtn.addEventListener("click", () => this.diveIntoDestination());
    }
  }

  populateCountries(dropdown, continentKey) {
    dropdown.innerHTML = "";
    const filtered = APP_CONSTANTS.POPULAR_COUNTRIES.filter(c => c.continent === continentKey);
    const list = filtered.length > 0 ? filtered : APP_CONSTANTS.POPULAR_COUNTRIES;
    list.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.name;
      opt.textContent = c.name;
      dropdown.appendChild(opt);
    });
    this.selectedCountry = list[0];
  }

  selectContinent(continentKey) {
    this.selectedContinent = continentKey;
    const anchor = APP_CONSTANTS.CONTINENT_ANCHORS[continentKey];
    if (anchor && this.globeGroup && window.gsap) {
      const targetY = -((anchor.lon + 90) * Math.PI) / 180;
      const targetX = (anchor.lat * Math.PI) / 180 * 0.6;
      window.gsap.to(this.globeGroup.rotation, { y: targetY, x: targetX, duration: 1.4, ease: "power2.out" });
    }
    const dropdown = document.getElementById("globe-country-select");
    if (dropdown) this.populateCountries(dropdown, continentKey);
  }

  focusCountry(country) {
    if (!country || !this.globeGroup || !window.gsap) return;
    const [lat, lon] = country.coords;
    const targetY = -((lon + 90) * Math.PI) / 180;
    const targetX = (lat * Math.PI) / 180 * 0.6;

    window.gsap.to(this.globeGroup.rotation, { y: targetY, x: targetX, duration: 1.2, ease: "power2.out" });
    window.gsap.to(this.camera.position, { z: 180, duration: 1.2, ease: "power2.out" });
  }

  diveIntoPlace(dest) {
    toast.info(`Exploring ${dest.name}...`);
    this.scrollToExploreScene();
    setTimeout(() => {
      tripStore.emit("map:focus", [dest.lat, dest.lon], 12);
      tripStore.emit("destination:openDetail", {
        name: dest.name,
        shortName: dest.name,
        latitude: dest.lat,
        longitude: dest.lon,
        type: dest.type,
        desc: dest.desc
      });
    }, 600);
  }

  diveIntoDestination() {
    const target = this.selectedCountry || APP_CONSTANTS.POPULAR_COUNTRIES[0];
    this.scrollToExploreScene();
    setTimeout(() => {
      tripStore.emit("map:focus", target.coords, target.zoom);
    }, 600);
  }

  scrollToExploreScene() {
    const targetEl = document.getElementById("scene-explore");
    if (targetEl) {
      if (window.lenisInstance) {
        window.lenisInstance.scrollTo(targetEl, { duration: 1.2 });
      } else {
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
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
      if (this.clouds) this.clouds.rotation.y += this.rotationSpeed.x * 1.4;
    }
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
