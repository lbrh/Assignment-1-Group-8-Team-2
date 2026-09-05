# Prototype Change Summary — WK1 → WK2 v2
 
**Project:** AI-Powered Bushfire Situational Awareness & Emergency Response

**Client:** IBM · Client representative: Naresh Olladapu

**Team:** Team 8 — AI for Emergency & Environmental Response — Team B
 
**Artifacts compared:**
- `Bushfire Prototype Sprint 1 WK1.dc.html` — the original prototype (unchanged, kept as the "before" reference)
- `Bushfire Prototype Sprint 1 WK2 v2.dc.html` — the refined version
**Source documents used:**
- `Define_Target_Users_&_Core_Requirements.md` and `Bushfire_Severity_Rubric_and_Acceptance_Criteria.md` — Sprint 1, Week 1
- `Refine_User_Stories,_Requirements_&_Traceability.md` — Sprint 1, Week 2 (Aryaveer's refinement pass)
- `UX_research.pdf`
**Labels used throughout this document:**
- `[WK1]` — cited from the original Week 1 requirements documents
- `[WK2]` — cited from Aryaveer's refined Week 2 requirements document
- UX research "Problem" references are sourced from `UX_research.pdf`, not a requirements doc, so they carry no week label themselves — where a Problem is also tied to a specific FR/AC/NFR/US number, that number carries its own label.
---
 
## 1. Overview
 
This document explains what changed between the two prototypes and why.
 
WK1 was built directly against the approved requirements `[WK1]`. It covered all ten functional requirements at a basic level: image submission with geotag and timestamp validation, an AI severity tag, a detailed report, a map with numbered and colour-coded markers, a clickable marker to report flow, a dispatch order ranked by severity then distance, and a "flagged for review" state for images the model could not assess.
 
WK2 v2 keeps that structure and responds to two things that came after WK1:
 
1. **The UX research** (`UX_research.pdf`), which identified six problems coordinators face and set out specific design consequences — most importantly that AI reasoning must be visible, that override must take one action, that low confidence must be routed to human review rather than force-classified, that high and low severity must look genuinely different, and that map clutter must be managed by clustering.
2. **A design-quality pass**, covering visual hierarchy, typography and spacing consistency, and the priority/order screen specifically.
No WK1 capability was removed. A small number of purely decorative elements were removed for consistency — a blinking status indicator in the header and order screen (see §2.0, §2.4) — because they carried no incident information. Everything else in WK1 is still present; the changes otherwise add explainability, add a real destination for unassessable images, and tighten the visual system.
 
*Note: Aryaveer's refined doc `[WK2]` was released partway through this sprint and formalises several things this prototype had already anticipated (see the `[WK2]` labels throughout §2–§5), plus some new scope (FR11, FR12) not yet built. See §3 for the full picture.*
 
---
 
## 2. Screen-by-screen comparison
 
### 2.0 Application shell (all screens)
 
**WK1.** Light grey web-application styling — Source Sans 3 and JetBrains Mono, rounded corners, soft drop shadows, a blue accent. Three tabs: Map, Dispatch Order, Submit Image. A header strip with a live incident count, clock and user initials. Controls were mouse-only — no element carried a `tabindex` or focus state.
 
**WK2 v2.**
- Rebuilt as a dark operations console (IBM Plex Sans / IBM Plex Mono, square corners, teal accent), with a **light theme** available via a CONTRAST toggle in the header. The choice persists between sessions.
- Four tabs — **Manual Review** is new and carries a live count of unclassified images.
- **Full keyboard operation.** Tab moves between controls, Enter or Space activates them, Left/Right arrows switch screens, Alt+1-4 (Option+1-4 on Mac) jumps straight to a screen, and **?** opens a shortcut panel. Controls also report themselves correctly to screen readers. See §2.6.
- A blinking status-indicator dot that previously flashed in the header (and on the order screen — see §2.4) was removed. It carried no incident information, and the review pass concluded that nothing should animate for attention on a tool whose whole argument is that urgency should be earned, not manufactured. The only motion left in the interface is a brief arrival pulse when a new incident is inserted onto the map (see §2.2).
- A **"SP1 WK2 Notes"** toggle overlays short Δ WK2 annotations explaining each change in place. This is a review aid for this playback, not a product feature — it can be switched off.
**Why.** The dark console treatment and the light/dark toggle were iteration decisions made during Week 2 and are not tied to a specific requirement or research finding; the toggle exists so the prototype can be read in both a dim control room and a bright room or projector. Keyboard access is basic accessibility hygiene — it isn't required by a specific documented NFR (the requirements set doesn't define a "minimal training" or "input method" NFR; NFR4 is actually *load tolerance* `[WK1]`, not restated anywhere in the WK2 refined doc — see §3), but it fits the target-user context in the requirements — coordinators working at speed, where a mouse may not always be available. The four-tab structure is required by **AC10.2** `[WK1]` (now **US10 AC1** `[WK2]`) — flagged images have to *remain visible to the user*, which needs somewhere to live.
 
