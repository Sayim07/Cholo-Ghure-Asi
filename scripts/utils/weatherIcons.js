/* ==========================================================================
   Cholo Ghure Asssiii — WMO Weather Code Mapper (weatherIcons.js)
   Conforms to Schema.md §5
   ========================================================================== */

export const WMO_WEATHER_TABLE = {
  0: { description: "Clear Sky", icon: "☀️", category: "clear" },
  1: { description: "Mainly Clear", icon: "🌤️", category: "cloudy" },
  2: { description: "Partly Cloudy", icon: "⛅", category: "cloudy" },
  3: { description: "Overcast", icon: "☁️", category: "cloudy" },
  45: { description: "Foggy", icon: "🌫️", category: "fog" },
  48: { description: "Rime Fog", icon: "🌫️", category: "fog" },
  51: { description: "Light Drizzle", icon: "🌦️", category: "rain" },
  53: { description: "Moderate Drizzle", icon: "🌦️", category: "rain" },
  55: { description: "Dense Drizzle", icon: "🌧️", category: "rain" },
  61: { description: "Slight Rain", icon: "🌧️", category: "rain" },
  63: { description: "Moderate Rain", icon: "🌧️", category: "rain" },
  65: { description: "Heavy Rain", icon: "⛈️", category: "rain" },
  71: { description: "Light Snow", icon: "🌨️", category: "snow" },
  73: { description: "Moderate Snow", icon: "❄️", category: "snow" },
  75: { description: "Heavy Snow", icon: "❄️", category: "snow" },
  80: { description: "Rain Showers", icon: "🌦️", category: "rain" },
  81: { description: "Moderate Showers", icon: "🌧️", category: "rain" },
  82: { description: "Violent Showers", icon: "⛈️", category: "rain" },
  95: { description: "Thunderstorm", icon: "⚡", category: "thunder" },
  96: { description: "Thunderstorm with Hail", icon: "⛈️", category: "thunder" },
  99: { description: "Severe Thunderstorm", icon: "⛈️", category: "thunder" }
};

export function getWeatherMeta(code) {
  const numericCode = Number(code);
  return WMO_WEATHER_TABLE[numericCode] || {
    description: "Pleasant",
    icon: "🌤️",
    category: "clear"
  };
}
