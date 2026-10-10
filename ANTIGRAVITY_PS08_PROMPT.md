# PS-08 "One City, One Journey": Antigravity prompts + 2-hour plan

## The problem (from the brief)
Metro, BRTS and AMTS run as separate systems with separate tickets. A commuter who mixes them gets no single view of the journey, its total cost or the transfer walks.
**Deliverable:** a journey planner prototype that combines metro, BRTS and AMTS legs for a sample trip, showing **one fare estimate** and **transfer walking times**. **Bonus:** a **fare-splitting logic** between the operators.

## Judging criteria and how this build answers them
1. **Relevance:** one planner that merges 3 operators, one fare, every transfer walk shown, plus an Operator view with the money flow.
2. **Working prototype:** pick From and To, get 3 ranked journeys, a timeline, one fare, and the fare split. Works end to end.
3. **Resilience:** no CDN, no API needed, all data on the device, service worker, saved journeys, offline badge. The optional local AI falls back to a built-in summary.
4. **Technical depth:** Dijkstra routing over metro lines, multimodal combination search, ranking, fare and fare-split logic, an editable data layer with validation, optional on-device Gemma explanation.
5. **Feasibility and impact:** break-even maths for the discount and a PPP model (build, run, pay, pilot).

## How to use these prompts
1. Create a folder `onecity`. Inside it create `reference` and put the file `index.html` (the working prototype) there.
2. Open the folder in Antigravity. Paste **Prompt 0**, then Prompts 1 to 8 one at a time. After each, run `npm run dev` and check the "You should see" list before sending the next.
3. If something is wrong, send: `Fix this: <what you see>. Compare with reference/index.html and match it. Then run npm run build.`

---

## Prompt 0: Brief (paste first)

You are a senior full-stack engineer. We are building a hackathon prototype for the problem statement **PS-08 One City, One Journey** (DevFest Gandhinagar Metro Hacks).

1. Problem: metro, BRTS and AMTS have separate tickets. Build a journey planner that combines metro, BRTS and AMTS legs for one trip and shows ONE fare estimate and the transfer walking times. Bonus: propose fare-splitting logic between the operators.
2. Stack: Vite + React + JavaScript, plain CSS with CSS variables, `react-router-dom` (HashRouter), Vitest. No UI kit, no TypeScript.
3. Offline first: the app must work with no network. No CDN scripts, no web fonts, no required API. All data is embedded or saved in localStorage. Add a service worker and a web manifest.
4. English only.
5. `reference/index.html` is a complete working prototype. It is the source of truth for data, algorithms, wording and design. Port it to React exactly. Do not invent different data.
6. Metro data (53 stations, 4 lines) is real public GMRC data. BRTS and AMTS data is ILLUSTRATIVE SAMPLE DATA and must be labelled "sample" in the UI and replaceable by the user.
7. Work in small steps. After each step run `npm run build`, test in the browser at 360px, 768px and 1280px, in dark and light themes, and fix every error.

Reply only with "Brief understood" and a 5-line plan.

---

## Prompt 1: Scaffold and metro engine

1. Create the Vite + React project in the current folder. Install `react-router-dom`. Install `vitest` and add the script `"test": "vitest run"`.
2. Create `src/data/metro.js` and copy exactly from `reference/index.html`: `LINES` (name, color variable, km, station order), `XY` (map coordinates on a 1200x780 canvas), `LBL`, `ALIAS`, `UNDER`. Export `ALL` (sorted station names). Compute `kpx` (km per map pixel) for every line.
3. Create `src/lib/crowd.js` (`crowd`, `lvl`) and `src/lib/route.js` with `segKm`, `segMin` (at least 2 minutes per segment), `CHANGE_MIN = 4` and `plan(from, to, mode)` (Dijkstra over (station, line) states). Keep the `pick`, `seat` and `easy` modes exactly as in the reference.
4. Create `src/lib/search.js` with `norm`, `hasWord`, `lev`, `findStation`.
5. Tests that must pass:
   - There are 53 stations.
   - Paldi to Kalupur Railway Station: Red then Blue, 1 change.
   - Vastral Gam to Mahatma Mandir: Blue, Red, Yellow, 2 changes.

**You should see:** `npm test` all green.

---

## Prompt 2: Theme, header and offline badge

1. Create `src/styles.css` with the exact color tokens from the reference (`--bg --bg2 --card --bd --tx --mut --acc --acc2 --ink --st --blue --red --yellow --violet`) for dark (default) and light themes. Use system fonts only.
2. Header (sticky): the logo mark (copy the SVG from the reference) with the wordmark `ONE/JOURNEY` and the small text `Metro · BRTS · AMTS`; navigation links Journey (`/`), Operator view (`/operator`), Data (`/data`); an online/offline badge ("Online · works offline too" or "Offline mode", amber when offline, driven by the `online` and `offline` events); a theme toggle saved in localStorage.
3. Navigation stays visible in the header on every screen size. No hamburger menu and no bottom bar. Below 960px the header becomes two rows (logo and actions on top, the three links evenly spread below).
4. Footer text: "Prototype for DevFest Gandhinagar Metro Hacks, problem statement PS-08. Metro data from GMRC public information. BRTS and AMTS data is illustrative sample data. GMRC customer care: +91-79-22960123 (tel link). Works fully offline after the first load."
5. Buttons and inputs at least 44px tall, visible focus outlines, `prefers-reduced-motion` respected.

