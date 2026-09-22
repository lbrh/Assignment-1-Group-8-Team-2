import {
  bandFromSum,
  CONFIDENCE_THRESHOLD,
} from "@/lib/constants/severity";
import { distanceKm } from "@/lib/utils/geo";
import type {
  ApiIncidentRecord,
  ElementScores,
  FlameVisibility,
  Incident,
  PipelineFlag,
  ReviewReason,
  SeverityBand,
  SeverityProvenance,
  SmokeDensity,
  StructurePeopleProximity,
  VegetationImpact,
} from "@/lib/types";

/**
 * Enum label -> 1-4 ordinal lookup, per
 * docs/ai-ml/Dataset_Classes_Label_Proposal_for_Aryaveer.md. The wire format carries graded
 * enum values, not raw ints, so this table is what lets the UI reconstruct "scored 9 of 16"
 * style copy. If Aryaveer's sign-off changes the label set, this is the only place to update.
 */
const SMOKE_LEVEL: Record<SmokeDensity, number> = {
  none_or_haze: 1,
  moderate: 2,
  dense_dark: 3,
  very_dense_blocking_vision: 4,
};

const FLAME_LEVEL: Record<FlameVisibility, number> = {
  no_visible_flame: 1,
  some_flame: 2,
  visible_high_flames_and_embers: 3,
  large_flame_wall_embers_everywhere: 4,
};

const VEGETATION_LEVEL: Record<VegetationImpact, number> = {
  none_at_risk: 1,
  scorching: 2,
  noticeable_impact: 3,
  extensive_burnt_area: 4,
};

/**
 * The proposal doc flags this dimension's label set as a genuine gap: level 1 and level 2 read
 * as the same phrase ("no structure(s)...at risk"), so `no_structure_at_risk` is deliberately
 * ambiguous between bands 1 and 2 pending Aryaveer's sign-off. Until that's resolved, it's
 * treated as level 1 (the more conservative reading) rather than guessed.
 */
const STRUCTURE_PEOPLE_LEVEL: Record<StructurePeopleProximity, number> = {
  no_structure_at_risk: 1,
  infrastructure_in_fire_line: 3,
  extensive_infrastructure_damage_people_in_proximity: 4,
};

function elementsFrom(record: ApiIncidentRecord): ElementScores {
  return {
    smoke: record.smoke_density ? SMOKE_LEVEL[record.smoke_density] : null,
    flame: record.flame_visibility ? FLAME_LEVEL[record.flame_visibility] : null,
    damage: record.vegetation_impact ? VEGETATION_LEVEL[record.vegetation_impact] : null,
    people: record.structure_people_proximity
      ? STRUCTURE_PEOPLE_LEVEL[record.structure_people_proximity]
      : null,
  };
}

function sumOf(elements: ElementScores): number | null {
  const { smoke, flame, damage, people } = elements;
  if (smoke == null || flame == null || damage == null || people == null) return null;
  return smoke + flame + damage + people;
}

function provenanceOf(record: ApiIncidentRecord): SeverityProvenance {
  if (record.overridden_by) return "coordinator_override";
  // TODO(api): "confirmed by coordinator" vs "assigned manually" both currently collapse to
  // overridden_by/overridden_at on the wire; the UI distinguishes them via local review state
  // (see store: confirmedIds vs manuallyAssignedIds) until the schema grows a dedicated field.
  if (record.severity_score != null) return "ai_classified";
  return "none";
}

function flagOf(record: ApiIncidentRecord, isDiscarded: boolean): PipelineFlag {
  if (isDiscarded) return "not_a_fire";
  if (record.assessment_status === "unable_to_assess") return "flagged_review";
  return "processed";
}

function reviewReasonOf(record: ApiIncidentRecord): ReviewReason | null {
  if (record.assessment_status !== "unable_to_assess") return null;
  return "below_threshold";
}

export interface NormalizeOptions {
  /** Set true for images the coordinator (or the AI gate) has dismissed as not a fire. */
  discarded?: boolean;
  place?: string;
}

export function normalizeIncident(
  record: ApiIncidentRecord,
  opts: NormalizeOptions = {}
): Incident {
  const elements = elementsFrom(record);
  const sum = sumOf(elements);
  const flag = flagOf(record, Boolean(opts.discarded));
  const effectiveScore = record.severity_score_override ?? record.severity_score;
  // A flagged (below-threshold) image never gets an applied band — the indicator sum above is
  // only the AI's *provisional* read, shown on Manual Review's provisional-tag card but not
  // used for the map/ranking/status chip until a coordinator confirms, changes or discards it.
  const band: SeverityBand | 0 =
    flag === "flagged_review" ? 0 : effectiveScore ? (effectiveScore as SeverityBand) : sum ? bandFromSum(sum) : 0;

  return {
    id: record.incident_id,
    place: opts.place ?? record.place,
    coords: { lat: record.latitude, lng: record.longitude },
    capturedAtIso: record.timestamp,
    distanceKm: distanceKm({ lat: record.latitude, lng: record.longitude }),
    source: record.source_type,
    file: record.image_id,

    elements,
    sum,
    band,
    confidence: record.confidence_score,
    explanation: record.severity_explanation,
    reasonBullets: [],
    recommendedAction: null,
    modelVersion: record.model_version ?? null,

    provenance: provenanceOf(record),
    flag,
    dispatch: "unranked",
    groupId: null,

    reviewReason: reviewReasonOf(record),
    reviewReasonNote: null,

    dismissedReason: null,
    dismissedBy: null,
    dismissedAtIso: null,

    extinguishedNote: null,
    extinguishedBy: null,
    extinguishedAtIso: null,
  };
}

export function isBelowThreshold(confidence: number | null): boolean {
  return confidence == null ? false : confidence < CONFIDENCE_THRESHOLD;
}
