# Storage & Metadata Structure Documentation

**Task:** [INFRASTRUCTURE] - Configure Storage & Metadata Structure
**Project:** AI-Powered Bushfire Situational Awareness & Emergency Response (Team 8)
**Scope:** Infrastructure only. No upload feature or AI-analysis workflow implemented in this task.

---

## 1. Imagery Storage Service

**Service:** IBM Cloud Object Storage (COS)
**Status:** Configured

| Field | Value |
|---|---|
| Instance name | Cloud Object Storage-gb |
| Plan | Free plan |
| Resource group | team-8 |
| Visibility | Global |
| Status | Active |
| Region | Australia - Sydney (au-syd) |
| Bucket name | team-8 |

---

## 2. Initial Incident Metadata Fields

Every image or video object ingested into the pipeline is expected to carry a companion metadata record. These fields are designed to support the four screens the BA specified: Image Submission, Map Page, Incident Page, and Order Page.

| Field | Type | Description | Screen(s) it supports |
|---|---|---|---|
| `incident_id` | string (UUIDv7 or ULID) | Unique identifier grouping related detections at one location/event. Time-ordered so it sorts chronologically. | Map, Incident, Order |
| `image_id` | string (UUIDv4) | Unique identifier for the individual image/video object | Image Submission, Incident |
| `storage_path` | string | Full object key/path in COS where the file lives | Incident |
| `timestamp` | ISO 8601 datetime | When the image was captured or submitted | Image Submission, Incident |
| `source_type` | enum | `drone`, `cctv`, `citizen`, `satellite` | Image Submission, Incident |
| `latitude` / `longitude` | float (WGS84) | Geotagged location of the incident. Required before submission is accepted; user manually enters this if the image has no EXIF GPS data. | Map, Incident |
| `severity_score` | number or null | Output of the vision classifier (severity level 1 to 4 per the rubric), null until AI stage is built | Map, Incident, Order |
| `severity_explanation` | string or null | Human readable justification for the ranking, null until explainability stage is built | Incident |
| `assessment_status` | enum | `assessed`, `unable_to_assess`, `pending_review`. Tracks whether the AI could confidently tag the image, separate from whether the upload itself succeeded. Images marked `unable_to_assess` must remain visible for manual review and be visually distinct from tagged incidents. | Map, Incident |
| `priority_rank` | integer or null | Position in the dispatch order, null until prioritisation logic exists | Order |
| `upload_status` | enum | `pending`, `stored`, `failed` | Image Submission |
| `ingestion_error` | string or null | Populated if upload fails, supports the error state on Image Submission screen | Image Submission |

**Note:** `severity_score`, `severity_explanation`, and `priority_rank` are placeholders in this sprint. The schema reserves space for them so later phases (Core Build, Prioritisation) don't require a schema migration. `assessment_status` is included now (not a placeholder) since the Image Submission and Incident screens need to distinguish successfully tagged incidents from ones flagged for manual review from day one.