**You should see:** a two-row header at 360px, theme toggle persisting, the badge switching when you turn Wi-Fi off.

---

## Prompt 3: Feeder data model, validation and Data page

1. Create `src/data/sample.js` exporting `DEFAULT_DATA` copied exactly from the reference: `fares` (metro slabs by km, BRTS and AMTS slabs by number of stops, `discount` 0.10, `kmPerStop`), and `places` (10 areas: Chandkheda, Gota, Naroda, Maninagar, Ghatlodia, Memnagar, Satellite, Bopal, Vasna, Sarkhej). Each place has `opts` (mode BRTS or AMTS, route, metro station `st`, `ride` minutes, `stops`, `ws` walk minutes at the area end, `xfer` transfer walk minutes at the metro station, `head` headway minutes) and an optional `walk` ({st, min}).
2. Create `src/lib/data.js` with `loadData()` (reads localStorage key `ocdata`, falls back to the sample) and `validateData(d)` returning a list of readable errors (unknown metro station, mode not BRTS or AMTS, non-numeric fields, missing fares).
3. Page `/data`: a JSON textarea, buttons "Apply data" and "Reset to sample data", an error list, and an "Assumptions we made" card (copy the text from the reference). Applying valid data saves it in localStorage and takes effect immediately.
4. Add `resolve(text)` that matches an area name first and then a metro station (using `findStation`).
5. Test: the default data has zero validation errors; changing one station name to "Nowhere" gives one error.

**You should see:** editing the JSON and pressing Apply works, bad data shows a clear error.

---

## Prompt 4: Multimodal journey engine and fare logic

Port these functions exactly from the reference into `src/lib/journey.js`.

1. `accessOpts(place)`: the place's `opts` plus a WALK option when `walk` exists. For a metro station return one WALK option with 0 minutes.
2. `buildJourney(from, to, originOpt, destOpt, metroRoute)` creates the steps: walk to stop, wait (half the headway), bus ride, **transfer walk to the metro station** (marked as a transfer), wait 4 minutes for the metro, one metro step per line leg, a "Change to the X Line" walk (4 minutes) between legs, and the mirrored steps at the destination end.
3. Totals: total minutes, walking minutes, number of bus-metro transfers.
4. **Fares:** `metroFare(km)` and `busFare(option)` use the slabs in the data. Operators are "GMRC Metro", "BRTS (Janmarg)" and "AMTS". Own-ticket total = sum of operator fares. **One Journey fare** = own-ticket total x (1 - discount), rounded to a whole rupee, only when 2 or more operators are used. Otherwise it is the normal fare.
5. **Fare split (the bonus):** `splitOf(ops, unified, sum, by)`. By fare: operator share = unified x operator fare / sum. By distance: operator share = unified x operator km / total km. Bus km = stops x `kmPerStop`.
6. `journeys(from, to)` tries every access option at the origin with every option at the destination and skips pairs that use the same station. `rank(list)` returns up to 3 unique journeys with tags: **Saathi Pick** (time + 0.8 x walk + 0.5 x fare + 4 x transfers), **Walk Less** (least walking), **Pocket Saver** (lowest One Journey fare). One journey can carry several tags.
7. Tests with the sample data:
   - Naroda to GIFT City: own tickets ₹55, One Journey fare ₹50.
   - Chandkheda to Paldi: own tickets ₹30, One Journey fare ₹27.
   - Satellite to Motera Stadium: own tickets ₹30, One Journey fare ₹27.
   - Paldi to Kalupur Railway Station: metro only, ₹15, no discount.
   - Splits always add up to the One Journey fare.

**You should see:** all tests green.

---

## Prompt 5: Journey planner page (the main demo)

1. Page `/`: pill "PS-08 · Metro + BRTS + AMTS in one journey", headline "One city, one journey." (the words "one journey." in the accent color), intro text, and a form card with From and To inputs (datalist of all areas and stations, labelled "area or metro station"), 4 one-tap sample trips (`Naroda to GIFT City`, `Chandkheda to Paldi`, `Maninagar to Mahatma Mandir`, `Satellite to Motera Stadium` as in the reference) and a "Plan journey" button. Run Naroda to GIFT City on first load.
2. Results: tabs for the ranked journeys, each showing its tags, minutes, One Journey fare and walking minutes.
3. Journey card: title, four stat tiles (total minutes, one fare, walking minutes, bus-metro transfers), a green savings box ("One Journey fare ₹X instead of N separate tickets totalling ₹Y. You save ₹Z.", with distance and CO2), a **timeline bar** (segments sized by minutes, colored: walk grey, wait dark grey, BRTS orange, AMTS teal, metro line colors) with a legend, and a step list where **transfer walks are highlighted** and labelled "(transfer walk)".
4. "How the fare is shared" table (operator, own ticket, share by fare, share by distance, total row) and a proportional bar.
5. Buttons: "Save journey" (localStorage, max 10, listed as "Saved journeys (available offline)" with an Open button), "Share on WhatsApp", and "Explain with local AI" (see Prompt 7).
6. Map card: reuse the metro map component and highlight the route. Draw dashed feeder spurs from the interchange stations to the origin and destination areas (orange for BRTS, teal for AMTS) with the area name. Add zoom buttons; the map scrolls sideways on phones.
7. Errors: invalid names show a toast; From equal to To shows a toast; no journey shows a clear message.

