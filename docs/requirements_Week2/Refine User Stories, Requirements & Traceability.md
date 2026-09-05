# Requirements Document

## Refine User Stories, Requirements & Traceability

**Project name:** AI-Powered Bushfire Situational Awareness & Emergency Response
**Client:** IBM
**Client representative:** Naresh Olladapu
**Team:** Team 8 (AI for Emergency & Environmental Response, Team B)
**Owner of Document:** Aryaveer Singh (BA)
**Preceding Documents:** `Define_Target_Users_&_Core_Requirements.md`, `Bushfire_Severity_Rubric_and_Acceptance_Criteria.md`
**Reference material:** UX Research findings (client pain point analysis)
**Sprint:** Sprint 1, Week 2

---

### 1. Purpose

Refines Sprint 1 requirements based on Week 1 findings, client feedback, and UX research. Covers multiple image input methods, refined user stories/ACs, assumptions and edge cases, pain point to requirement traceability, and clarified success criteria.

---

### 2. Client Feedback Addressed

- **Latency/accuracy:** client asked us to propose and justify our own targets. (Section 7).
- **Input methods:** system must support multiple image input methods, not assume one, e.g. URL only. (Section 3)
- **Storage:** Client confirmed we can use an alternative storage provider where needed. Removes a vendor constraint on the decision. (Section 8)
- **Show reasoning, not just outputs:** All targets and recommendations have a justification and traces every requirement to the pain point it addresses. (Section 6,7,8)

**PM Feedback/Flag** – PM flagged that how multiple submissions get grouped under one incident id, and whether the metadata sits in a database or JSON alongside object storage.

---

### 3. Multiple Image Input Methods

Week 1 doc only specified how "users can attach images" (FR1). UX research (Problem 6, interoperability) shows coordinators lose time when data arrives through disconnected channels.

| Input Method | User | Notes |
| --- | --- | --- |
| Manual upload (web/mobile) | Primary & secondary users | Baseline from Week 1, FR1 |
| Drone/aerial feed | Coordinators (simulated) | Multiple images per location, would require systematic grouping (Section 8) |
| Satellite feed | System ingested (simulated) | Matches Week 1 "satellite or user" mention |
| Bulk/API submission | Partner agencies, simulated | (UX Problem 6) |

All four converge on the same pipeline which changes what FR1 accepts as input.

---

### 4. Refined User Stories & Acceptance Criteria

FR1 - FR10 restated as stories with ACs extended per UX findings. FR11 - FR16 are new, covering gaps the research surfaced.

**US1 (FR1) Submit geotagged imagery** - As a field responder/ingestion source, I want to submit an image with geotag and timestamp through any supported method, so the system has location/time context.
- AC1. Accepts latitude/longitude + timestamp via any of the 4 methods, rejects with a clear message if either is missing.
- AC2. Successful attachment is confirmed before AI processing begins.

**US2 (FR2, FR13) AI tagging with honest confidence** - As a coordinator, I want every image auto-tagged with severity level and a confidence score, so I know how much to trust it.
- AC1. Every submission is processed automatically and severity level + numeric confidence score returned together.
- AC2. Below threshold confidence routes to manual review instead of auto-tagging.

**US3 (FR3) Detailed incident report** - As a coordinator, I want a report with key facts at the top, so I can assess an incident immediately.
- AC1. Report generated per incident, with location/severity/confidence/time/status appearing at the top.
- AC2. Report data matches the stored incident record.

**US4 (FR4, FR15) Clustered map markers** - As a coordinator, I want markers grouped instead of overlapping each other, so I can read the map clearly.
- AC1. Every located incident appears as a marker, overlapping/nearby detections cluster at default zoom.
- AC2. Clusters expand to individual markers on zooming in, no incidents should be missing from the map.

**US5 (FR5, FR16) Severity distinguishable** - As a coordinator, I want different severity incidents to look different, so alerts don't blur together.
- AC1. Colour/size/visual weight scales with severity, each severity level is clearly distinct.
- AC2. User can identify severity from the map alone, without opening the marker.

