/* ==========================================================================
   Cholo Ghure Asssiii — Utility Helpers (helpers.js)
   ========================================================================== */

/**
 * Debounce a callback function by specified delay
 */
export function debounce(func, delay = 800) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Sanitize plain string for safe innerHTML injection
 */
export function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Format distance in meters to clean kilometers string
 */
export function formatDistance(meters) {
  if (!meters || isNaN(meters)) return "0 km";
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

/**
 * Format duration in seconds to human readable hours & minutes
 */
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "0m";
  const totalMins = Math.round(seconds / 60);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
}

/**
 * Format currency with default symbol
 */
export function formatCurrency(amount, symbol = "₹") {
  const num = Number(amount) || 0;
  return `${symbol} ${num.toLocaleString("en-IN")}`;
}

/**
 * Generate lightweight UUID
 */
export function generateId() {
  return "cga_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
}
