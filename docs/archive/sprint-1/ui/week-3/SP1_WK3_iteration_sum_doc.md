> **Archived 2026-09-24.** Historical record, kept as written. Current version: [UI design](../../../../live/ui.md). Why things changed: [decision log](../../../../decisions/decision-log.md).

# Change Log — WK2 v2 → WK3

**Project:** EMBERA (Emergency Monitoring for Bushfire Evaluation, Response and Awareness)

**Client:** IBM · Naresh Olladapu (Technical Supervisor), Emily Chin (Non-Technical Supervisor)

**Artifacts:** `Bushfire Prototype Sprint 1 WK1.dc.html` · `Bushfire Prototype Sprint 1 WK2 v2.dc.html` · `Bushfire Prototype Sprint 1 WK3.dc.html` (all three kept inspectable)

**Requirement references** below are section numbers in *Final Sprint 1 AI Requirements, Acceptance Criteria & Traceability* (Aryaveer Singh, BA), plus FR/NFR codes from the Week 1 and Week 2 requirement documents.

---

## Phase 1 — Self-evaluation of WK2 v2 against the finalised WK3 requirements

| # | Area | Verdict | Reason |
|---|---|---|---|
| 1 | AI result display / fire–non-fire gate | **Not built yet** | WK2 had no classification gate and no three-way flag; statuses were Review / Manual / Dispatched / Awaiting, which mixed pipeline state with dispatch state. |
| 2 | Confidence threshold | **Needs updating** | Threshold was a 60% placeholder, shown as a percentage and adjustable down to 40%. |
| 3 | Severity display | **Needs updating** | One holistic AI tag plus indicator chips. No per-element sub-scores, no summed total, no band mapping. |
| 4 | Uncertain-result state | **Needs updating** | The flagged state was visually distinct from processed, but "dismissed" did not exist, so the three states could not be told apart. |
| 5 | Manual Review workflow | **Needs updating** | Supported one reviewer action (assign a severity). No "confirm the AI tag" (no AI tag was shown at all) and no "discard as not a fire". Flagging reason was present. |
| 6 | Dismiss / archive behaviour | **Not built yet** | No dismiss outcome and no archive or audit view. WK2 raised this as an open question for the BA. |
| 7 | Severity override | **Matches, one gap** | Immediate, one click, no confirmation, Undo present — correct. Missing: the ~5s auto-clearing toast (it persisted until dismissed) and the override log with original tag, new value, who and when. |
| 8 | Multiple-image input | **Not built yet** | Input source was not represented anywhere. |
| 9 | Incident grouping | **Needs updating** | Map clustering was zoom-based visual declutter only, with no auto-group proposal and no confirm or split action. |
| 10 | AI evidence / explanation | **Needs updating** | Plain-language summary, indicator chips, rubric level and provenance were strong, but the reasoning did not expose the scored elements it now derives from. |
| 11 | Accessibility & colour contrast | **Partly** | Focus styles, roles and accessible names present; contrast still not formally measured against WCAG AA in either theme. Carried forward unchanged. |
| 12 | Keyboard operability | **Matches** | Full keyboard operation with a discoverable shortcut panel. Extended to cover the new screens only. |
| 13 | Typography, spacing, consistency | **Matches** | IBM Plex pairing, single type scale, square corners, consistent severity chip treatment. Reused as-is. |

---

## Phase 2 — What changed in WK3

