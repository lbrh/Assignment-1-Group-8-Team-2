# Technical Assumptions and Limitations

**Status:** DRAFT, consolidates assumptions and limitations from every document I've put together this sprint, plus what was already recorded in the BA's rubric doc and the Week 1/2 requirements docs, into one place
**Purpose:** Sprint 1 checklist item. Nothing here is new content invented for this document, it is a single reference gathering what each individual document already states, so the team has one place to check rather than five.

### Framework and modelling assumptions

- The AI framework recommendation (indicator classifiers plus a rule engine) assumes the four indicator dimensions derived from the rubric are learnable from image content at all, an assumption the rubric doc itself already flags as unvalidated ("assuming that AI can distinguish the four levels is yet to be validated").
- Assumes a single static image is sufficient evidence for each indicator, also already flagged as unvalidated in the rubric doc ("severity judged by a single image yet to be tested").
- Assumes the recommended CPU sized backbones (MobileNetV3/EfficientNet-Lite class) reach the NFR2 targets (precision >= 0.80, recall >= 0.75). Not yet tested, since it depends on the labelled dataset that does not exist yet, this is the explicit purpose of the Core Build phase's batch evaluation milestone.
- Assumes `confidence_score` as the minimum across the four indicator confidences is a reasonable aggregation. This is a design choice, not a validated one, worth revisiting once real confidence distributions are observed.
- The rubric itself is not aligned to an official severity standard (already stated in the BA's rubric doc), and the `structure_people_proximity` dimension currently reads identically for the Moderate and High levels, flagged to Aryaveer as a possible gap rather than resolved unilaterally.

### Dataset assumptions and limitations

- No public dataset provides the four level severity taxonomy directly, both FlameVision and D-Fire are fire/smoke presence datasets, not severity datasets, and neither covers vegetation impact or structure/people proximity at all. Manual labelling of a stratified subset is required regardless of framework choice.
- The source datasets likely skew toward clear, obvious fire scenes relative to the ambiguous middle of the rubric, since they were built for fire detection, not severity grading. Addressed partially by stratified splitting, not eliminated by it.
- Both datasets are now downloaded. Not a licensing issue either way, both are public and free to use. See Dataset_Acquisition_Status.md.
- Quality checking (corrupt file, exact duplicate, near duplicate detection) hasn't been built yet, that's scheduled for Sprint 2 alongside organising and labelling.

### Storage and metadata assumptions and limitations

- Geotag/coordinate accuracy tolerance is not defined by the client, a genuinely open item across every version of the storage documentation, not something the team can resolve unilaterally.
- Whether satellite tile inputs need a source specific scoring path rather than the shared visual rubric is unresolved, noted as not blocking the current schema (the indicator and severity fields are source agnostic) but affecting what populates them for `source_type: satellite`.
- The incident clustering thresholds I'm proposing here (2 km, 6 hours) are explicitly a starting point requiring calibration once real or simulated incident streams exist, not a final tuned value.
- Cloud Object Storage was provisioned in `au-syd` per the original, pre-V2 storage doc, while the watsonx.ai Runtime deployment space was provisioned in `ca-tor`. The region mismatch itself has not yet been deliberately resolved (consolidate, or accept the cross region call). I'm carrying the `au-syd` figure over from the superseded doc rather than confirming it against the current `docs/Storage and metadata V2.md`, which does not restate a region, worth me double-checking it has not changed, see Storage_and_Metadata_Finalisation_Addendum.md.
- Video (drone/CCTV) storage format is not yet finalised, assumed MP4, and frame extraction for classification is explicitly out of scope for Sprint 1.

### Requirements assumptions carried from the Week 1/2 requirements docs

- No access to live or real emergency data, everything is simulated, and integration with real Australian emergency services is out of scope for this project.
- The project requires continuous access to IBM services to run, there is no offline or degraded mode without watsonx.ai/IBM Cloud availability.
- The latency (2 minutes) and accuracy (precision >= 0.80, recall >= 0.75) targets are the team's own proposed numbers, not client confirmed, and are explicitly flagged in the Week 2 doc as needing review once real test data or model access exists.
- Techzone/IBM Cloud sandbox reservation constraints (3 hour idle timeout, fixed expiry window) apply to any long build or evaluation session and are not a one time setup concern.

### Integration assumptions

- The proposed ingestion-to-classification interface (Dataset_Integration_Interface_for_Htet.md) assumes the classification service can fetch images via signed URL rather than receiving image bytes inline, consistent with the existing security design, but not yet confirmed with Htet.
- Whether the call between ingestion and classification is synchronous or asynchronous is not yet decided, and materially affects both sides' error handling, flagged as an open item for Htet rather than assumed in either direction here.
