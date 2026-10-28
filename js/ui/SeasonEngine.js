/* ==========================================================================
   Cholo Ghure Asssiii — 4-Season Atmospheric Particle Engine (SeasonEngine.js)
   Inspired by Primland Resort Seasonal Perspectives
   Renders: Summer golden sun shimmer, Monsoon rain streaks, Autumn amber leaves, Winter soft snowflakes
   ========================================================================== */

import { APP_CONSTANTS } from "../config/constants.js";
import { tripStore } from "../state/TripStore.js";

export class SeasonEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.currentSeason = tripStore.state.activeSeason || APP_CONSTANTS.SEASONS.SUMMER;
    this.animationFrameId = null;
    this.isPaused = false;

    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Listen for season changes from store
    tripStore.subscribe("season:changed", (newSeason) => {
      this.setSeason(newSeason);
    });

    // Make instance globally discoverable
    if (typeof window !== "undefined") {
      window.seasonEngine = this;
    }

    // Apply initial season immediately
    this.setSeason(this.currentSeason);
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.initParticles();
  }

  setSeason(season) {
    if (!season) return;
    this.currentSeason = season;

    const allSeasons = [
      "season-summer",
      "season-monsoon",
      "season-autumn",
      "season-winter"
    ];

    // 1. Safely update body classes without blowing away viewing-destination or other utility classes
    allSeasons.forEach(cls => document.body.classList.remove(cls));
    document.body.classList.add(`season-${season}`);

    // 2. Update ambient atmospheric overlay
    const overlay = document.querySelector(".season-ambient-overlay");
    if (overlay) {
      allSeasons.forEach(cls => overlay.classList.remove(cls));
      overlay.classList.add(`season-${season}`);
    }

    // 3. Update 3D Voyager Globe section background
    const globeSection = document.querySelector(".voyager-globe-section");
    if (globeSection) {
      allSeasons.forEach(cls => globeSection.classList.remove(cls));
      globeSection.classList.add(`season-${season}`);
    }

    // 4. Synchronize all season buttons in navbar
    const seasonButtons = document.querySelectorAll(".season-btn");
    seasonButtons.forEach(btn => {
      if (btn.dataset.season === season) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // 5. Reinitialize active seasonal particles
    this.initParticles();
  }

  initParticles() {
    this.particles = [];
    const count = this.currentSeason === APP_CONSTANTS.SEASONS.MONSOON ? 140 :
                  this.currentSeason === APP_CONSTANTS.SEASONS.AUTUMN ? 50 :
                  this.currentSeason === APP_CONSTANTS.SEASONS.WINTER ? 75 : 45;

    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle() {
    const s = this.currentSeason;
    if (s === APP_CONSTANTS.SEASONS.MONSOON) {
      return {
        x: Math.random() * (this.width + 100),
        y: Math.random() * this.height,
        len: Math.random() * 24 + 14,
        speed: Math.random() * 14 + 16,
        slant: -2.5,
        opacity: Math.random() * 0.45 + 0.25
      };
    } else if (s === APP_CONSTANTS.SEASONS.AUTUMN) {
      const colors = ["#d97706", "#b45309", "#ea580c", "#92400e", "#c2410c"];
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 9 + 6,
        speedY: Math.random() * 1.8 + 0.9,
        speedX: Math.sin(Math.random() * 6) * 1.5,
        angle: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.65 + 0.35
      };
    } else if (s === APP_CONSTANTS.SEASONS.WINTER) {
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 3.5 + 1.2,
        speedY: Math.random() * 1.4 + 0.6,
        speedX: Math.cos(Math.random() * 5) * 0.7,
        opacity: Math.random() * 0.75 + 0.35
      };
    } else {
      // Summer sun glimmer & warm floating golden speckles
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 3.5 + 1.5,
        speedY: -(Math.random() * 0.6 + 0.2),
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.55 + 0.2
      };
    }
  }

  animate() {
    // If canvas is hidden or body is viewing destination, skip drawing
    if (document.body.classList.contains("viewing-destination")) {
      if (this.ctx && this.width && this.height) {
        this.ctx.clearRect(0, 0, this.width, this.height);
      }
      this.animationFrameId = requestAnimationFrame(() => this.animate());
      return;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let p of this.particles) {
      if (this.currentSeason === APP_CONSTANTS.SEASONS.MONSOON) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = `rgba(56, 189, 248, ${p.opacity})`;
        this.ctx.lineWidth = 1.6;
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x + p.slant, p.y + p.len);
        this.ctx.stroke();

        p.y += p.speed;
        p.x += p.slant;
        if (p.y > this.height) {
          p.y = -p.len;
          p.x = Math.random() * (this.width + 100);
        }
      } else if (this.currentSeason === APP_CONSTANTS.SEASONS.AUTUMN) {
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.angle * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.opacity;

        // Draw leaf
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        p.y += p.speedY;
        p.x += p.speedX;
        p.angle += p.rotSpeed;

        if (p.y > this.height + 15) {
          p.y = -15;
          p.x = Math.random() * this.width;
        }
      } else if (this.currentSeason === APP_CONSTANTS.SEASONS.WINTER) {
        this.ctx.beginPath();
        this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        this.ctx.shadowColor = "rgba(186, 230, 253, 0.6)";
        this.ctx.shadowBlur = 4;
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y > this.height + 5) {
          p.y = -5;
          p.x = Math.random() * this.width;
        }
      } else {
        // Summer golden shimmer
        this.ctx.beginPath();
        this.ctx.fillStyle = `rgba(251, 191, 36, ${p.opacity})`;
        this.ctx.shadowColor = "rgba(245, 158, 11, 0.7)";
        this.ctx.shadowBlur = 6;
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y < -10) {
          p.y = this.height + 10;
          p.x = Math.random() * this.width;
        }
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
}