| Change | Requirement it satisfies |
|---|---|
| Detail screen now leads with a "How this severity was scored" block: Smoke level, Flame visibility, Damage/impact and People proximity each scored 1–4 on a visible four-cell scale with its rubric wording, summed to a total out of 16, with the 4–7 / 8–10 / 11–13 / 14–16 band scale shown and the active band marked. | §10, §2.4 — four-element severity model, exposed as the explainability mechanism rather than a tooltip. |
| A two-step pipeline strip above the scores states the fire / not-fire result and the severity-scoring result separately, each with its own outcome chip. | §2.1, §4 — classification gate runs before severity scoring. |
| Every image now carries exactly one of three flags — **Processed** (solid, neutral), **Flagged · review** (dashed, accent, "?" symbol), **Not a fire** (solid, faint) — shown on the detail header, the review queue and the archive. Dispatch state is shown separately so it no longer overwrites the pipeline flag. | §2.5 — three distinct states with distinct visual treatment. |
| Confidence is fixed at **0.75** and displayed as a decimal on every surface — map list, dispatch order, detail header, review queue, provisional-tag card and archive (0.92, 0.34) against a stated threshold. Prototype range narrowed to 50–95%. INC-0426 was re-seeded at 0.83 because its WK2 value of 0.71 would now be flagged. | §5, §6 — threshold fixed at 0.75, confidence always shown alongside the severity tag. |
| Manual Review rebuilt around three reviewer actions in one card: **Confirm the AI tag** (applies the provisional level, promotes to an incident), **Change the severity and promote** (four rubric levels), **Discard as not a fire**. A new "AI provisional tag" card shows the provisional level, its four element scores, the total and the confidence figure, all labelled as not applied. A "Reason for flagging" card states why the image was held. | §8 — reviewer sees image, AI tag, confidence and flagging reason; all three actions available. |
| New **Archive** screen (its own tab): dismissed images with location, input source, capture time, why dismissed, who decided and when, plus **Restore** back into the review queue. Dismissals from the gate and from a reviewer are recorded separately. Dismissed images are removed from the map, the dispatch order, the legend counts and the review queue. | §9 — removed from the active view, retained and retrievable for audit. |
| Override pattern verified against spec and left structurally unchanged. Two additions: the confirmation toast moved to the top right, clears itself after 5 seconds with a visible countdown, can be dismissed sooner with a ✕ on its corner, and offers **Undo**; and a **Decision log** on the detail screen records the original tag, the new value, who changed it and the timestamp for every override, manual assignment, confirmation, dismissal and restore. An override supersedes an earlier confirmation, so the provenance line and the log always credit the last decision made. | §11 — confirmed pattern, plus the required logging. |
| Input source recorded per image and surfaced as a chip on the map list, the dispatch order and the detail header (MANUAL / DRONE / SAT / API). The Submit screen shows all four methods converging into one pipeline rather than four submission UIs. | §1.1 / FR11. |
| Grouping proposal card in the map side panel: names the proposed group, states the proximity and time window, lists member images with their severity, and offers **Confirm as one incident** / **Keep separate** in one click. The state is mirrored on the detail screen with a **Split** action. Both directions remain reversible. | §12 / FR12 — hybrid auto-group with coordinator confirm or split. |
| Exportable record line extended to `sev= smoke= flame= damage= people= sum= conf= thr= lat/lng= t= flag= label= priority= group= src=`, and the detail screen's metadata block now shows Classification label (Fire / Non-Fire / Uncertain / Extinguished), Priority (rank in the dispatch order, or "not ranked") and Incident group ID alongside geotag, capture time and distance. Manual Review's metadata list carries the same three. | §13 — required metadata fields, and AC3.3 report data matching the stored record. |
| New demo path: **Demo: not-a-fire result** produces a gate dismissal end to end and lands in the Archive. | §4, §9 — demonstrable rather than pre-seeded. |
| Third prototype tweak added: grouping suggestions can be switched off. | Prototype control. |

### Late change — People proximity added to the score

The BA's finalised requirements document (§10) makes People proximity a fourth scored element. Implemented after the audit above:

| Change | Requirement |
|---|---|
| People proximity added as a fourth 1–4 element on every scoring surface — detail evidence block, Manual Review provisional tag, and the stored record. Its rubric wording is the client's: no people in range / visible at a distance / near the fire, evacuation required / direct proximity, immediate help required. | §10 |
| Total range changed from 3–12 to **4–16**, and the band mapping to **4–7 → Moderate (1), 8–10 → High (2), 11–13 → Extreme (3), 14–16 → Catastrophic (4)**. Seeded element scores were adjusted so every incident keeps its existing severity level under the new bands. | §10 |
| The "NOT SCORED — proximity to people is an open question with the BA" note was removed from the detail screen, and the Catastrophic rubric hint restored to include people in direct proximity. | §10 |

### Extinguished, dispatch tracking and Resolved (added after the audit)

| Change | Requirement |
|---|---|
| **Extinguished** added as a per-incident lifecycle state. Only an incident with a dispatched crew can be marked; the coordinator does so on the crew's report from the dispatch order or the detail screen. Marking is immediate, logged (who, when), shown as a 5-second toast with Undo, and reversible via **Reopen**. | §3 dataset label "Extinguished"; §11 decision pattern |
| **Resolved** screen (new tab beside Archive) lists extinguished fires with location, source, peak severity and score, when they were marked and by whom, with Reopen. Kept separate from the Archive because these were real incidents with response history, not dismissals. | §3 |
| Extinguished fires leave the map by default and appear under a new **Extinguished** map filter in a spent treatment (hollow dashed marker, "OUT" tag, reduced opacity), so burnt-out ground keeps its spatial context without competing with live incidents. Legend counts and grouping exclude them. | §3, FR4/FR15 |
| **Dispatch order** now splits into **Awaiting dispatch** (the ranked queue) and **Live / Dispatched** (crews assigned, with an Extinguished action per row). A three-way filter at the top — All / Awaiting / Live — shows either half alone so the page stays short. Detail-screen Priority reads "live · crew dispatched" or "resolved · not ranked" accordingly. | FR3 / FR6 / FR8; §13 priority field |
| Classification label on the record now includes `extinguished`; the Alerts panel gains a **Live crews** alert linking to the live half of the order. | §13 |