**US6 (FR6, FR9) Explainable detail on click** - As a coordinator, I want to see why a marker was tagged that way, so I can trust or challenge it.
- AC1. On clicking a tag/marker it opens the report, including the specific evidence behind the tag.
- AC2. Opens without noticeable delay.

**US7 (FR7) Persistent, live-updating map** - As a coordinator, I want older incidents retained while new ones stream in, so I keep full situational awareness.
- AC1. Prior incidents stay visible when new ones are added, without a full page reload.
- AC2. No duplicated or lost markers on update.

**US8 (FR8) Prioritised operation order** - As a coordinator, I want incidents auto ordered by severity and location, so I don't have to build a manual plan under time pressure.
- AC1. Ordered by severity (most severe first), then proximity and updates automatically as incidents change.
- AC2. Order is visible as a separately viewable list.

**US9 (FR9) Ranking Justification** - As a coordinator, I want to see why one incident ranks above another, so I can trust and understand the plan and catch mistakes if present.
- AC1. Each ranked incident includes a stated reason, referencing actual severity indicators.
- AC2. Understandable without seeing raw AI output.

**US10 (FR10) Manual review queue** - As a coordinator, I want low confidence images flagged for review, so that an unsure AI review never becomes an unquestioned final decision.
- AC1. Below-threshold images are flagged, not tagged, and remain visible (not discarded).
- AC2. They are visually distinguishable from successfully tagged incidents.

**US11 (FR11, new) Multiple input methods** - As a system, I want to accept images from all 4 methods, so no agency's data is excluded by format.
- AC1. All 4 methods submit successfully into the same pipeline, normalised to one schema. (section 3)

**US12 (FR12, new) Incident grouping** - As a coordinator, I want images of the same event grouped under one incident, so I see one evolving picture, not duplicates.
- AC1. Images for the same location within an agreed time/distance window share an incident id. (Section 8)
- AC2. Displayed severity reflects the most recent/most severe image, full history of images remains available.

**US13 (FR14, new) Override** - As a coordinator, I want to override an AI severity/priority in a go, so I stay in control.
- AC1. Override takes one click confirmation, logged with who/when, without discarding the AI's original call.
- AC2. Overridden value drives the map marker and operation order going forward.

---

### 5. Assumptions and Edge Cases

**Assumptions (extends Week 1):**
- No live/real datasets, all simulated.
- Continuous IBM services access (e.g. watsonx.ai) required.
- AI's reliability at distinguishing rubric levels from a single image is unvalidated.
- Section 7 targets are estimates, not client confirmed.
- Section 8 decisions are open and may change the data model.

**Edge cases:**
- Two images of the same location disagree on severity (resolved US12 AC2, most recent/severe wins and history is kept).
- Corrupted/unreadable file with a valid geotag fails like a missing geotag case (US1 AC1).
- Duplicate resubmission must not create a second incident.
- Confidence sits exactly at the review threshold, default to manual review.
- Coordinator override - if a new image with a different AI severity arrives override persists until explicitly cleared.
- Simultaneous submission spikes on a bad fire day (many images arriving in the same short window) should not cause the system to crash, freeze, or silently drop incidents. Per Week 1 NFR5, the system should instead slow down predictably under load.
- Secondary users must always see the current (overridden) status, never a stale, outdated AI tag (Week 1 core need 6).

---

### 6. Pain Point to Requirement, Requirement to Feature

| # | Pain Points | Requirements | Feature | Success Criteria |
| --- | --- | --- | --- | --- |
| 1 | Information overload, tunnel vision risk | FR3, FR6, FR8 | Auto sorted report + prioritised list | Top priority incident identifiable without manual scanning. |
| 2 | Automated rankings distrusted in hard cases | FR9, FR14 | Explainable ranking + one click overrides | Reason shown on click and override in one action |
| 3 | System sends too many similar looking alerts, so people stop paying attention to any of them, including the ones that matter | FR5, FR16 | Distinct severity colour and size scale | Severity identifiable from map alone in usability testing |
| 4 | Map clutter under pressure | FR4, FR15 | Marker clustering, zoom based expansion | 0 overlapping markers at default zoom |
| 5 | AI confidence hidden/overblown | FR10, FR13 | Confidence score + review queue | Under threshold images auto routed to review |
| 6 | Systems don't talk to each other | FR1, FR11 | Multiple ingestion channels, one pipeline | ≥3 input channels processed without manual reformatting |

