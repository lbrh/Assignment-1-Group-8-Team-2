> **Archived 2026-09-24.** Historical record, kept as written. Current version: [Metadata schema](../../../live/metadata-schema.md). Why things changed: [decision log](../../../decisions/decision-log.md).

# Storage & Metadata Structure: Finalisation Addendum

**Status:** DRAFT, addendum to `docs/Storage and metadata V2.md` (the current architecture doc, superseding the original `docs/Storage and metadata structure.MD`), not a replacement
**Purpose:** Closes out the two open architecture decisions the Week 2 requirements doc (`docs/requirements_Week2/Refine User Stories, Requirements & Traceability.md`, Section 8) flagged as PM raised and still unresolved, adds the schema fields needed for stories that doc already approved but the V2 metadata table has not caught up to yet, and covers the Sprint 1 checklist items for finalising the metadata schema, the storage approach, and the incident-to-image relationship and naming convention.

### The two PM-flagged open decisions: confirming and finalising

**Metadata storage: confirmed as A (database with images in object storage).** The Week 2 doc already recommends this, for exactly the reason that matters here, FR7/FR8/FR12 depend on querying across incidents (viewport range queries for the map, sort by `priority_rank` for the order page, grouping for incident clustering), which flat JSON records handle poorly at volume. This addendum confirms that recommendation rather than reopening it. One addition: `upload_status` and `assessment_status` need in place partial updates as an image moves through the pipeline, a further reason a real database is the right call over a JSON index, rewriting a whole JSON blob on every status change gets slower and riskier under concurrent writes exactly when the ingestion tier is under spike load. Specific database product is left as an infrastructure choice for whoever provisions it, this confirms the shape, not the vendor.

**Incident grouping: confirmed as C (hybrid, auto-group by default, coordinator can confirm or split).** The Week 2 doc's recommendation is sound, reuses the FR14 one click override pattern rather than inventing a new interaction, and matches documented emergency reporting system practice. This addendum adds the concrete auto grouping rule the "auto" half of the hybrid needs, since the Week 2 doc names the approach but not the specific window:

An incoming image auto-attaches to the most recent existing incident if, and only if, both hold:

- its geotag falls within a configurable radius (proposed starting point: 2 km) of that incident's most recent image, and
- its timestamp falls within a configurable window (proposed starting point: 6 hours) of that incident's most recent image's timestamp.

If more than one existing incident qualifies, auto-attach to the nearest by distance, then surface it to the coordinator per the hybrid model so they can split it out if the auto grouping was wrong. If none qualify, start a new incident. The 2 km/6 hour figures are a starting point, not calibrated, tune once there is a labelled or simulated incident stream to validate against during the Core Build phase (weeks 3 to 5).

This also directly satisfies two edge cases the Week 2 doc already lists but does not yet wire to a mechanism: "duplicate resubmission must not create a second incident" is handled by the same spatial-temporal check plus MD5-based exact-duplicate detection, the same approach planned for the training dataset quality check next sprint and worth building once so it can be reused at ingestion time too, and "two images of the same location disagree on severity" is handled by US12 AC2's existing most-recent/most-severe-wins rule, which the schema fields below make possible to implement.

### Metadata schema gaps found against the already-approved user stories

Cross-checking the V2 metadata table (`docs/Storage and metadata V2.md`, Section 2) against the Week 2 doc's already-approved user stories surfaces two gaps, fields the approved stories need that the current schema does not yet have a place for:

| Field                                                       | Type                                                         | Why it is needed                                                                                                                                                                                                                                                          | Story it closes |
| ----------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `confidence_score`                                          | number, nullable                                             | US2 AC1 requires severity level and a numeric confidence score together, and FR13 requires 100 percent of below threshold images routed to review, neither is possible without a stored confidence value distinct from `severity_score` itself                            | US2, FR13, US10 |
| `severity_score_override`, `overridden_by`, `overridden_at` | number nullable, string nullable, ISO 8601 datetime nullable | US13 requires a coordinator override that takes effect for the map/order pages going forward while the AI's original call is not discarded, needs two values (AI's and the effective one) plus an audit trail of who/when, not just overwriting `severity_score` in place | US13, FR14      |

Recommended handling: keep `severity_score` as the AI's own output, always, add `severity_score_override` as nullable, and have the Map/Incident/Order pages read `severity_score_override` when present and fall back to `severity_score` otherwise. This is the same pattern the schema already uses for other AI-dependent fields (store the raw value, let consuming screens handle the nullable case), so it is consistent with the existing design rather than a new pattern.

Also carried over from AI_Framework_and_Technical_Approach.md, once the recommended per indicator classification approach is adopted, four more fields are needed to carry the indicator flags that make `severity_explanation` and the FR9/US9 "reason referencing actual severity indicators" requirement possible:

| Field                        | Type           | Description                                                                                              |
| ---------------------------- | -------------- | -------------------------------------------------------------------------------------------------------- |
| `smoke_density`              | enum, nullable | One of the four levels proposed in `Dataset_Classes_Label_Proposal_for_Aryaveer.md`, null until assessed |
| `flame_visibility`           | enum, nullable | As above                                                                                                 |
| `vegetation_impact`          | enum, nullable | As above                                                                                                 |
| `structure_people_proximity` | enum, nullable | As above                                                                                                 |

### Naming convention

The object key convention already settled in `docs/Storage and metadata V2.md` (`/<incident_id>/<source_type>/<timestamp>_<image_id>.<ext>`) is confirmed as final, no change proposed, it already satisfies the query patterns the four screens need.

One addition worth stating explicitly: the offline labelled training dataset (see Dataset_Preprocessing_Requirements.md and Dataset_Classes_Label_Proposal_for_Aryaveer.md) will use a deliberately different naming convention, `<source_dataset>_<sequence>.<ext>` (for example `dfire_000123.jpg`), since training images are not tied to a real `incident_id` or capture timestamp the way live ingested images are. Worth confirming nobody assumes the two schemes should match.

### Cross-region note

`docs/Storage and metadata structure.MD` (the original, pre-V2 doc) provisioned Cloud Object Storage in `au-syd` (Sydney), bucket `team-8`. `docs/watsonx-Setup-Verification.md` provisioned the watsonx.ai Studio, Runtime and deployment space in `ca-tor` (Toronto).

One thing I want to confirm before treating `au-syd` as settled: `docs/Storage and metadata V2.md`, which is supposed to supersede the original storage doc, does not restate a COS region anywhere. I'm carrying the `au-syd` figure above over from the original doc on the assumption that the same bucket is still in use and V2 simply did not repeat the detail, I have not separately confirmed it against V2 itself. Worth a quick check that COS was not reprovisioned elsewhere when V2 was written, since a cross-region call is exactly the kind of thing that should not rest on an inherited assumption.

If `au-syd` is confirmed current, the region mismatch stands as originally flagged: the ingestion pipeline's storage write and its classification call sit in different IBM Cloud regions, worth a deliberate decision (consolidate into one region, or confirm cross region calls are acceptable for a capstone's latency target) rather than something that gets discovered as a bug during the Ingestion & Map phase (weeks 6 to 8) when the NFR1 latency target starts actually being measured.

### Still genuinely open, not resolved here

- Accuracy tolerance for geotag/coordinate validation, still needs client input per the original storage doc.
- Whether satellite tile inputs use the same visual rubric or a source specific scoring path, does not block this schema (the fields above are source agnostic) but affects what feeds them for `source_type: satellite`.
