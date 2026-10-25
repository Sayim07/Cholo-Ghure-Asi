/* ==========================================================================
   Cholo Ghure Asssiii — Open-Meteo Weather Service (WeatherService.js)
   Conforms to TRD.md §4 & Schema.md §4.2
   ========================================================================== */

import { APP_CONSTANTS } from "../config/constants.js";
import { getWeatherMeta } from "../utils/weatherIcons.js";

export async function fetchWeather(latitude, longitude) {
  if (latitude === undefined || longitude === undefined) {
    throw new Error("Latitude and Longitude required for weather lookup.");
  }

  const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), APP_CONSTANTS.HTTP_TIMEOUT_MS);

  try {
    const res = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Meteo error HTTP ${res.status}`);
    }

    const data = await res.json();
    const current = data.current || {};
    const meta = getWeatherMeta(current.weather_code);

    return {
      temperature: Math.round(current.temperature_2m ?? 24),
      humidity: Math.round(current.relative_humidity_2m ?? 60),
      windSpeed: Math.round(current.wind_speed_10m ?? 10),
      weatherCode: current.weather_code ?? 0,
      condition: meta.description,
      icon: meta.icon,
      category: meta.category,
      daily: data.daily || null
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn("[WeatherService] Fallback to standard weather due to error:", err);
    return {
      temperature: 24,
      humidity: 55,
      windSpeed: 12,
      weatherCode: 1,
      condition: "Pleasant",
      icon: "🌤️",
      category: "clear",
      daily: null
    };
  }
}
