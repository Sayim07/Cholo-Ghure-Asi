# Grounding Rules for AI Coding Tool (Rules.md) — Cholo Ghure Asssiii

> **CRITICAL DIRECTIVE:** Read this file before generating or modifying any code. If a user request or internal generation conflicts with these rules, **flag the conflict immediately instead of silently complying**.

---

## 1. Source-of-Truth Hierarchy
When documents or requirements conflict, resolve them in this strict order:
$$\mathbf{Rules.md} \;\succ\; \mathbf{Schema.md} \;\succ\; \mathbf{TRD.md} \;\succ\; \mathbf{PRD.md} \;\succ\; \mathbf{AppFlow.md} \;\succ\; \mathbf{Design.md} \;\succ\; \mathbf{ImplementationPlan.md} \;\succ\; \mathbf{Tracker.md}$$

---

## 2. App Naming Rule
- The single, immutable name of this application is **`Cholo Ghure Asssiii`**.
- Must appear identically in `<title>`, headers, footers, notifications, and documentation.
- Never abbreviate as "CGA", "CholoGhure", or invent alternate spellings.

---

## 3. Hard Scope Boundaries (Strict "DO NOT" List)
1. **DO NOT introduce React, Next.js, Vue, Svelte, or Angular.** All code must execute natively via browser ES6 modules.
2. **DO NOT build or require a Node.js/Express/Python backend server.** All interactions must run client-side in the browser.
3. **DO NOT use paid or token-gated APIs (Google Maps API, Mapbox GL token, OpenWeatherMap paid key).** Only use the free services locked in [TRD.md §2](file:///s:/sayim/GDG/brain/TRD.md#2).
4. **DO NOT fire Nominatim geocoding requests on keystroke (`input` event).** Queries must be triggered strictly on search button click or Enter key press to prevent 429 rate limit bans.
5. **DO NOT use `window.alert()`, `window.prompt()`, or raw unstyled dialogs.** Always dispatch custom glassmorphic toasts via `Toast.js`.
6. **DO NOT invent fields or alter property names** without first updating [Schema.md §3](file:///s:/sayim/GDG/brain/Schema.md#3).

---

## 4. The 4 Non-Negotiable Technical Rules

### Rule 1: Pure Vanilla JS with Modular Separation
- **Required:** Use ES6 modules (`import` / `export`) with distinct folders: `services/`, `components/`, `state/`, `utils/`, `config/`.
- **Forbidden:** Dumping all application logic into a massive 1500-line monolithic `script.js`.

### Rule 2: OpenStreetMap & API Attribution
- **Required:** Every map render must credit OpenStreetMap (`&copy; OpenStreetMap contributors`). Nominatim calls must include a custom `User-Agent` header (`CholoGhureAsssiii-TripPlanner/1.0`).
- **Forbidden:** Stripping map attribution or hammering public free endpoints without debouncing.

### Rule 3: Leaflet Responsive Invalidation
- **Required:** Whenever tabs change, panels open, or the window resizes, invoke `map.invalidateSize()` after a slight delay (150ms).
- **Forbidden:** Allowing the map container to render with grey missing tile rectangles due to uncalculated DOM dimensions.

### Rule 4: Graceful Degradation & Network Fault Tolerance
- **Required:** Wrap all `fetch` and Firebase asynchronous calls in `try...catch` blocks. If OSRM routing fails (e.g. overseas or route calculation error), fall back cleanly to a straight-line dashed polyline. If Firestore drops offline, fall back to `localStorage`.
- **Forbidden:** Unhandled promise rejections that freeze the UI or leave buttons in a permanent loading state.

---

## 5. Schema Consistency & Mutation Rules
- Every destination stop saved in state or Firestore must conform exactly to the `Stop` interface in [Schema.md §3.2](file:///s:/sayim/GDG/brain/Schema.md#32).
- Coordinates must always be stored as floating-point numbers: `latitude: number` and `longitude: number`.
- Never store coordinates as a single merged string `"22.5,88.3"`.

---

## 6. Grounded Talking Points for Selection Judges / Reviewers

| Evaluator Question | Grounded Technical Answer | Reference Doc |
| :--- | :--- | :--- |
| *"Why didn't you use React or Next.js for this project?"* | *"To rigorously adhere to the GDG assignment criteria evaluating core web fundamentals. We demonstrated that modern Vanilla JS using ES6 modules, clean state stores, and CSS custom properties can match framework responsiveness without bundle overhead."* | [TRD.md §2](file:///s:/sayim/GDG/brain/TRD.md#2) |
| *"How did you handle Nominatim's strict 1 req/sec rate limit?"* | *"We enforced an 800ms-1000ms client debounce, disabled the search button during in-flight requests, prevented keystroke querying, and cached frequent queries in localStorage."* | [TRD.md §4](file:///s:/sayim/GDG/brain/TRD.md#4) |
| *"How do you persist multi-day itineraries and budgets?"* | *"We use the Firebase Firestore v10 modular SDK writing to the `trips` collection, with an automated fallback to localStorage if network connectivity drops."* | [Schema.md §3](file:///s:/sayim/GDG/brain/Schema.md#3) |
| *"How do you calculate routes between stops?"* | *"We pass sequential waypoint coordinates to the OSRM driving endpoint, parse the returned GeoJSON LineString into a Leaflet polyline, and dynamically calculate distance and drive duration."* | [ImplementationPlan.md §2.4](file:///s:/sayim/GDG/brain/ImplementationPlan.md#24) |

---

## 7. Code Conventions & Standards
1. **Sanitization:** Never insert unsanitized user inputs directly into `element.innerHTML`. Use `element.textContent` or sanitize strings to prevent XSS.
2. **Formatting:** Use 2-space indentation, clear camelCase function/variable names, and PascalCase for component classes.
3. **No Hardcoded Absolute Paths:** All asset URLs, scripts, and stylesheets must use relative paths (e.g., `./styles/main.css`).
4. **Console Cleanliness:** Clean up all debugging `console.log()` statements before finalizing; retain only purposeful `console.error()` or `console.warn()` statements.

---

## 8. Protocol When Unsure
If any user prompt is ambiguous:
1. State the ambiguity clearly in one sentence.
2. Propose the option that best fits [PRD.md](file:///s:/sayim/GDG/brain/PRD.md) and [TRD.md](file:///s:/sayim/GDG/brain/TRD.md).
3. Never silently invent endpoints, third-party libraries, or database fields.

---

## 9. Definition of Done (DoD) per Feature
A feature is **Done** only when:
- [ ] Code is implemented in Vanilla JS/CSS according to specifications.
- [ ] No browser console errors occur during normal or edge-case usage.
- [ ] Layout behaves responsively across mobile (375px) and desktop (1280px+).
- [ ] Tested with real API responses and proper loading/error states.
- [ ] Status is updated in [Tracker.md](file:///s:/sayim/GDG/brain/Tracker.md).
