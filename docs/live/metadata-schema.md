# Metadata Schema and Storage

**Status:** Live. Mirrors `backend/src/metadata/schema.sql`. If this document and the SQL disagree, the SQL is right; fix this document.
**Owner:** Liam Robinson Hounsell (Dev 2)
**Last updated:** 2026-09-24
**Supersedes:** [Storage and metadata V2](../archive/sprint-1/storage/Storage_and_metadata_V2.md) §2, 4, 5 · [Finalisation addendum](../archive/sprint-1/storage/Storage_and_Metadata_Finalisation_Addendum.md) · [Original structure doc](../archive/sprint-1/storage/Storage_and_metadata_structure.md)

---

## 1. `images` table

One row per submitted image. An incident is a group of rows sharing `incident_id`.

| Column | Type | Meaning |
|---|---|---|
| `image_id` | UUID (v4), PK | The image |
| `incident_id` | UUID (v7, time-ordered) | Group of images of one event (auto-grouped, 2 km / 6 h) |
| `storage_path` | text | COS object key; null until stored |
| `timestamp` | timestamptz | Capture time (EXIF, or entered) |
| `source_type` | `drone` / `cctv` / `citizen` / `satellite` | Input channel |
| `latitude`, `longitude` | double | WGS84, inside the operating region |
| `severity_score` | int 1–4 | AI severity (never overwritten by a human) |
| `severity_score_override` | int 1–4 | Coordinator override; screens show this when set |
| `overridden_by`, `overridden_at` | text, timestamptz | Override audit |
| `confidence_score` | 0–1 | Lowest of the four indicator confidences |
| `severity_explanation` | text | Plain-language reason |
| `smoke_density` | enum | See [rubric](severity-rubric.md) |
| `flame_visibility` | enum | 〃 |
| `vegetation_impact` | enum | Amount of vegetation (named `_impact` for history) |
| `infrastructure_impact` | enum | Amount of infrastructure nearby (named `_impact` for symmetry) |
| `assessment_status` | `assessed` / `unable_to_assess` / `pending_review` | AI outcome, separate from upload status |
| `classification_label` | `fire` / `non_fire` / `extinguished` / `uncertain` | Lifecycle label |
| `priority_rank` | int | Dispatch order position; not computed yet |
| `upload_status` | `pending` / `stored` / `failed` | Storage write outcome |
| `ingestion_error` | text | Why a storage write failed |
| `content_hash` | text, unique | MD5 of the bytes, for exact-duplicate detection |

Indexes: `incident_id`, `(latitude, longitude)`, `priority_rank`.

Not yet in the schema, but required: a full override **history** (every change, not just the latest), and the separate gate confidence figure.

## 2. Migrations

- `schema.sql` is the only migration. It creates the table if missing and then runs re-runnable `ALTER`s that bring an older database up to date.
- Both CI (on every PR) and the deploy workflow run it against `DATABASE_URL`.
- **Caution: CI and prod currently share one database.** A schema change is applied to prod as soon as a PR opens, before the code that expects it is deployed. This broke live uploads on 2026-09-24, when a PR dropped `structure_people_proximity` while prod still wrote to it. Give CI its own database (for example a Neon branch) before the next schema change. See D-24.

## 3. Image storage

- **Service:** IBM Cloud Object Storage, bucket from `COS_BUCKET`, us cross-region endpoint.
- **Object key:** `<incident_id>/<source_type>/<timestamp>_<image_id>.<ext>`. Grouping by incident first lets one prefix query fetch every image of an incident.
- **Access:** only the API writes; clients read through signed, time-limited URLs from `GET /images/:id`. HMAC credentials live in the Code Engine secret and local `.env`, never in git.
- **Training data** uses a separate naming scheme, `<source_dataset>_<sequence>.<ext>` (for example `dfire_000123.jpg`), since training images have no real incident or capture time.