Open for the BA: the finalised doc lists Extinguished as a *model* label (§3), but the prototype has the coordinator set it on the crew's report. If the model is also expected to classify a later image as Extinguished, the two can disagree and the resolution rule is not yet specified.

### Later WK3 changes (after the Resolved screen)

| Change | Requirement |
|---|---|
| **Flagged images removed from the map.** Detections below the threshold, restored archive items and coordinator-sent items no longer appear as markers, in clusters, in the side-panel list, the map filters or the legend. They exist only in the Manual Review queue; the side panel carries a one-line pointer with the queue count. | §7 — "never shown as an incident on map" until approved, read literally |
| **Threshold boundary closed:** strictly below 0.75 is low confidence and routes to review; 0.75 and above is confirmed. | §6, §14 |
| **Send to manual review** (present but inert in WK2) now withdraws the applied AI tag (severity reads null), pulls the incident from the ranking, the map and any live dispatch, logs it, and lands the coordinator on the item in the review queue tagged "sent by coordinator" with the withdrawn tag and confidence named in the flagging reason. Undo restores the tag. For an already-flagged incident the button opens the queue instead. | §8 reviewer actions; §11 decision pattern |
| **Cancel dispatch** added beside Mark extinguished on the detail screen: stands the crew down, returns the incident to the ranked queue, logged, 5-second toast with Undo. Mark extinguished now sits inline with the other actions. | No requirement — coordinator workflow gap found in testing; follows the §11 decision pattern |
| **Live relative time.** "N min ago" advances with the clock across the map list, dispatch order, review queue, archive and detail screens; the dispatch order shows "captured HH:MM · N min ago" on every row so coordinators can tell recent from stale. | §14 — avoid ambiguous or stale status |
| **Restored not-a-fire items** no longer read "below 0.75 threshold". The review header says "Restored for re-check", and the confidence figure is labelled as confidence in the not-a-fire call with no severity confidence recorded. Review-queue rows carry a reason tag: below 0.75 / restored / sent by coordinator. | §5, §9 |
| Dispatch order and map side panel reserve their scrollbar gutter so content does not shift when a filter changes the list length. Six tabs fit at any pane width without hidden scrolling. | Visual consistency |

### Status at end of Week 3

Every Phase 1 item is closed except **item 11, accessibility and colour contrast**, it is carried to Sprint 2 to be designed against real data. Two items need the BA before they can be marked closed: the Extinguished label question below, and confirmation that §7's "never shown as an incident on map" is satisfied by removing flagged images from the map entirely (the reading applied here).

### Deliberately left open

- **NFR1 / NFR2** — no latency or accuracy figure appears anywhere in the interface. §14 of the finalised document confirms these remain team-proposed and untested.
- **The 0.75 threshold itself** is described in §6 as a team-proposed starting point. The interface states it as the current threshold without implying it is validated.
- **Override vs. regrouping** — not resolved. The map note states it is Sprint 2 backend work, and no screen implies an outcome.

### Unchanged from WK2 v2

Dark/light console shell, four-step severity ribbon, IBM Plex type scale, map zoom and marker deconfliction, filter chips, dispatch ranking rule and per-incident "why this position" text, submission flow states and field-level validation, keyboard model and shortcut panel (extended to six screens, Alt/Option+1–6).

### Carried to Sprint 2

- **§14 edge cases** — duplicate submissions not creating duplicate markers; a later image of the same incident with a different severity handled by grouping rather than as a new incident.
- **§1.3 low-quality images** — no seeded review item cites image quality as its flagging reason.
- **§4 low-confidence gate call** — an image where the model is unsure whether it is a fire at all is not distinctly represented from one that is a fire of uncertain severity.
- **Extinguished: model label or coordinator action** — §3 lists it as a dataset label; the prototype has the coordinator set it on the crew's report. The resolution rule when both exist is unspecified.
- **Accessibility** — no screen-reader testing, no formal WCAG AA contrast measurement in either theme, no non-visual equivalent for the map's spatial information.
