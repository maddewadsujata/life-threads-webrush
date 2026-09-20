# Life Threads — Your Life, In Receipts

> **WebRush 6-Hour Frontend Hackathon Project**  
> Problem Statement: *"Your Life, In Receipts"*  
> Concept: A person's digital life consists of hundreds of tiny moments—a song played at 2 AM, a place visited, a photo taken, something purchased, a movie watched, a message saved, a search made, an event attended, a personal note written. Individually small, together they tell a story.

---

## 🌟 Philosophy: Beyond Chronology

A simple chronological timeline is not sufficient. **Life Threads** transforms raw life receipts through a four-stage cognitive pipeline:

$$\text{Raw Data} \longrightarrow \text{Insights} \longrightarrow \text{Connections} \longrightarrow \text{Story}$$

---

## 🚀 Core Features

### 1. 🔍 Receipts Explorer
- 9 verified digital categories:
  - 🎵 **Music** (artists, tracks, albums, listening context)
  - 🎬 **Movies & Entertainment** (screenings, festivals, directors)
  - 📍 **Places** (venues, cafes, trails, neighborhoods)
  - 🛍️ **Purchases** (merchants, prices, gear, vintage finds)
  - 📸 **Photos** (cameras, exposures, street photography)
  - 💬 **Messages** (conversations, group chats, saved quotes)
  - 🔎 **Searches** (late-night questions, curiosity queries)
  - 🎟️ **Events** (live shows, retrospectives, farmers markets)
  - 📝 **Personal Notes** (ideas, reflections, observations)
- Multi-criteria filtering by category pills, date range (`7D`, `30D`, `90D`, `All`), location dropdown, and sorting (Newest, Oldest, Most Connected).
- Instant toggle between **Grid View** and **List View**.

### 2. ⚡ Deterministic Connection Engine
- Real-time in-browser relationship calculations without external blackbox APIs:
  - **Same Location / Venue cluster**: $+30\text{ pts}$
  - **Temporal Proximity** ($\le 30\text{ min}$: $+30\text{ pts}$, $\le 2\text{ hrs}$: $+20\text{ pts}$, $\le 6\text{ hrs}$: $+10\text{ pts}$)
  - **Same Calendar Day**: $+20\text{ pts}$
  - **Shared Semantic Keywords & Entity Overlap**: $+15\text{ pts}$
  - **Shared Categorical Tags**: $+10\text{ pts}$
  - **Complementary Life Sequence** (e.g. *Music* ↔ *Places*, *Photos* ↔ *Places*, *Searches* ↔ *Notes*): $+15\text{ pts}$
- Fully transparent evidence cards showing *why* two receipts are connected.

### 3. 🕸️ Cross-Temporal Relationship Graph
- Interactive SVG network representation:
  - Nodes represent individual life receipts, color-coded by category.
  - Node radii scale with degree centrality (number of connections).
  - Edges represent discovered connections, with stroke weight reflecting affinity score.
  - Zoom ($\pm$), drag-to-pan, node hover highlights connected neighborhood, category filtering, and thread isolation.

### 4. 📖 Cinematic Story Mode
- Transforms discovered threads into sequential, chapter-based interactive playback.
- Visual flow progression: `Music → Place → Photo → Purchase → Event`.
- Evidence-grounded narrative text derived strictly from metadata facts.
- Animated transitions, chapter progress indicator, and celebration milestones.

### 5. 📊 Behavioral & Spatial Life Insights
- 24-hour diurnal activity spectrum chart (highlights late-night creative blocks vs. daytime workflows).
- Day of week activity cadence.
- Top repeated spatial anchors and frequent venues.
- Category co-occurrence affinity matrix.
- Dynamic intelligence cards:
  - *Busiest Observed Day*
  - *Primary Spatial Anchor*
  - *Peak Activity Window*
  - *Strongest Discovered Link*
  - *Central Anchor Moment*
  - *Most Diverse Activity Day*

### 6. 📂 Organizer Dataset Importer
- Client-side drag-and-drop or file upload for `.csv` and `.json` files.
- Robust header normalization with automatic category inference, date parsing, and tag extraction.
- In-memory processing with instant connection network recalculation.
- Seamless one-click reset to the curated 112-moment demo dataset.

### 7. ⌨️ Global Command Palette (`⌘K` / `Ctrl+K`)
- Instant search across moments, locations, tags, threads, and quick navigation routes from any screen.

---

## 🛠️ Technology Stack

- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS with custom fonts (Plus Jakarta Sans, Space Grotesk, JetBrains Mono)
- **Data Visualization**: Recharts & interactive native SVG Canvas
- **Date Arithmetic**: date-fns
- **Delight & Micro-interactions**: canvas-confetti, Lucide React icons
- **Zero Backend**: 100% client-side privacy-first architecture

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```
