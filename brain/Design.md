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

### 4.2 Right-Side Detail Panel (Primland Behavior — Replaces Centered Modal)
- **Position & Dimensions:** Floats on the right side of the screen (`width: 420px`, `top: 88px`, `bottom: 24px`, `right: 24px`), sliding in with a snappy GSAP cubic bezier (`x: 0` from `x: 450px`).
- **Map Remains Visible & Draggable:** The main Leaflet map stays 100% interactive and visible on the left side. Never blocks the entire screen with a white centered modal!
- **Mobile Adaptability:** On viewport width < 768px, slides up from the bottom as an elegant draggable bottom sheet (`height: 70vh`).
- **Dynamic Wikipedia Photo Resolution:** Hero image fetched dynamically via Wikipedia REST API (`/page/summary/{title}`) or Wikimedia geosearch near coordinates. Hardcoded image-theme mappings are strictly prohibited.
- **In-Panel Miniature Gate Reveal:** A subtle (~0.8s) in-panel gate/mist/wave curtain parting when opening, rather than a full-screen blocker.
- **Components Inside:** Hero photo, place title, administrative region, mono coordinates, live Open-Meteo weather badge, "Best season" tag, Travel Mode selector (🚗 Drive | 🚆 Transit | 🚶 Walk), Add to Itinerary CTA, Google Maps button, and Close button.

### 4.3 Clean Inline SVG Icon System (No Raw Emojis)
- Strictly replace all raw unicode emojis with crisp, consistent inline SVG vector icons with `stroke: 1.5px` and `stroke-linecap: round`.
- Consistent palette fill/stroke matching `--cga-gold-accent`, `--cga-forest-contrast`, and `--cga-text-secondary`.

### 4.4 Journey Timeline & Scroll-Linked Telemetry (Lightship Behavior)
- Pinned section where left = sticky Leaflet itinerary route, right = scrolling day timeline.
- Telemetry HUD numbers scrub smoothly with scroll progress using GSAP numerical interpolation.

---

## 5. What to Avoid (Negative Constraints)
- **NO Centered Screen-Blocking Modals:** Use the right-side glass panel (or mobile bottom sheet).
- **NO Raw Emojis in Place of Icons:** Use crisp 1.5px SVG icons everywhere.
- **NO Hardcoded Destination Images:** Always query Wikipedia/Wikimedia REST with graceful themed gradient fallbacks.
- **NO Default Browser Alerts (`window.alert`):** Use custom animated glass toast notifications.
- **NO Layout Shifts (CLS):** Map container must have explicit height or `flex: 1` fill, never collapsing to 0px while loading.
- **Respect `prefers-reduced-motion`:** If user requests reduced motion, disable scroll scrub physics and particle canvases; use simple opacity fades.
