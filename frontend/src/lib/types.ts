/**
 * Two layers, deliberately kept separate:
 *
 * - `ApiIncidentRecord` mirrors the ingestion/classification contract documented in
 *   docs/storage/Storage_and_metadata_V2.md, docs/storage/Storage_and_Metadata_Finalisation_Addendum.md
 *   and docs/ai-ml/Dataset_Integration_Interface_for_Htet.md. This is the shape a real API
 *   response will actually have.
 * - `Incident` is the UI's view model: camelCase, pre-computed band/sum/status, everything a
 *   component needs to render without re-deriving it. `normalizeIncident()` in normalize.ts is
 *   the single seam between the two, so mock data and real API data flow through identical code.
 *
 * Fields the UX spec needs that the backend schema doesn't scope yet (decision log, toasts,
 * archive/resolved provenance, grouping, dispatch crew, review reasons) live only on `Incident`
 * / the store, each marked `// TODO(api)` at the point they'd eventually need a backend field.
 */

export type SourceType = "drone" | "cctv" | "citizen" | "satellite";

export type AssessmentStatus = "assessed" | "unable_to_assess" | "pending_review";

export type UploadStatus = "pending" | "stored" | "failed";

export type SmokeDensity =
  | "none_or_haze"
  | "moderate"
  | "dense_dark"
  | "very_dense_blocking_vision";

export type FlameVisibility =
  | "no_visible_flame"
  | "some_flame"
  | "visible_high_flames_and_embers"
  | "large_flame_wall_embers_everywhere";

export type VegetationImpact =
  | "none_at_risk"
  | "scorching"
  | "noticeable_impact"
  | "extensive_burnt_area";

export type StructurePeopleProximity =
  | "no_structure_at_risk"
  | "infrastructure_in_fire_line"
  | "extensive_infrastructure_damage_people_in_proximity";

export interface IndicatorReading<TValue extends string> {
  value: TValue;
  confidence: number; // 0-1, per-dimension confidence from the classification service
}

/** Wire shape: docs/storage/Storage_and_metadata_V2.md + Finalisation Addendum. */
export interface ApiIncidentRecord {
  incident_id: string;
  image_id: string;
  storage_path: string;
  timestamp: string; // ISO 8601
  source_type: SourceType;
  latitude: number;
  longitude: number;

  severity_score: number | null; // 1-4, AI output
  severity_score_override: number | null; // 1-4, coordinator override, takes effect when present
  overridden_by: string | null;
  overridden_at: string | null;

  severity_explanation: string | null;
  confidence_score: number | null; // 0-1, min() across the four indicator confidences

  assessment_status: AssessmentStatus;
  priority_rank: number | null;
  upload_status: UploadStatus;
  ingestion_error: string | null;

  smoke_density: SmokeDensity | null;
  flame_visibility: FlameVisibility | null;
  vegetation_impact: VegetationImpact | null;
  structure_people_proximity: StructurePeopleProximity | null;

  indicators?: {
    smoke_density: IndicatorReading<SmokeDensity>;
    flame_visibility: IndicatorReading<FlameVisibility>;
    vegetation_impact: IndicatorReading<VegetationImpact>;
    structure_people_proximity: IndicatorReading<StructurePeopleProximity>;
  } | null;
  model_version?: string | null;

  place: string; // human-readable location; not in the storage doc, needed for the UI (reverse geocode later)
}

export type SeverityBand = 1 | 2 | 3 | 4;

/** One of three mutually exclusive pipeline flags (redline "three distinct states"). */
export type PipelineFlag = "processed" | "flagged_review" | "not_a_fire";

/** Dispatch lifecycle, tracked separately from the pipeline flag. */
export type DispatchState = "unranked" | "awaiting" | "live" | "extinguished";

export type SeverityProvenance =
  | "ai_classified"
  | "ai_confirmed_by_coordinator"
  | "coordinator_assigned"
  | "coordinator_override"
  | "none";

export interface ElementScores {
  smoke: number | null;
  flame: number | null;
  damage: number | null; // vegetation_impact
  people: number | null; // structure_people_proximity
}

export interface DecisionLogEntry {
  id: string;
  incidentId: string;
  summary: string; // e.g. "Severity changed from Catastrophic (4) to Extreme (3)"
  who: string;
  whenIso: string;
}

export type ReviewReason =
  | "below_threshold"
  | "sent_by_coordinator"
  | "restored_not_fire"
  | "restored_discarded";

export type GroupState = "suggested" | "confirmed" | "kept_separate";

export interface IncidentGroup {
  id: string;
  memberIds: string[];
  state: GroupState;
  proximityKm: number;
  windowHours: number;
}

/** UI view model — what every component actually consumes. */
export interface Incident {
  id: string;
  place: string;
  coords: { lat: number; lng: number };
  capturedAtIso: string;
  distanceKm: number;
  source: SourceType;
  file: string;

  elements: ElementScores;
  sum: number | null; // 4-16, null when coordinator-assigned or not scored
  band: SeverityBand | 0; // 0 = no severity applied (flagged)
  confidence: number | null; // 0-1
  explanation: string | null;
  reasonBullets: string[];
  recommendedAction: string | null;
  modelVersion: string | null;

  provenance: SeverityProvenance;
  flag: PipelineFlag;
  dispatch: DispatchState;
  groupId: string | null;

  reviewReason: ReviewReason | null;
  reviewReasonNote: string | null;

  dismissedReason: string | null;
  dismissedBy: string | null;
  dismissedAtIso: string | null;

  extinguishedNote: string | null;
  extinguishedBy: string | null;
  extinguishedAtIso: string | null;
}
