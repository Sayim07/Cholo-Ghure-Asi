/* ==========================================================================
   Cholo Ghure Asssiii — 4-Season Atmospheric Particle Engine (SeasonEngine.js)
   Inspired by Primland Resort Seasonal Perspectives
   Renders: Summer shimmer, Monsoon rain, Autumn leaves, Winter snowflakes
   ========================================================================== */

import { APP_CONSTANTS } from "../config/constants.js";
import { tripStore } from "../state/TripStore.js";

export class SeasonEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.currentSeason = tripStore.state.activeSeason;
    this.animationFrameId = null;

    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Listen for season changes from store
    tripStore.subscribe("season:changed", (newSeason) => {
      this.setSeason(newSeason);
    });

    this.initParticles();
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
    this.currentSeason = season;
    document.body.className = `season-${season}`;
    const overlay = document.querySelector(".season-ambient-overlay");
    if (overlay) {
      overlay.className = `season-ambient-overlay season-${season}`;
    }
    this.initParticles();
  }

  initParticles() {
    this.particles = [];
    const count = this.currentSeason === APP_CONSTANTS.SEASONS.MONSOON ? 120 :
                  this.currentSeason === APP_CONSTANTS.SEASONS.AUTUMN ? 40 :
                  this.currentSeason === APP_CONSTANTS.SEASONS.WINTER ? 60 : 30;

    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle() {
    const s = this.currentSeason;
    if (s === APP_CONSTANTS.SEASONS.MONSOON) {
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        len: Math.random() * 20 + 10,
        speed: Math.random() * 12 + 15,
        opacity: Math.random() * 0.4 + 0.2
      };
    } else if (s === APP_CONSTANTS.SEASONS.AUTUMN) {
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 8 + 6,
        speedY: Math.random() * 1.5 + 0.8,
        speedX: Math.sin(Math.random() * 6) * 1.2,
        angle: Math.random() * 360,
        rotSpeed: Math.random() * 2 - 1,
        color: Math.random() > 0.5 ? "#d97706" : "#b45309",
        opacity: Math.random() * 0.6 + 0.3
      };
    } else if (s === APP_CONSTANTS.SEASONS.WINTER) {
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 3 + 1,
        speedY: Math.random() * 1.2 + 0.6,
        speedX: Math.cos(Math.random() * 5) * 0.6,
        opacity: Math.random() * 0.7 + 0.3
      };
    } else {
      // Summer sun speckles
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2.5 + 1,
        speedY: -Math.random() * 0.5 - 0.2,
        opacity: Math.random() * 0.4 + 0.1
      };
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let p of this.particles) {
      if (this.currentSeason === APP_CONSTANTS.SEASONS.MONSOON) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = `rgba(14, 165, 233, ${p.opacity})`;
        this.ctx.lineWidth = 1.2;
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x - 2, p.y + p.len);
        this.ctx.stroke();

        p.y += p.speed;
        p.x -= 1;
        if (p.y > this.height) {
          p.y = -p.len;
          p.x = Math.random() * this.width;
        }
      } else if (this.currentSeason === APP_CONSTANTS.SEASONS.AUTUMN) {
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.angle * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.opacity;

        // Draw leaf polygon
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, p.size, p.size * 0.4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        p.y += p.speedY;
        p.x += p.speedX;
        p.angle += p.rotSpeed;

        if (p.y > this.height + 10) {
          p.y = -10;
          p.x = Math.random() * this.width;
        }
      } else if (this.currentSeason === APP_CONSTANTS.SEASONS.WINTER) {
        this.ctx.beginPath();
        this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();

        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y > this.height) {
          p.y = -5;
          p.x = Math.random() * this.width;
        }
      } else {
        // Summer
        this.ctx.beginPath();
        this.ctx.fillStyle = `rgba(245, 158, 11, ${p.opacity})`;
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();

        p.y += p.speedY;
        if (p.y < 0) {
          p.y = this.height;
          p.x = Math.random() * this.width;
        }
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
}
