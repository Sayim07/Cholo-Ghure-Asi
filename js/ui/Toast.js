/* ==========================================================================
   Cholo Ghure Asssiii — Glassmorphic Toast Notifications (Toast.js)
   Conforms to Rules.md §3 (No window.alert)
   ========================================================================== */

import { escapeHTML } from "../utils/helpers.js";

class ToastManager {
  constructor() {
    this.container = null;
  }

  ensureContainer() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.className = "cga-toast-container";
      document.body.appendChild(this.container);
    }
  }

  show(message, type = "info", duration = 4000) {
    this.ensureContainer();

    const toast = document.createElement("div");
    toast.className = `cga-toast toast-${type}`;

    let icon = "✨";
    if (type === "success") icon = "✅";
    if (type === "error") icon = "⚠️";
    if (type === "info") icon = "📍";

    toast.innerHTML = `
      <span style="font-size: 16px;">${icon}</span>
      <span style="flex: 1; line-height: 1.4;">${escapeHTML(message)}</span>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(50px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  success(msg) { this.show(msg, "success"); }
  error(msg) { this.show(msg, "error", 5000); }
  info(msg) { this.show(msg, "info"); }
}

export const toast = new ToastManager();