---
 
### 2.1 Image Submission
 
**WK1.** Title, image drop zone, latitude / longitude / capture-time fields with a red asterisk, optional notes, submit and clear. A rejection banner appeared at the top of the card if geotag or time was missing, and the relevant field border turned red. Submitting a valid image showed a spinner and a progress bar with three lines of status text, then placed the new incident on the map.
 
**WK2 v2.**
- New **SUBMISSION FLOW** panel above the form showing four explicit states: attach image → geotag + capture time → submission confirmed → AI assessment running. Each step shows as waiting, done or running.
- An explicit green **"Submission confirmed · ref SUB-2291 · geotag and capture time recorded"** line now appears *before* the assessment progress bar.
- Field-level error messages under latitude, longitude and capture time, in addition to the existing top banner.
- Processing copy now states that existing incidents stay on the map and the result is inserted rather than reloaded.
- A third demo button, **"Demo: low-confidence result"**, produces a submission the model cannot classify, which is routed to Manual Review instead of being given a severity.
**Why.**
- The four-state tracker and the separate confirmation line serve **AC1.3** `[WK1]` (now **US1 AC2** `[WK2]`) — "a successful attachment is confirmed to the user before AI processing begins." In WK1 confirmation and processing were visually the same event, so a field submitter could not tell that the geotag had been accepted.
- The "inserted, not reloaded" copy makes **AC7.2** `[WK1]` (now folded into **US7 AC1** `[WK2]`) visible rather than implied.
- Field-level errors support **NFR5** `[WK1]` (reaffirmed by name in the WK2 refined doc's edge cases, §5 `[WK2]`: degrade in a smooth, informative manner) and **AC1.2** `[WK1]` (now **US1 AC1** `[WK2]`).
- The low-confidence demo path makes **AC2.3** `[WK1]` (now reframed around a confidence threshold as **US2 AC2** `[WK2]`) and **AC10.1** `[WK1]` (now **US10 AC1** `[WK2]`) demonstrable end to end instead of only existing as pre-seeded data.
---
 
### 2.2 Map
 
**WK1.** Six incidents plotted at fixed positions. Marker size and colour varied by severity (36–54 px, four rubric colours) with the severity number inside and the incident ID beneath. A four-row severity legend with live counts sat bottom-left. Zoom + / − buttons were present but **had no behaviour attached** — they were decorative. The right-hand panel listed active incidents with severity dot, place, ID, age and status.
 
**WK2 v2.**
- **Working three-level zoom.** Z1 (regional) and Z2 (district) group nearby detections into cluster markers showing the number of sites and the highest severity in the group; Z3 shows every incident as its own marker. A status bar top-left names the current level.
- **Marker deconfliction.** At every zoom level, markers are nudged apart so no marker overlaps another marker, the legend, the status bar or the terrain labels. Verified at Z1, Z2 and Z3 with zero overlaps.
- Each marker now carries a severity **abbreviation chip** (MOD / HIGH / EXT / CAT, or a dashed "?" treatment for unassessable) alongside its number and colour.
- The legend gained a fifth row for **REVIEW** with its own count, and its dots are sized proportionally (30 / 26 / 22 / 18 px) rather than flattened to one size.
- New **filter chips** in the side panel: All, Sev 3–4, Review.
- The side panel rows now also show a confidence percentage and a status chip.
- When a new incident is inserted (see §2.1), its marker plays a brief arrival pulse so a coordinator notices it land — this is the only animated element remaining in the interface (see §2.0).
**Why.**
- Clustering and deconfliction implement **Problem 4 — map clutter hides what matters**, and the research's direct instruction to cluster and only expand detail on zoom. Overlap removal also protects **AC4.3** `[WK1]` (now **US4 AC2** `[WK2]`) and **AC5.3** `[WK1]` (now **US5 AC2** `[WK2]`) — no processed incident is missing from the map, and severity must be identifiable from the map alone. **FR15** `[WK2]` now sets an explicit numeric target for this — "zero overlapping markers at default zoom" — which the verification note above already meets.
- The abbreviation chip adds a third, non-colour channel to severity, reinforcing **AC5.1/5.2** `[WK1]` (now **US5 AC1** `[WK2]`, worded as colour/size/visual weight — note the WK2 wording drops the explicit word "number" that AC5.1 had, though the prototype still shows one) and **Problem 3 — "cry wolf" alert fatigue**, where the research is explicit that high-severity fires must look and feel genuinely different from low-severity ones. **FR16** `[WK2]` now sets a testable target for this — 90%+ correct severity identification from colour/size alone in usability testing — which hasn't been tested yet.
- Proportional legend dots are a **visual-quality decision**: the legend is where the size encoding is taught, so the four dots step down in size the way the markers do. WK1 drew all four legend dots at one size, which stated the colour half of the encoding but not the size half.
- Filters address **Problem 1 — information overload**, cutting the field to what is being worked instead of adding another feed.
- The REVIEW legend row makes flagged items visually distinguishable on the map itself (**AC10.3** `[WK1]`, now **US10 AC2** `[WK2]`).
**Considered and rejected:** a separate colour for the REVIEW marker/legend treatment. This was ruled out because a fifth colour on a scale built around four rubric colours risked being read as a fifth severity level, undermining the rubric itself. The dashed "?" pattern was used instead, since a pattern doesn't compete with the colour channel that carries severity.
 
---
 
### 2.3 Incident Detail
 
**WK1.** Header with a large severity dot, severity label, "severity N of 4 · automated assessment", incident ID and status chip. Left column: image placeholder, location, captured time, distance from staging. Right column: a "WHY THIS RANKING" card containing a plain-language summary, three supporting bullets, and a footer line reading `confidence high · assessed 14:02 · model v0.3`. Then recommended action and three buttons: Dispatch crew, Flag for manual review, View in dispatch order. The flag button only raised a notification — there was nowhere for the image to go.
 
**WK2 v2.**
- **Numeric confidence block** in the header: percentage, band label (High / Moderate / Low confidence), a five-segment bar, and a note saying whether the figure is above or below the auto-classify threshold.
- The reasoning card is renamed **"WHY THIS SEVERITY"** and now shows the **detected indicators** as discrete chips ("Dense smoke blocking vision", "Large flame wall", "Occupied structures in fire line") mapped to the rubric, plus the rubric level and a source tag — AI-classified, coordinator override, or coordinator-assigned.
- New **OVERRIDE SEVERITY** control: four one-click severity buttons with rubric hints in their tooltips, plus an **Undo · back to AI level N** action. Overriding immediately re-ranks the dispatch order and changes the header subtitle to record that a coordinator made the call.
- A **low-confidence banner** appears on unassessable incidents with a direct "Open manual review →" action.
- "Send to manual review" now navigates to the real Manual Review screen.
- New exportable **RECORD** line showing the stored field values (`sev= conf= lat/lng= t= status=`).
- **Header hierarchy:** the severity label is the largest element in the header (24 px), with the confidence figure below it at 20 px. Confidence is a qualifier on the assessment, not the assessment, so severity leads — while the five-segment bar and band label are held at full size so confidence is still unmissable.
**Why.**
- Indicators, the confidence figure and one-click override are the direct response to **Problem 2 — dispatchers stop trusting automated rankings on hard cases** (reliance fell 41% on complex cases in the cited ambulance-dispatch study). The research's instruction is specific: show why the AI ranked it that way, and make override one action, not five. This is now also formalised as **FR13** `[WK2]` (confidence score) and **FR14** `[WK2]` (override). *Note:* FR14 `[WK2]` specifies override should take "one click plus a confirmation step" — the built control here is one-click plus an **Undo** afterward, which is a different pattern (confirm-before vs. undo-after). Worth confirming with Aryaveer whether undo satisfies the intent, since a confirm-before step reintroduces exactly the friction Problem 2 warns against.
- The numeric confidence figure follows **Problem 5 — AI confidence must be honest**, and the ALERTCalifornia precedent of showing a percentage next to every detection. Also **FR13** `[WK2]`.
- The source tag serves **core user need 4** `[WK1]` (each severity tag must describe why it sits at its level, so decisions can be justified later).
- The RECORD line serves **AC3.3** `[WK1]` (now **US3 AC2** `[WK2]`) — report data matches the stored record.
- Indicator chips tie the explanation to the rubric's own indicator wording, directly serving **core user need 4** `[WK1]`. Note: this is deliberately *not* attributed to AC9 `[WK1]` — AC9 covers explaining a ranked *position* (see §2.4), not a severity classification, and citing it here would double up a criterion that already has a cleaner home on the order screen (AC9 is now **US9** `[WK2]`).
---
 
### 2.4 Dispatch Order (priority screen)
 
**WK1.** Six columns: RANK, SEV, LOCATION, WHY THIS POSITION, DIST, action. Ranked by severity then distance, with unassessable items pushed to the bottom with an em-dash rank. The "why this position" text was generated from a template — e.g. *"Extreme · ranked by severity, then 11.4 km from staging"* — which restated the sorting rule rather than saying anything about the incident. The Dispatch / Review buttons **had no behaviour attached**.
 
**WK2 v2.**
- New **CONF column** — percentage plus a compact segment bar per row.
- **"Why this position" is now authored per incident** and describes what about that incident drives its place: exposure, access, spread. For example, *"Twelve occupied dwellings sit downwind with Ridge Rd as the only egress, and it is already smoke-affected"* instead of a restatement of its severity.
- The SEV cell gained the severity abbreviation chip, matching the map and the detail screen.
- Dispatch and Review buttons work; Review opens the Manual Review screen for that image.
- Unclassified rows are visibly held out: em-dash rank, dimmed row, dashed "Review" button, and a footnote stating they are **never force-classified**.
- The blinking status-indicator dot previously on this screen (see §2.0) was removed for the same reason — no attention-seeking animation without a corresponding change in the underlying data.
- **Visual-quality fixes:** the rank figure is set at 22 px so the leading position on each row is the largest thing on it, and the severity abbreviation uses the same bordered-chip treatment as the map and detail screens rather than a smaller bare-text variant.
**Why.**
- Per-incident reasoning is **AC9.1 and AC9.2** `[WK1]` (now merged into **US9 AC1** `[WK2]`) — each ranked incident includes a reason for its position, and the explanation references the actual severity indicators. WK1 technically had a reason string but it did not reference indicators, so it met AC9.1 only in form.
- The confidence column and the "never force-classified" footnote serve **AC10.1** `[WK1]` (now **US10 AC1** `[WK2]`) and **Problem 5**.
- Rank emphasis and chip parity are **visual-quality and consistency decisions** — no requirements-doc citation, part of this sprint's design-quality pass.
- The screen was checked for whether it reads as its own "what do I do next" view rather than a restyled map list: it uses a tabular grid, panel background, no terrain colours, and a per-row action, so this was judged already adequate and was not changed beyond the items above.
**Considered and deliberately not implemented:**
- *Comparative reasoning* ("ranked above INC-0431 on exposure"). Rejected: it adds a second line to every row, and the comparison goes stale the moment a coordinator overrides a severity and the order re-ranks. A wrong explanation damages trust more than a correct incomplete one.
- *Severity tier separators between rank blocks.* Rejected: the dot size already steps down the column, so separators would add chrome to restate an existing signal.
---
 
### 2.5 Manual Review — **new screen**
 
**WK1.** Did not exist. An unassessable image (INC-0433) appeared on the map and at the bottom of the order with a dashed "?" marker and a "Review" label, and the detail screen had a "Flag for manual review" button, but there was no screen to review it on and no way to resolve it.
 
**WK2 v2.** A full screen with:
- A **review queue** in the left column listing every unclassified image with its confidence percentage and the line "unclassified · not on the dispatch order".
- An **"Unable to assess"** banner — hatched background, dashed borders, "?" symbol — deliberately styled so it cannot be mistaken for a confident classification, with the confidence figure and "Below 60% threshold".
- The **original submitted image**, marked unmodified as received from the field, plus a metadata table (geotag, place, captured, distance, status).
- **"WHY THE MODEL COULD NOT CLASSIFY THIS"** — the specific obstruction for that image (smoke obscuring the front, motion blur, backlighting, no comparison image), plus the model's *unapplied* range, clearly labelled as not used for ranking.
- **ASSIGN SEVERITY MANUALLY** — four rubric levels with their indicator hints, recorded as a coordinator decision rather than an AI classification. Assigning moves the incident onto the dispatch order labelled "Manual".
- **Request second image** and **Locate on map** actions, and an empty state for when the queue is clear.
**Why.**
- This closes **FR10 / AC10** `[WK1]` (10.1, 10.2, 10.3, now **US10 AC1/AC2** `[WK2]`) properly: flagged rather than falsely tagged, still visible to the user, and clearly distinguishable from tagged incidents by status, label and visual treatment.
- It implements **core user need 5** `[WK1]` — images the model cannot assess must be *honestly* presented for manual assessment.
- It is the direct answer to **Problem 5**: route low-confidence cases to a human-review queue instead of forcing the coordinator to trust a shaky call.
- The rubric document `[WK1]` lists "There is no 'Unable to assess' category" as a known limitation and raises it as **Q2 — do we need an Unable To Assess category?** This screen answers Q2 in the affirmative in prototype form.
- **Open question carried in the artifact:** neither **AC10** `[WK1]` nor **US10** `[WK2]` define a "no fire present / dismiss" outcome, so a coordinator currently must either assign a severity or request another image. This needs a BA decision.
---
 
### 2.6 Keyboard access and screen-reader semantics (all screens)
 
**WK1.** Mouse-only. No element carried a `tabindex`, no focus styling, no roles and no labels. A coordinator without a working mouse could not use the tool at all, and a screen reader announced most of the interface as unlabelled generic boxes.
 
**WK2 v2.** Fully operable by keyboard, and correctly described to screen readers.
 
| Key | Behaviour |
|---|---|
| **Tab / Shift+Tab** | Move between controls. The first stop on the page is a **"Skip to main content"** link, hidden until focused. |
| **Enter / Space** | Activate the focused control — markers, zoom, filter chips, order rows, override buttons, review actions, header toggles. Space does not scroll the panel. |
| **Left / Right arrow** | Switch screen, from anywhere on the page. |
| **Home / End** | First or last tab, when a tab holds focus. |
| **Alt+1-4** (**Option+1-4** on Mac) | Jump straight to Map, Dispatch Order, Manual Review or Submit Image, including from inside a form field. |
| **?** | Open or close the shortcut panel. |
| **Esc** | Close the shortcut panel. |
 
Text fields are exempt — arrows, Space and Enter behave normally when typing latitude, longitude, capture time or notes.
 
**Discoverability.** A **⌨ KEYS ?** control in the header opens a **shortcut panel** listing every binding, grouped into Moving around, Acting and Help. It opens on click or on **?** from anywhere, closes on **Esc**, the ESC button or a backdrop click, holds focus while open, and returns focus to the KEYS control on close. The modifier is labelled **Option** on Mac and **Alt** elsewhere, detected at runtime rather than printing both.
 
**Screen-reader semantics.** The four tabs are a proper `tablist` with `aria-selected` and roving tabindex, so Tab enters the navigation once and lands on the current tab instead of cycling through all four; each screen is a `tabpanel` labelled by its tab; every clickable element reports as a `button`; the contrast control is a `switch` with `aria-checked`; the shortcut panel is a modal `dialog`; and the bare **+** / **−** zoom glyphs carry accessible names, since a symbol alone announces as nothing useful.
 
**Why.** No acceptance criterion or documented non-functional requirement covers input method directly, in either `[WK1]` or `[WK2]` — this was not a compliance-driven build. It's a usability decision made for the target-user context in the requirements: coordinators working at speed under load, where the keyboard is often faster than the mouse and a mouse may not be available in a field vehicle. It's also a baseline expectation for a tool intended for government or emergency-service deployment.
 
**Not yet done:** no screen-reader testing has been carried out, colour-contrast ratios have not been formally measured against WCAG AA in either theme, and the map's spatial information has no non-visual equivalent.
 
**Detail screen note:** it is reached from the map rather than being a fifth destination, so the Map tab stays selected while viewing an incident.
 
---
 
## 3. How the changes serve the core user requirements and needs
 
| User need / requirement | Source | How WK2 v2 serves it |
|---|---|---|
| **Need 1** — all reports in one place with locations | `[WK1]` | Unchanged in principle; the map now also holds them legibly at every zoom level, with clustering and no overlapping markers. |
| **Need 2** — severity understood at a glance by colour and number | `[WK1]` | Colour + number (WK1) now joined by marker size and an abbreviation chip. Three channels instead of two. |
| **Need 3** — automatic order of locations to attend | `[WK1]` | Unchanged rule (severity, then distance). The order now recalculates when a coordinator overrides a severity or assigns one manually. |
| **Need 4** — each severity tag describes why it sits at its level, for later justification | `[WK1]` | The largest change. Detected indicators, rubric level, numeric confidence, a source tag (AI / override / coordinator-assigned) and an exportable record line. |
| **Need 5** — no false results; unassessable images honestly presented | `[WK1]` | The Manual Review screen, the low-confidence banner, and the confidence threshold that decides routing. |
| **Need 6** — no ambiguous data passed to ground teams | `[WK1]` | Every incident now carries confidence, provenance and reasoning, and unclassified items are explicitly labelled as not on the dispatch order. |
| **FR1 / AC1** | `[WK1]` → **US1** `[WK2]` | Explicit four-state submission flow with confirmation before assessment. |
| **FR2 / AC2** | `[WK1]` → **US2, FR13** `[WK2]` | Automatic assessment retained; AC2.3 (tagging failure → manual assessment) now has a real destination; confidence score now a formal requirement. |
| **FR3 / AC3** | `[WK1]` → **US3** `[WK2]` | Report unchanged in structure; adds confidence, provenance and a record line matching stored values. |
| **FR4–FR7 / AC4–AC7** | `[WK1]` → **US4, US6, US7, FR15** `[WK2]` | Preserved. Deconfliction protects AC4.3 and AC5.3 and now has a numeric FR15 target; insertion-not-reload made explicit for AC7. |
| **FR8, FR9 / AC8, AC9** | `[WK1]` → **US8, US9** `[WK2]` | Order retained; reasoning rewritten per incident to reference actual indicators. |
| **FR10 / AC10** | `[WK1]` → **US10** `[WK2]` | Fully realised for the first time via Manual Review. |
| **NFR1, NFR2** — latency, accuracy | `[WK1]` | Not addressable in a UI-only prototype; no targets are claimed anywhere in the artifact. **Update `[WK2]`:** the refined doc now sets proposed targets — latency ≤ 2 min/image, precision ≥ 0.80, recall ≥ 0.75 — though the artifact itself still doesn't display or claim them, and these are team-proposed, not client-confirmed. |
| **NFR3** — no data loss | `[WK1]` | Not addressable in a UI-only prototype — there is no persistence/storage layer for this design pass to test against. *Not restated anywhere in the WK2 refined doc.* |
| **NFR4** — load tolerance (input spikes) | `[WK1]` | Not addressable in a UI-only prototype — this is an ingestion-tier concern (elastic image ingestion), outside the scope of this design pass. *Not restated by name anywhere in the WK2 refined doc.* |
| **NFR5** — graceful degradation | `[WK1]`, reaffirmed `[WK2]` §5 | Field-level errors and the "unable to assess" outcome (§2.1, §2.5) are versions of failing informatively rather than silently. The WK2 refined doc explicitly reaffirms this for input-spike edge cases. |
| **FR11 (multiple input methods)** | `[WK2]` — new | Not yet built. Prototype only demonstrates manual upload; drone/satellite/bulk-API submission are new WK2 scope. |
| **FR12 (incident grouping)** | `[WK2]` — new | Not yet built. No grouped-incident view or image-history UI exists yet. |
| **FR14 (override)** | `[WK2]` — new | Matches the built one-click override with undo (§2.3), with a pattern caveat — see §2.3 Why. |
| **FR16 (severity distinction target)** | `[WK2]` — new | Matches the abbreviation-chip/multi-channel encoding already built (§2.2); the 90%+ usability target hasn't been tested. |
 
---
 
## 4. How the changes reflect the UX research
 
**Problem 1 — Information overload.** *Partly addressed.* Filter chips (All / Sev 3–4 / Review), clustering at low zoom, and a single ranked queue reduce what a coordinator holds in their head. **Honest note:** the top bar still carries several separate modules (contrast toggle, notes toggle, live count, clock, user). Consolidating them was considered in the review pass and rejected, because the contrast and notes toggles are prototype-review controls rather than product chrome and are used constantly in review sessions. In a production build they would not be there. *(Aryaveer's pain-point table, §6 `[WK2]`, maps this problem to **FR3, FR6, FR8**.)*
 
**Problem 2 — Trust collapses on hard AI calls.** *Addressed.* Indicator chips, the rubric level, plain-language reasoning, and one-click override with undo. This is the research's stated requirement almost line for line: show the reasoning, and make override one action. *(Aryaveer's pain-point table maps this to **FR9, FR14** `[WK2]`.)*
 
**Problem 3 — "Cry wolf" alert fatigue and lack of severity differentiation.** *Addressed.* Severity is carried by colour, number, dot size and an abbreviation chip, so a Moderate and a Catastrophic do not look alike. The review pass also removed a blinking indicator dot from the header and the order screen — an animated element that carried no incident information, on a tool whose whole argument is that urgency should be earned. Nothing in the interface animates for attention now except a new incident's arrival pulse. *(Maps to **FR5, FR16** `[WK2]`.)*
 
**Problem 4 — Map clutter.** *Addressed.* Three-level zoom with clustering at the two wider levels, standardised symbols, and a collision pass that guarantees no marker is hidden by another marker or by fixed furniture. *(Maps to **FR4, FR15** `[WK2]`.)*
 
**Problem 5 — AI confidence must be honest.** *Addressed.* Numeric confidence on the map list, detail screen, order screen and review queue; a stated threshold (adjustable, default 60%); low-confidence cases routed to human review rather than force-classified; and the model's unapplied guess shown but explicitly excluded from ranking. *(Maps to **FR10, FR13** `[WK2]`.)*
 
**Problem 6 — Interoperability.** *Largely not addressed.* The detail screen includes an exportable record line showing the stored field values, which gestures at handing data to another system, but there is no real import or export, no multi-source ingest, and no agency-format output. This is out of scope for a UI prototype and is stated here rather than overclaimed. *(Maps to **FR1, FR11** `[WK2]` — FR11 in particular is not yet built; see §3.)*
 
**Accessibility.** Not one of the six research problems, and not covered by any documented AC or NFR in either `[WK1]` or `[WK2]`, but relevant to the same users: WK1 was mouse-only, WK2 v2 is fully operable by keyboard with a discoverable shortcut panel. Still outstanding — no screen-reader testing, no formal WCAG AA contrast measurement in either theme, and no non-visual equivalent for the map's spatial information. Stated rather than claimed as complete.
 
**Cross-cutting design principle** — "coordinators need to see what's most important, understand why the system thinks it's important, and be able to override it if they disagree, without drowning in noise." All three legs now exist as visible interface: severity weight, reasoning, and one-click override.
 
---
 
## 5. New vs. refined
 
**New in WK2 v2 (did not exist in WK1)**
- Manual Review screen, with review queue, non-classification reasoning, manual severity assignment, request-second-image and locate-on-map — closes **FR10** `[WK1]` → **US10** `[WK2]`
- Numeric confidence indicators (percentage + segment bar) and confidence bands — **FR13** `[WK2]`
- One-click severity override with undo, and provenance labelling (AI-classified / override / coordinator-assigned) — **FR14** `[WK2]` (pattern caveat, see §2.3)
- Detected-indicator chips tied to the rubric — **core user need 4** `[WK1]`
- Working map zoom with clustering, marker deconfliction, and an arrival pulse for new incidents — **FR15** `[WK2]`
- Map filter chips and a REVIEW row in the legend
- Four-state submission flow with an explicit pre-assessment confirmation — **AC1.3** `[WK1]` → **US1 AC2** `[WK2]`
- Exportable record line — **AC3.3** `[WK1]` → **US3 AC2** `[WK2]`
- Full keyboard operation: skip link, Enter/Space activation, arrow-key screen switching, Alt/Option+1-4 shortcuts, and a shortcut panel on **?**
- Screen-reader semantics: tablist, tabpanels, button roles, accessible names on icon-only controls
- Light/dark contrast toggle and the SP1 WK2 review-notes overlay
- Configurable confidence threshold and a second unassessable incident in the demo data
**Refined (existed in WK1, changed in WK2 v2)**
- Visual language: light web-app styling → dark operations console with a light theme; new type pairing; square corners
- Severity encoding: colour + number → colour + number + size + abbreviation chip — **AC5.1/5.2** `[WK1]` → **US5 AC1, FR16** `[WK2]`
- Detail screen reasoning card: "WHY THIS RANKING" → "WHY THIS SEVERITY", with indicators and provenance added
- Order screen "why this position": templated restatement of the sort rule → authored per-incident reasoning — **AC9.1/9.2** `[WK1]` → **US9 AC1** `[WK2]`
- Order screen: confidence column added; rank emphasis increased; abbreviation chip brought in line with the rest of the app
- Non-functional WK1 controls (zoom buttons, order-row action buttons, "flag for review") now actually do something
- Input: mouse-only → mouse and full keyboard, with screen-reader roles and labels
- Typography and consistency: collapsed to a single type scale across all five screens (36 size corrections, none of them reductions except the deliberate confidence-figure rebalance); legend dot sizes made proportional; detail header rebalanced so severity leads
- Header and order screen: blinking status-indicator dot removed (see §2.0, §2.4)
**Considered and rejected** (full reasoning in §2.2 and §2.4): a separate colour for the REVIEW state on the map; consolidating the header chrome; a full spacing-token rewrite (near-invisible, high regression risk in the map's position-sensitive overlays); comparative ranking text on the order screen; severity tier separators.
 
---
 
## 6. Items to possibly be addressed next
 
1. **No "dismiss / no fire present" outcome.** Neither **AC10** `[WK1]` nor **US10** `[WK2]` defines one, so Manual Review currently forces either a severity assignment or a second-image request. Raised for the BA.
2. **Confidence threshold value.** The prototype uses 60% as the auto-classify cut-off. This is a placeholder — **FR13** `[WK2]` sets a 100% catch-rate target (never miss a low-confidence case) but doesn't set the threshold percentage itself, and the WK1 requirements documents record that non-functional targets are still to be confirmed with the client.
3. **Accessibility verification.** Keyboard operation is done, but screen-reader testing and formal WCAG AA contrast measurement have not been performed. Not covered by an AC or NFR in either `[WK1]` or `[WK2]` doc. Worth agreeing whether the client expects a stated conformance level.
4. **Rubric Q1** `[WK1]`. Whether the four-level severity scale should align to an existing external standard (e.g. FEMA's Damage Assessment Manual, EMS-98, or the xView2 four-level Joint Damage Scale referenced in the UX research) or remain purpose-built, as originally raised by the BA in Sprint 1, Week 1. The WK2 refined doc doesn't address this question — its own open items (§8) are about incident-grouping method and metadata storage instead. Remains open and unaffected by these changes.