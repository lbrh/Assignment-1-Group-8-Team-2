# Sprint 2 Prototype Summary — WK1 → WK2 v2

What changed, why, and what's still open. Full technical detail lives in the document (`SP1_WK2_notes.md`) if anything here needs digging into further.

**Labels:** `[WK1]` = original requirements docs. `[WK2]` = Aryaveer's refined Week 2 doc.

---

## What changed, screen by screen

For each change: the requirement or research finding it's tied to, what that requirement/finding actually says, and how the prototype addresses it.

### Overall shell

| Requirement / problem | What it says | How it's addressed |
|---|---|---|
| **AC10.2** `[WK1]` → **US10 AC1** `[WK2]` | Flagged/unassessable images must remain visible to the user, not be discarded | New Manual Review tab gives them a permanent, always-visible home instead of a one-off notification |
| **Problem 3** (UX research) | Alerts that all look and feel urgent train people to ignore the real ones | Removed a blinking status dot that flashed regardless of whether anything had actually changed |
| *No formal requirement* | — | Dark control-room styling, light-mode option, and full keyboard operation are usability decisions, not requirement-driven |

### Image submission

| Requirement / problem | What it says | How it's addressed |
|---|---|---|
| **AC1.3** `[WK1]` → **US1 AC2** `[WK2]` | A successful attachment must be confirmed to the user before AI processing begins | New four-step progress panel (attach → geotag → confirmed → AI running) shows confirmation as its own explicit step, before processing starts |
| **AC1.2** `[WK1]` → **US1 AC1** `[WK2]` | Submission is rejected with a clear message if geotag or timestamp is missing | Field-level error messages now appear directly under the problem field, in addition to the existing top banner |
| **NFR5** `[WK1]`, reaffirmed `[WK2]` §5 | System should degrade in a smooth, informative manner rather than failing immediately and silently | Same field-level errors — a rejected submission tells the user exactly what's wrong instead of just failing |
| **AC7.2** `[WK1]` → **US7 AC1** `[WK2]` | New incidents appear without requiring a full page reload | Processing copy now explicitly states the result is inserted onto the map, not reloaded |
| **AC2.3** `[WK1]` → **US2 AC2** `[WK2]` | If tagging fails / confidence is below threshold, the image is sent for manual assessment | New demo path shows a low-confidence submission routing straight to Manual Review instead of getting a false severity tag |

### Map

| Requirement / problem | What it says | How it's addressed |
|---|---|---|
| **AC4.3** `[WK1]` → **US4 AC2** `[WK2]` | No successfully processed incident is missing from the map | Marker overlap removed at every zoom level — verified zero overlaps |
| **AC5.3** `[WK1]` → **US5 AC2** `[WK2]` | A user can identify severity from the map alone, without opening the marker | Severity now shown via colour, size, and a text tag together, not colour alone |
| **FR15** `[WK2]` | Zero overlapping markers visible at default zoom (numeric target) | Same overlap-removal work above already meets this target |
| **Problem 4** (UX research) | Overlapping map symbols become unreadable clutter under pressure | Zoom now clusters nearby detections instead of showing every marker at once, expanding to detail as you zoom in |
| **AC5.1/5.2** `[WK1]` → **US5 AC1** `[WK2]` | Each marker shows a severity number and matching colour; each level is visually distinct | Added a third channel — a text abbreviation chip (MOD/HIGH/EXT/CAT) — alongside colour and number |
| **FR16** `[WK2]` | 90%+ correct severity identification from colour/size alone, in usability testing | Same multi-channel severity encoding targets this directly; not yet tested against real users |
| **Problem 3** (UX research) | Alerts that all look alike get ignored, including the ones that matter | Same three-channel severity distinction is the direct response |
| **AC10.3** `[WK1]` → **US10 AC2** `[WK2]` | Flagged images must be clearly distinguishable from successfully tagged incidents | New REVIEW row added to the map legend with its own marker treatment (dashed "?" symbol) |
| **Problem 1** (UX research) | Coordinators are drowning in data during major incidents, causing tunnel vision | New filter chips (All / Sev 3–4 / Review) let a coordinator narrow the map to what they're actually working on |

### Incident detail

