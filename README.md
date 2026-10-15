# Obscura — Find the Places the Guidebooks Missed

[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/OpenStreetMap-Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)

> **Made with precision and care by [Arushi Shetty](https://github.com/ArushiShetty)**

Obscura is an editorial travel discovery desk and deterministic day-by-day itinerary planner inspired by high-fashion travel publications and Pinterest moodboards. It uncovers quiet viewpoints, independent bookstores, artisan roasteries, and neighborhood tables across **Bengaluru**, **Kyoto**, and **Lisbon**.

Runs **100% on-device** on client-side React with zero external API dependencies, zero user tracking, and zero subscription paywalls.

---

## Author & Creator

| Name | Role | GitHub | Project |
| :--- | :--- | :--- | :--- |
| **Arushi Shetty** | Lead Developer & Designer | [@ArushiShetty](https://github.com/ArushiShetty) | [Obscura](https://github.com/ArushiShetty/Obscura) |

---

## Key Highlights & Features

### 1. Editorial Pinterest Aesthetic
- **Curated Palette**: Deep Ink (`#0e0f0c`), Warm Charcoal (`#141512`), Cream/Ivory (`#f3efe4`), and Muted Olive/Moss (`#8b9a6a`, `#6e7d4e`).
- **Modern Typography**: Expressive **Cormorant Garamond** serif headers paired with **Outfit** humanist sans.
- **Asymmetric Grid Layout**: Editorial moodboard headers, floating showcase cards, subtle grain/glow accents, and image hover transitions.

### 2. Curated 60-Place Dataset
- **20 Authentic Gems Per City** across Bengaluru, Kyoto, and Lisbon.
- Each place includes:
  - Quietness rating (1–10 scale)
  - Estimated cost per person
  - Suggested visit duration
  - Curated atmosphere tags
  - Exact GPS coordinates linked to OpenStreetMap

### 3. Deterministic Recommendation Algorithm
- **No black-box AI and no third-party rate limits**: Multi-factor scoring executes in milliseconds directly in browser JavaScript.
- Evaluates:
  - **Interest Tag Overlap** (+20 pts/match)
  - **Primary Category Affinity** (+15 pts)
  - **Budget Tier Fit** (+18 to +25 pts with overshoot dampening)
  - **Quietness Multiplier** (+2.5× quietness score when quiet preference is enabled)
  - **Offbeat Discovery Bonus** (+10 pts)
  - **Priority Pinned Place** (+500 pts) ensuring places selected via "Plan a trip around this" appear on Day 1.
- Variety guards prevent repetitive categories or neighborhood saturation.

### 4. Self-Healing Chronological Scheduling
- Automatically builds sequential, realistic daytime clock times based on travel rhythm:
  - **Relaxed**: Starts 09:30 AM · 2–3 stops/day · 70-min rest buffers
  - **Balanced**: Starts 09:00 AM · 3–4 stops/day · 50-min rest buffers
  - **Packed**: Starts 08:30 AM · 4–5 stops/day · 35-min rest buffers
- **Self-Healing Clock Order**: Reordering stops (Move Up/Down), removing activities, or adding stops dynamically recalculates start times so times always flow chronologically.

### 5. Interactive Map & Accessible List Fallback
- OpenStreetMap Leaflet integration with custom numbered stop pins (`1`, `2`, `3`...).
- **List Fallback Mode**: Instantly switch to an accessible tabular list view of coordinates and route sequences without relying on tile rendering.
- Day-filter tabs filter both timeline and map markers to view specific days.

### 6. Dynamic Budget Recalculator
- Party size stepper (`+` / `-`) live-adjusts estimated spend for the entire group.
- Visual proportional spend bars for each day.
- Clear per-person vs total party breakdown.

### 7. Private Local Storage & Editorial PDF Print
- Bookmarks and customized trips persist safely in browser `localStorage`.
- One-click duplicate and confirmation-guarded trip deletion.
- Clean `@media print` travel brochure layout formatted for white paper, black ink, and page breaks without on-screen controls.

---

## Project Structure

```
obscura/
├── index.html                   # Entry HTML & Google Fonts (Cormorant Garamond & Outfit)
├── package.json                 # Dependencies & scripts
├── vite.config.ts               # Vite configuration
└── src/
    ├── main.tsx                 # Root mount & Leaflet CSS
    ├── App.tsx                  # Router & AppProvider
    ├── index.css                # Tailwind theme tokens, custom markers, print stylesheet
    ├── types/
    │   └── index.ts             # Strict TypeScript models & enum constants
    ├── data/
    │   └── places.ts            # Curated collection (60 places across 3 cities)
    ├── lib/
    │   ├── budgetCalculator.ts  # Budget bands, day calculations, USD formatting
    │   ├── recommendationEngine.ts # Multi-factor scoring, variety caps & time recalculation
    │   └── storage.ts           # Safe localStorage JSON handlers
    ├── context/
    │   └── AppContext.tsx       # Global state (trips, bookmarks, timeline mutations)
    ├── components/
    │   ├── Navbar.tsx           # Nav with bookmarks badge & active trip indicator
    │   ├── Footer.tsx           # Editorial footer with creator credits & privacy notes
    │   ├── Layout.tsx           # Shell layout
    │   ├── PlaceCard.tsx        # Pinterest card with quietness meter & bookmark toggle
    │   ├── PlaceDetails.tsx     # Full modal with quietness gauge & GPS coordinates
    │   ├── MapView.tsx          # Leaflet map with numbered pins & List Fallback mode
    │   ├── MapBoundary.tsx      # Graceful error boundary fallback
    │   ├── ItineraryTimeline.tsx# Sequential timeline with reordering & stop actions
    │   └── BudgetSummary.tsx    # Spend calculator with live party size stepper
    └── pages/
        ├── HomePage.tsx         # Hero collage, manifesto, city showcases & sample days
        ├── DiscoverPage.tsx     # City tabs, search, category/budget filters & map view
        ├── PlannerPage.tsx      # Trip configurator with visual steppers & pace cards
        ├── ItineraryPage.tsx    # Main itinerary workstation with map & day filter tabs
        ├── SavedPlacesPage.tsx  # Bookmarks archive with city filters & quick planner
        └── MyTripsPage.tsx      # Saved trips manager with duplicate, print, and edit
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended; tested on v22)
- npm (v9 or higher; tested on v10)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` (or port indicated by Vite).

### 3. Production Build & Type Check
```bash
npm run build
npm run preview
```

---

## Recommendation Engine Architecture

When generating an itinerary in `PlannerPage.tsx`, the algorithm executes synchronously:

$$\text{Score} = \text{Base}(10) + (20 \times \text{Interests}) + 15_{\text{Category}} + \text{BudgetFit} + 2.5 \times \text{Quietness} + 10_{\text{Offbeat}} + 500_{\text{Pinned}}$$

1. **City Pool**: Isolates candidates matching the target city (`Bengaluru`, `Kyoto`, or `Lisbon`).
2. **Multi-Factor Scoring**: Evaluates candidate places against user inputs.
3. **Variety & Neighborhood Caps**: Enforces constraints preventing category over-representation.
4. **Day Clustering & Spatial Sorting**: Distributes places across days and sorts by latitude coordinates for spatial coherence.
5. **Sequential Clock Scheduling**: Calculates ascending timestamps (`startTime`) based on visit durations and pace rest gaps.

---

## Core User Journey

1. **Discover**: Browse 60 gems across Bengaluru, Kyoto, and Lisbon with instant search, category filters, and map visualization.
2. **Inspect & Bookmark**: View quietness levels, neighborhood descriptions, and bookmark favorites to `localStorage`.
3. **Plan**: Configure city, 1–7 days, party size, pace, budget tier, and quietness preference.
4. **Itinerary & Route Map**: View chronological day timeline, numbered pins on OpenStreetMap, or toggle to List Fallback.
5. **Edit & Fine-Tune**: Reorder stops (clock times self-heal), add remaining gems, rename trip title, and adjust party size.
6. **Save & Export**: Store in My Trips archive, duplicate journeys, and print or save as clean travel brochure PDF.

---

## License & Credits

- **Creator**: **Arushi Shetty** ([@ArushiShetty](https://github.com/ArushiShetty))
- **Repository**: [https://github.com/ArushiShetty/Obscura.git](https://github.com/ArushiShetty/Obscura.git)
- Map data by [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