`hazard_type` was considered but removed. The approved scope is bushfire only (per the BA's requirements doc), so a hazard-type field isn't needed at this stage. It can be reintroduced later if the project scope expands beyond bushfires.

**ID generation approach:** `incident_id` and `image_id` are generated as UUIDs (UUIDv7 for incidents, so they sort chronologically; UUIDv4 for images), not derived from a hash of time and location. Hashing time+location risks collisions (two unrelated hazards near the same rounded coordinate/time) and is guessable if exposed in a URL or log. Location and timestamp are stored as their own fields instead, so they remain independently queryable. The separate question of when a new image should start a new incident versus attach to an existing one is a clustering/business-logic decision, not an ID-generation one, and is still open (see Data Assumptions).

---

## 3. Location / Geotag Requirements

- **Coordinate format:** WGS84 decimal degrees (latitude, longitude), matching what most mapping libraries (e.g. Leaflet, Mapbox, Google Maps) expect natively.
- **Primary source:** EXIF GPS metadata (and capture timestamp) extracted from uploaded images where available (drone and satellite imagery typically include this).
- **Required, with manual fallback:** Both location and timestamp are required fields before a submission is accepted, matching the BA's acceptance criteria. If EXIF data is missing (common for citizen/CCTV uploads), the user manually enters the location (e.g. map-pin selection) and timestamp on the Image Submission screen. The submission only proceeds once both are present, whether from EXIF or manual entry, so there's never a record without location/timestamp data.
- **Validation:** Coordinates should fall within a plausible bounding box for the operating region (to catch corrupted or nonsensical entries early) before being accepted.
- **Accuracy tolerance:** Not yet defined by the client. Confirmed in the BA's rubric doc that non-functional requirement targets are still pending client consultation, this is a genuinely open item, not something already answered elsewhere. Should be raised to the client alongside the other open questions.

---

## 4. Storage Structure for AI / Map Integration

Proposed object key convention in COS:

```
/<incident_id>/<source_type>/<timestamp>_<image_id>.<ext>
```

Example:
```
/inc-2026-0091/drone/2026-08-20T14-32-00_img-0007.jpg
```

**Rationale:**
- Grouping by `incident_id` first lets the severity map and Incident Page fetch all imagery for one location in a single prefix query.
- Sub-folder by `source_type` keeps citizen uploads, drone footage, and satellite tiles separable for later spike-load analysis (per the brief's ingestion-tier success criteria).
- Timestamp-prefixed filenames keep objects roughly chronological within a folder, useful for the Order Page's chronological fallback view.

Metadata records themselves are proposed to live separately from the raw imagery (e.g. a lightweight database or a parallel JSON index in COS), rather than being embedded in the image files, so the Map and Order pages can query metadata without repeatedly pulling large binary objects.

---

## 5. Access / Configuration Requirements

| Requirement | Detail |
|---|---|
| Auth method | IAM (with HMAC credentials generated for S3-compatible SDK access, e.g. `ibm_boto3`) |
| Credential storage | `.env` file or team secrets manager. Never committed to version control or shared in chat/docs. |
| Endpoint | Regional public endpoint for the bucket (documented internally, not duplicated in this file) |
| Roles needed by next dev | Read/write access to the bucket for the upload feature (Dev 1); read-only may be sufficient for the Map/Incident/Order screens if they only consume metadata plus signed URLs |
| Reservation constraints | Techzone environment has a 3 hour idle timeout and a fixed expiry window, worth re-checking before long build sessions |

---

## 6. Data Assumptions

- Images will primarily be PNG/JPEG, matching the field types the BA has defined. Video (drone/CCTV) format not yet finalised, assumed MP4 for now. Image reference is by direct file upload only, not by external URL, so `storage_path` always points to an object actually held in COS.
- Console uploads are capped at 200MB per object; larger drone/video files may need multipart upload via the API later.
- Not all citizen-submitted images will have EXIF geotags or embedded timestamps; the Image Submission screen must prompt for manual entry of whichever is missing before the submission is accepted. Location and timestamp are always required fields, either from EXIF or manual entry, never optional.
- `assessment_status` resolves the BA's open question (Q2) about needing an "Unable To Assess" category, this schema assumes yes and includes it from the start. Worth confirming with the team that this satisfies that open question rather than leaving it unresolved.
- `severity_score` and `priority_rank` are nullable until the Core Build and Prioritisation phases are complete; downstream UI (Map, Order pages) should handle nulls without breaking.
- One `incident_id` may aggregate many images over time; the exact rule for when a new incident is created vs. an existing one is updated is not yet defined and is an open question for the client/BA.
- **Rural connectivity:** many submission sites are expected to have slow or intermittent connections. The upload path should not assume fast, stable bandwidth. Recommended for the ingestion tier (weeks 6 to 8):
  - Client-side compression/downscaling before upload, tested against the minimum resolution watsonx.ai needs for reliable classification, not guessed
  - Resumable/chunked uploads (COS supports multipart upload) so a dropped connection does not force a full restart
  - Metadata sent ahead of the image itself, so the coordinator sees a pending pin on the map immediately while the image finishes uploading in the background
  - Full on-device AI classification was considered and ruled out as impractical (the vision model is too heavy for field devices); a lightweight on-device pre-filter to screen out unusable images before upload was considered as a possible later optimisation, not a sprint-1 commitment
- **Accuracy tolerance for geotag/coordinate validation** has not been confirmed as documented elsewhere. Check the BA's rubric and acceptance criteria doc first; if not covered there, raise it as an open question for the client rather than assuming a value.
