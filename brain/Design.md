# Design System & UI/UX Specifications (Design.md) — Cholo Ghure Asssiii

> **Mandatory Reference:** This document details the visual identity, design tokens, layout hierarchy, and component states for `Cholo Ghure Asssiii`. All CSS and DOM templates must adhere strictly to these design tokens.

---

## 0. Branding & Identity

### 0.1 Application Name Rule
The official brand identity of this application is **`Cholo Ghure Asssiii`** (spelled and capitalized with three consecutive `s`'s and three consecutive `i`'s). No short forms, no underscores, and no variations are permitted.

### 0.2 Code Snippets for Title & Header Branding
In `index.html`:
```html
<!-- Exact Document Title -->
<title>Cholo Ghure Asssiii — Wanderlust Travel & Trip Planner</title>
```
In the Application Navbar:
```html
<header class="cga-navbar">
  <div class="cga-brand">
    <div class="cga-logo-icon">✈️</div>
    <div class="cga-brand-text">
      <span class="cga-brand-title">Cholo Ghure Asssiii</span>
      <span class="cga-brand-tagline">Explore • Route • Journey</span>
    </div>
  </div>
</header>
```

---

## 1. Design Intent & Aesthetic Philosophy
- **Vibe:** "Awwwards-tier Luxury Editorial Travel meets Interactive Global Cartography." Inspired by *ERA Residence*, *Primland Resort*, and *Lightship RV*.
- **Palette Tone:** Warm, bright, and organic. Replaces dark void with champagne silk, soft ivory mist, antique gold foil accents, and deep forest espresso typography.
- **Micro-Interactions & Experience:**
  1. **Interactive 3D Voyager Globe:** Seamless onboarding from global rotating Earth to continent/country selection, zooming down into the detailed Leaflet map.
  2. **4-Season Ambient Switcher:** Summer ☀️, Monsoon 🌧️, Autumn 🍂, Winter ❄️ atmospheric filters and dynamic tile toning.
  3. **Architectural / Nature Gate Reveal:** GSAP SVG portal doors that smoothly slide open to reveal destination data cards upon selection.

---

## 2. Color System & Design Tokens (Bright Luxury Palette)

```css
:root {
  /* Surface Layers (Bright & Warm Champagne Aesthetic) */
  --cga-bg-base: #fbf9f4;               /* Warm Champagne Silk */
  --cga-bg-surface: #ffffff;            /* Pure Crisp Card Surface */
  --cga-bg-glass: rgba(255, 255, 255, 0.88);
  --cga-bg-glass-subtle: rgba(245, 239, 230, 0.7);
  --cga-border-glass: rgba(212, 175, 55, 0.22); /* Soft Antique Gold Hairline */
  --cga-border-subtle: rgba(0, 0, 0, 0.08);

  /* Brand Accents */
  --cga-gold-accent: #c6924b;           /* Antique Luxury Gold */
  --cga-gold-glow: rgba(198, 146, 75, 0.3);
  --cga-primary-route: #0284c7;         /* Mediterranean Azure Route Line */
  --cga-forest-contrast: #111c14;       /* Deep Forest Espresso (Primary Text) */
  --cga-terracotta: #e27238;            /* Warm Terracotta Action Pill */

  /* Typography */
  --cga-text-primary: #111c14;          /* Deepest legible forest charcoal */
  --cga-text-secondary: #576356;        /* Muted organic sage */
  --cga-text-muted: #8b998a;
  --cga-text-light: #fffdf5;            /* Off-white on buttons */

  /* Seasonal Hue Tokens */
  --cga-season-summer: rgba(251, 191, 36, 0.12);
  --cga-season-monsoon: rgba(16, 185, 129, 0.12);
  --cga-season-autumn: rgba(217, 119, 6, 0.15);
  --cga-season-winter: rgba(56, 189, 248, 0.12);

  /* Elevation */
  --cga-shadow-ambient: 0 16px 40px -8px rgba(17, 28, 20, 0.08);
  --cga-shadow-elevated: 0 24px 60px -12px rgba(17, 28, 20, 0.16);
  --cga-shadow-gold: 0 4px 20px var(--cga-gold-glow);
}
```

---

## 3. Typography & Hierarchy
- **Primary Typeface:** `'Plus Jakarta Sans'`, sans-serif (imported via Google Fonts).
- **Secondary / Monospace (Coordinates & Numbers):** `'JetBrains Mono'`, monospace.

| Element | Size / Weight | Letter Spacing | Purpose |
| :--- | :--- | :--- | :--- |
| **Brand Logo** | 20px / 800 (ExtraBold) | -0.03em | Header branding title |
| **Section H1 / H2**| 24px / 700 (Bold) | -0.02em | Panel titles, modal titles |
| **Card Heading** | 16px / 600 (SemiBold) | -0.01em | Destination & stop card titles |
| **Body Text** | 14px / 400 (Regular) | 0.0em | Descriptions, weather stats |
| **Badges / Tags** | 12px / 600 (SemiBold) | +0.02em | Temperature badge, Day pill |
| **Coordinates** | 11px / 500 (Medium) | +0.04em | Latitude/Longitude metadata |

---

## 4. Key Component Specifications

### 4.1 Search Input Bar
- Floating rounded capsule with frosted background blur.
- Integrated search icon, clear button, and an active pulsing search button.
- Focus ring: glowing cyan outer shadow (`var(--cga-shadow-glow)`).

### 4.2 Destination Weather Card
- Displays city name, country flag, and geographic coordinates in a monospace tag.
- Live Temperature readout (large 32px bold number) alongside an animated weather icon (sun, rain clouds, storm).
- Metrics grid: Humidity pill (💧 65%), Wind speed (💨 18 km/h), Weather condition description.
- Action CTA: Primary button *"Add to Itinerary"* with `+` icon.

### 4.3 Itinerary Stop Timeline Cards
- Sequential numbering badges (1, 2, 3...) connected by an elegant vertical route line.
- Reordering controls: `▲` Move Up, `▼` Move Down.
- Stop deletion button: subtle trash icon with red hover glow.
- Day categorizer: segmented pill tabs (`Day 1`, `Day 2`, `Day 3`, `+ Add Day`).
- Dynamic inter-stop distance & drive time pill (e.g., `🚗 48 km • 55 mins to next stop`).

### 4.4 Interactive Map Viewport & Route Layer
- Custom SVG marker pins:
  - 🟢 Origin stop (Start Pin)
  - 🔵 Intermediate waypoints
  - 🏁 Final destination (Finish Flag)
- OSRM route line styled with vibrant electric cyan `#0ea5e9` with a subtle pulsing dashed glow.
- Floating bottom-right summary chip: `Total Route: 184 km | Est. Travel Time: 3h 40m`.

---

## 5. What to Avoid (Negative Constraints)
- **NO Default Browser Alerts (`window.alert`):** Use custom animated glass toast notifications.
- **NO Harsh Solid Colors:** Never use raw `#ff0000` or `#0000ff`; always use curated HSL/Hex palette tokens.
- **NO Broken Layout on 375px Viewports:** On mobile screens, left panel and map stack vertically, or toggle via a bottom navigation bar.
- **NO Layout Shifts (CLS):** Map container must have explicit height or `flex: 1` fill, never collapsing to 0px while loading.