---

### 7. Success Criteria (Latency & Accuracy)

| Requirement | Metric | Target | Justification |
| --- | --- | --- | --- |
| NFR1: Latency | Time from when an image is submitted to when a severity tag is returned | 2 minutes or less per image | Scaled down from the Rolling Fork case study, where a full satellite scene (many buildings) processed in under 2 hours, a single image should be much faster. Commercial single image classification APIs typically respond in well under a minute, so this target is deliberately generous. It remains untested until real data or model access is available. |
| NFR2: Accuracy | How often the AI's severity classification matches a labelled test set (precision and recall) | Precision of 0.80 or higher, recall of 0.75 or higher | Set slightly below the Rolling Fork workflow's 0.86/0.80, to account for our smaller, simulated dataset and an as-yet unvalidated four level severity rubric. |
| FR13: Confidence honesty | The percentage of low-confidence images that are correctly sent to manual review instead of being auto-tagged | 100% | Required by UX research Problem 5. Even one missed low-confidence case defeats the purpose of having a review queue at all. |
| FR14: Override | How many steps it takes a coordinator to override an AI-assigned severity or priority | One click plus a confirmation step | Required by UX research Problem 2. The dispatcher-trust study found reliance on automated rankings dropped sharply whenever overriding them was slow or difficult. |
| FR15: Map clarity | Number of overlapping markers visible on the map at the default zoom level | Zero | Required directly by UX research Problem 4 (map clutter making incidents hard to read under pressure). |
| FR5/FR16: Severity distinction | How often a user can correctly identify an incident's severity from its colour and size alone, without opening it | 90% or higher in usability testing | Required by UX research Problem 3 (alert fatigue), which showed that alerts which all look alike get ignored, including the important ones. |

All the targets above are proposed by the team, not confirmed by the client, since the client asked us to define and justify our own numbers. They should be reviewed with the client once real test data or model access becomes available.

---

### 8. Open Architecture Decisions (PM-flagged, unresolved)

**Incident grouping (`incident_id`):** Options are (A) auto-group by spatial + time window, (B) fully manual coordinator confirmation, or (C) hybrid, which is auto group by default, prompt coordinator to confirm/split.

**Recommended: C**, since it reuses the one-click override pattern already required by FR14. Grouping by location proximity, time proximity, and incident type is a documented pattern in emergency-reporting system design, and associating new reports with existing incidents (rather than listing every report separately) is specifically used to prevent decision-makers from being overwhelmed by redundant data.

**Metadata storage:** Options are (A) database with images in object storage, or (B) JSON records alongside object storage.

**Recommended: A (database)**, since FR7/FR8/FR12 depend on querying across incidents, which flat JSON files handle poorly at volume. Object storage vendor is flexible per client confirmation; this doesn't affect the recommendation.

Both remain open - Dev should confirm before Sprint 1 build begins.

---

### 9. References

- Wildfire severity classification speed (PyroFocus)
https://arxiv.org/pdf/2512.03257

- Real-time fire/smoke detection accuracy and speed on edge hardware
https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12567645/

- IRWIN, the real US wildfire incident data-sharing system
https://www.nifc.gov/programs/information-technology

- WildfireVLM system architecture (uses a database for metadata)
https://arxiv.org/abs/2602.13305

- AWS guide on JSON storage inside a database
https://aws.amazon.com/blogs/database/postgresql-as-a-json-database-advanced-patterns-and-best-practices/

- Flat-file storage vs. database comparison
https://planergy.com/blog/flat-file/
