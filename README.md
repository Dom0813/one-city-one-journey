# One City, One Journey — Ahmedabad & Gandhinagar Multimodal Planner

> Prototype built for **DevFest Gandhinagar Metro Hacks (Problem Statement PS-08)**.

A resilient, offline-first multimodal journey planner connecting **Ahmedabad & Gandhinagar Metro (GMRC)**, **Janmarg BRTS (AJL)**, and **AMTS**. Provides one unified discounted fare, explicit walking transfer guidance, an interactive transit map with feeder spurs, and an automated clearing house revenue settlement engine.

---

## 🚀 Quick Setup & Running

### Requirements
- Node.js 18+ (tested with Node 20 / 22 / 24)
- npm

### 1. Installation & Build
```bash
npm install
npm test            # Run Vitest test suite (all green)
npm run build       # Production bundle (zero errors, offline ready)
```

### 2. Run Locally
```bash
# Start development server
npm run dev

# Or test production build with Service Worker
npm run build
npm run preview
```
- Dev URL: `http://localhost:5173/`
- Preview URL: `http://localhost:4173/`

### 3. Optional Local AI (Ollama)
For on-device journey explanation without internet:
1. Ensure Ollama is installed and run:
   ```bash
   OLLAMA_ORIGINS=* ollama run gemma4
   ```
2. The app calls `http://localhost:11434/api/generate` with a 25-second timeout.
3. If Ollama is not active or the device is offline, the app seamlessly falls back to the built-in summary engine with no user-facing error.

---

## 🧭 Architecture & Features

1. **Multimodal Routing Engine (`src/lib/journey.js`, `src/lib/route.js`)**:
   - Dijkstra state-space graph search over (station, line) states for Ahmedabad & Gandhinagar Metro.
   - Multimodal combination search joining feeder bus origins/destinations with metro rail interchanges.
   - Multi-criteria ranking: **Saathi Pick** (weighted score), **Walk Less**, and **Pocket Saver**.
2. **Unified Fare & Settlement (`src/lib/journey.js`)**:
   - 10% One Journey discount applied when 2 or more transit operators are utilized.
   - Conservation-safe fare splitting (`splitOf`) distributing shares by fare proportion or passenger distance traveled, strictly summing to the One Journey total.
3. **Editable Feeder Data Layer (`src/pages/DataPage.jsx`, `src/lib/data.js`)**:
   - Live JSON editor for feeder bus routes and fare slabs with validation against known metro stations.
   - Changes persist to `localStorage` and immediately recalculate all routing and splits.
4. **Operator Economics & PPP View (`src/pages/OperatorPage.jsx`)**:
   - Interactive daily ridership and discount sliders.
   - Dynamic clearing house reconciliation and break-even growth calculator.
   - Public-Private Partnership (PPP) model breakdown (Build, Run, Pay, Pilot).
5. **Offline PWA First**:
   - Custom Service Worker (`public/sw.js`) with cache-first app shell strategy.
   - Web App Manifest (`public/manifest.webmanifest`).
   - Zero CDNs, zero web fonts, zero remote images. 100% functional without internet.

---

## 📊 Data Sources & Assumptions

- **Metro Data**: Real public GMRC operational network data (53 operational stations across Blue, Red, Yellow, and Violet lines).
- **Feeder Data (BRTS & AMTS)**: Illustrative sample data covering 10 key residential and employment hubs (Chandkheda, Gota, Naroda, Maninagar, Ghatlodia, Memnagar, Satellite, Bopal, Vasna, Sarkhej) connecting to adjacent metro stations.
- **Transfers**: Inter-modal walking transfers calculated based on physical concourse layout (3 to 6 minutes). Commuter wait times modeled as half the published line headway.
- **Bus Distance Proxy**: Estimated at 0.9 km per bus stop for distance-based revenue allocation.

---

## 🤝 Public-Private Partnership (PPP) Framework

- **BUILD (Journey Gateway)**: Private technology partner develops the routing, ticketing gateway, and settlement engine on open transit GTFS and fare tables.
- **RUN (Clearing House)**: Partner operates the automated clearing house settling daily NCMC/UPI fare pools across GMRC, AJL, and AMTS at T+1.
- **PAY (Commercial Model)**: Partner earns a 1.5% settlement commission plus contextual mobility sponsorships; operators fund the 10% discount from ridership expansion.
- **PILOT (Validation)**: 3-month trial across 4 core interchange hubs (Sabarmati, AEC, Ranip, and Vadaj).

---

## ⏱️ 2-Minute Pitch & Demo Script

Follow this step-by-step walkthrough during the demo:

1. **The Problem (10s)**:
   > *"Today in Ahmedabad and Gandhinagar, Metro, BRTS, and AMTS run with fragmented tickets, making commuters buy separate passes with no single view of the trip, cost, or transfers."*
2. **Plan Naroda to GIFT City (20s)**:
   > *Tap "Naroda to GIFT City" on the Journey planner. Point out the instant multimodal resolution combining BRTS 8D to Kalupur Railway Station with the Blue, Red, Yellow, and Violet metro lines.*
3. **Show Timeline & Transfer Walks (20s)**:
   > *Highlight the colored timeline bar showing bus leg, wait times, transfer walk (highlighted in cyan), and metro legs.*
4. **Compare One Fare vs Separate Tickets (15s)**:
   > *Point out the green savings tile: "One Journey fare ₹50 instead of separate tickets totalling ₹55 (Save ₹5)".*
5. **Show Fare Split Table (15s)**:
   > *Scroll to "How the fare is shared". Show how the ₹50 total is cleanly split between BRTS and GMRC Metro by fare or distance, always adding up to exactly ₹50.*
6. **Switch off Wi-Fi & Plan Offline (20s)**:
   > *Turn off Wi-Fi. Notice the badge switches to amber "Offline mode". Tap "Chandkheda to Paldi". The app plans instantly, showing ₹27 unified fare vs ₹30 separate tickets.*
7. **Open Operator View (15s)**:
   > *Click "Operator view" in the header. Adjust the daily ridership and discount sliders. Show the daily money flow table and break-even math (e.g. 11.1% ridership growth needed to cover the discount).*
8. **Show Data Page (10s)**:
   > *Navigate to "Data". Explain: "Metro data is real GMRC data; BRTS and AMTS feeders are sample data. An operator can paste real GTFS/feeder JSON right here, click Apply, and everything recalculates instantly."*