**You should see:** the three tabs changing the timeline, fare, split table and the map spurs.

---

## Prompt 6: Operator view and PPP

1. Page `/operator`: heading "Operator view" and an Assumptions card with a slider for multimodal trips per day (1,000 to 50,000, default 10,000), a slider for the One Journey discount (0 to 25%, default 10%) and a select for the sharing rule (by fare or by distance).
2. A "Daily money flow" card for the last planned journey (default Naroda to GIFT City): a table with each operator's revenue today (own tickets), with One Journey, and the change (green or red). Below: "The discount costs about ₹X per day. To break even, multimodal trips must grow by about Y%." where Y = (own-ticket total / One Journey fare - 1) x 100.
3. A card "How a PPP could build, run and fund this" with four blocks. **Build:** a private technology partner builds the Journey Gateway (routing, one-fare pricing, settlement engine) on open data from the authorities. **Run:** the partner runs a daily clearing house that splits every NCMC or UPI tap between GMRC, AJL and AMTS and settles the next morning. **Pay:** the partner earns a small commission per settled trip (assumed 1.5%) plus sponsored offers; operators fund the discount from extra riders. **Pilot:** start where BRTS already meets the metro (Sabarmati, AEC, Ranip, Vadaj) for 3 months and measure transfers, fare share and private vehicle use.
4. Label every number as an assumption.

**You should see:** moving the sliders updates the table and the break-even instantly.

---

## Prompt 7: Offline (PWA) and local AI

1. Add `public/sw.js` (cache-first for the app shell with network fallback) and `public/manifest.webmanifest`. Register the service worker only when the page is served over http or https.
2. Confirm there are no CDN links, web fonts or external requests in the built app.
3. "Explain with local AI": call an on-device model through Ollama (`http://localhost:11434/api/generate`) with a model name constant at the top of `src/lib/ai.js` (default `gemma4`, tell the user to set the exact tag shown by `ollama list`). Send ONLY structured facts (steps, minutes, fares, shares) and instruct the model to explain in 4 short sentences and not to invent anything. Use a 25 second timeout.
4. If the call fails (Ollama not running, offline, CORS), silently show a built-in template explanation and label the source "Built-in summary (local AI is not running)". When the model answers, label it "Local AI (Gemma via Ollama, no internet needed)". The AI only explains. All routing and fares are computed in code.
5. Add a README note: start Ollama with `OLLAMA_ORIGINS=*` so the browser can call it.

**You should see:** with the network off, planning, saving, the Operator view and the Data page all still work.

---

## Prompt 8: Final QA, README and demo script

1. Run `npm run build` and `npm test`. Fix every error and warning.
2. Test all 3 pages at 360px, 768px and 1280px in both themes. No horizontal page scroll (only the map may scroll sideways). Keyboard: every control reachable with Tab and a visible focus outline.
3. Acceptance checks:
   - Naroda to GIFT City shows 2 tabs, a fare of ₹50 against ₹55, a timeline and a highlighted transfer walk.
   - The fare split rows add up to the One Journey fare in both methods.
   - Editing the Data page changes the results; invalid data shows an error.
   - The Operator view sliders update the numbers.
   - With the network off, every page still works.
4. Write `README.md`: setup, features, data sources, the assumptions, the PPP idea, and this 2-minute demo script: (1) the problem in one sentence, (2) plan Naroda to GIFT City, (3) show the timeline and transfer walks, (4) show one fare vs separate tickets, (5) show the fare split table, (6) switch off Wi-Fi and plan Chandkheda to Paldi, (7) open the Operator view and show break-even and the PPP model, (8) show the Data page: "load real BRTS and AMTS data here".
5. Start the dev server and list any assumptions you made.

---

## Your 2-hour plan on the train
- **0:00 to 0:15** Open the project, check it runs, set the Gemma model name, start Ollama (optional).
- **0:15 to 0:45** Replace sample feeder data with real stops you can find (even 4 or 5 routes, saved as JSON on the Data page).
- **0:45 to 1:15** Rehearse the demo on the Journey page, then test it with Wi-Fi off.
- **1:15 to 1:40** Polish the Operator view numbers and the PPP slide.
- **1:40 to 2:00** Freeze. Practise the 2-minute pitch twice. Do not add new features.

## What to say about the data (be honest)
"Metro data is real public GMRC data. BRTS and AMTS feeders are sample data with clearly stated assumptions. The Data page lets an operator drop in the real files and everything recalculates."