| Requirement / problem | What it says | How it's addressed |
|---|---|---|
| **Problem 2** (UX research) | Automated rankings get abandoned by users in complex or high-stakes cases (41% drop in reliance in the cited dispatcher study) unless reasoning is visible and override is easy | New indicator chips show the specific evidence behind a severity call, plus a one-click override control |
| **Problem 5** (UX research) | AI confidence must be shown honestly — not hidden, not overblown | New numeric confidence score, band label, and visual bar shown directly in the header, next to the result |
| **FR13** `[WK2]` | Severity level and a numeric confidence score must be returned together | Confidence block sits directly alongside the severity result, not buried or separate |
| **FR14** `[WK2]` | Override should take one click plus a confirmation step, logged with who made the change and when | Built as one click plus an **Undo** action instead of a confirm-before step. *Worth checking with Aryaveer whether this satisfies the intent — Undo is arguably easier to use, which is what Problem 2 asks for, but it's technically a different pattern from what FR14 describes.* |
| **Core user need 4** `[WK1]` | Each severity tag should describe itself and why it's tagged at that level | New source tag (AI-classified / coordinator override / coordinator-assigned) records who made the final call, for later justification |
| **AC3.3** `[WK1]` → **US3 AC2** `[WK2]` | Report data matches exactly what's stored in the incident record | New exportable RECORD line shows the literal stored field values |

### Dispatch order

| Requirement / problem | What it says | How it's addressed |
|---|---|---|
| **AC9.1 + AC9.2** `[WK1]` → **US9 AC1** `[WK2]` | Each ranked incident includes a stated reason for its position, referencing the actual severity indicators behind it | "Why this position" text is now written specifically for each incident (e.g. citing occupied dwellings, egress routes) instead of a generic template restating the sort order |
| **AC10.1** `[WK1]` → **US10 AC1** `[WK2]`, and **Problem 5** | Confidence must be visible; low-confidence items must never be force-classified | Confidence column added; unclassified rows carry a footnote stating they're never force-classified |
| *No formal requirement* | — | Rank number enlarged to be the clearest element on the row, since ranking is the whole point of this screen — a design-quality fix, not requirement-driven |

### Manual Review — new screen

| Requirement / problem | What it says | How it's addressed |
|---|---|---|
| **AC10.1** `[WK1]` | Flagged rather than given a false severity tag | Screen never auto-assigns severity to a low-confidence image — it sits in a review queue instead |
| **AC10.2** `[WK1]` | Remains visible to the user | Review queue is a permanent, browsable list, not a one-off notification |
| **AC10.3** `[WK1]` | Clearly distinguishable from successfully tagged incidents | Hatched, dashed "Unable to assess" banner styled so it can't be mistaken for a real classification |
| **US10 AC1 + AC2** `[WK2]` | Combines all three points above into one requirement | Same screen satisfies both |
| **Core user need 5** `[WK1]` | Unassessable images should be honestly presented for manual assessment, not falsely processed | Screen states exactly why the AI couldn't classify the image (smoke, blur, backlighting) instead of a generic "failed" message |
| **Problem 5** (UX research) | Route uncertain cases to a human instead of forcing a guess | Same honesty principle — this screen is that human-review destination |
| **Rubric Q2** `[WK1]` | Open question from Sprint 1: "Do we need an Unable to Assess category?" | This screen is the answer — yes, and this is what it looks like |

---

## Why these changes were made

Every change traces back to either a documented requirement or a real research finding — nothing changed just for looks.

The UX research identified six real coordinator problems: information overload, distrust of AI on hard cases, alert fatigue, map clutter, hidden AI confidence, and disconnected systems. WK2 v2 directly addresses five of the six. The sixth — different agencies' systems talking to each other — is out of scope for a UI-only prototype.

Aryaveer's WK2 refined requirements independently confirm this direction: FR13, FR14, FR15 and FR16 (confidence, override, map clarity, severity distinction) match almost exactly what was already being built toward.

---

## What's still open

1. **No "not a fire" outcome yet** on Manual Review — needs a decision from the BA.
2. **Confidence threshold (60%) is a placeholder**, not client-approved.
3. **Override uses undo, not a confirm step** — the WK2 requirement technically asks for a confirm step; worth checking whether undo is an acceptable substitute, since a confirm step adds friction the UX research specifically warns against.
4. **Accessibility hasn't been tested** with a screen reader or measured for colour contrast yet.
5. **Rubric Q1** — whether to use a custom severity scale or an existing standard — is still unresolved and untouched by this sprint.
