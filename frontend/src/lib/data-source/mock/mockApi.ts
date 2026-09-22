import { normalizeIncident } from "@/lib/normalize";
import type { ApiIncidentRecord, Incident, SeverityBand, SourceType } from "@/lib/types";
import { seedDecisionLog, seedGroup, seedOverlay, seedRecords } from "./seed";

const LATENCY_MS = 350;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/**
 * listIncidents()/getIncident()/submitImage() mirror the documented ingestion API shape
 * (ApiIncidentRecord) and go through the same normalizeIncident() a real fetch response would.
 * Everything below that — confirm/change/discard/override/dispatch/extinguish/... — has no
 * backend endpoint documented yet (see the plan's "schema gap" list), so these simulate a
 * plausible response shape for the store to apply; swapping them for real calls later is
 * additive once those endpoints exist, not a rewrite.
 */
export async function listIncidents(): Promise<Incident[]> {
  const incidents = seedRecords.map((record) => {
    const overlay = seedOverlay[record.incident_id];
    return normalizeIncident(record, { discarded: overlay?.discarded });
  });
  return delay(incidents);
}

export async function getIncident(id: string): Promise<Incident | null> {
  const record = seedRecords.find((r) => r.incident_id === id) ?? null;
  if (!record) return delay(null);
  const overlay = seedOverlay[record.incident_id];
  return delay(normalizeIncident(record, { discarded: overlay?.discarded }));
}

export interface SubmitImagePayload {
  fileName: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  sourceType: SourceType;
  notes?: string;
  /** Demo-only hook so the four "Demo:" buttons on Submit can force a specific outcome. */
  demoOutcome?: "valid" | "low_confidence" | "not_fire";
}

let submitCounter = 2292;

export async function submitImage(payload: SubmitImagePayload): Promise<{
  ref: string;
  record: ApiIncidentRecord;
}> {
  const ref = `SUB-${submitCounter++}`;
  const id = `INC-04${30 + Math.floor(Math.random() * 60)}`;

  const outcome = payload.demoOutcome ?? "valid";
  const base: ApiIncidentRecord = {
    incident_id: id,
    image_id: payload.fileName,
    storage_path: `/${id}/${payload.sourceType}/${payload.timestamp}_${payload.fileName}`,
    timestamp: payload.timestamp,
    source_type: payload.sourceType,
    latitude: payload.latitude,
    longitude: payload.longitude,
    severity_score: null,
    severity_score_override: null,
    overridden_by: null,
    overridden_at: null,
    severity_explanation: null,
    confidence_score: null,
    assessment_status: "pending_review",
    priority_rank: null,
    upload_status: "stored",
    ingestion_error: null,
    smoke_density: null,
    flame_visibility: null,
    vegetation_impact: null,
    structure_people_proximity: null,
    model_version: "indicator-classifier-v0.1",
    place: "Coordinator submission · " + (payload.notes || "field submission"),
  };

  if (outcome === "not_fire") {
    base.assessment_status = "unable_to_assess";
    base.confidence_score = 0.91;
    base.smoke_density = "moderate";
    base.flame_visibility = "no_visible_flame";
    base.vegetation_impact = "none_at_risk";
    base.structure_people_proximity = "no_structure_at_risk";
  } else if (outcome === "low_confidence") {
    base.assessment_status = "unable_to_assess";
    base.confidence_score = 0.38;
    base.smoke_density = "very_dense_blocking_vision";
    base.flame_visibility = "some_flame";
    base.vegetation_impact = "scorching";
    base.structure_people_proximity = "no_structure_at_risk";
  } else {
    base.assessment_status = "assessed";
    base.confidence_score = 0.79;
    base.severity_score = 3;
    base.smoke_density = "dense_dark";
    base.flame_visibility = "visible_high_flames_and_embers";
    base.vegetation_impact = "noticeable_impact";
    base.structure_people_proximity = "infrastructure_in_fire_line";
    base.severity_explanation =
      "Continuous flame front with two outbuildings 600 m downwind; sealed-road access available.";
  }

  seedRecords.push(base);
  return delay({ ref, record: base }, 900);
}

export async function confirmReview(_id: string): Promise<Partial<Incident>> {
  return delay({ flag: "processed", provenance: "ai_confirmed_by_coordinator" });
}

export async function changeReview(
  _id: string,
  level: SeverityBand
): Promise<Partial<Incident>> {
  return delay({
    flag: "processed",
    provenance: "coordinator_assigned",
    band: level,
    sum: null,
    elements: { smoke: null, flame: null, damage: null, people: null },
  });
}

export async function discardReview(_id: string): Promise<Partial<Incident>> {
  return delay({
    flag: "not_a_fire",
    dismissedReason: "Discarded by reviewer — no fire present in the image.",
    dismissedBy: "EC · Emergency Coordinator",
    dismissedAtIso: new Date().toISOString(),
  });
}

export async function overrideSeverity(
  _id: string,
  level: SeverityBand
): Promise<Partial<Incident>> {
  return delay({ band: level, provenance: "coordinator_override" });
}

export async function dispatchCrew(_id: string): Promise<Partial<Incident>> {
  return delay({ dispatch: "live", flag: "processed" });
}

export async function cancelDispatch(_id: string): Promise<Partial<Incident>> {
  return delay({ dispatch: "awaiting" });
}

export async function markExtinguished(_id: string): Promise<Partial<Incident>> {
  return delay({
    dispatch: "extinguished",
    extinguishedNote: "Crew reported the fire out",
    extinguishedBy: "EC · Emergency Coordinator",
    extinguishedAtIso: new Date().toISOString(),
  });
}

export async function reopenIncident(_id: string): Promise<Partial<Incident>> {
  return delay({ dispatch: "live", extinguishedNote: null, extinguishedBy: null, extinguishedAtIso: null });
}

export async function sendToManualReview(_id: string): Promise<Partial<Incident>> {
  return delay({
    flag: "flagged_review",
    band: 0,
    dispatch: "unranked",
    reviewReason: "sent_by_coordinator",
  });
}

export async function restoreFromArchive(_id: string): Promise<Partial<Incident>> {
  return delay({
    flag: "flagged_review",
    dispatch: "unranked",
    reviewReason: "restored_not_fire",
    dismissedReason: null,
    dismissedBy: null,
    dismissedAtIso: null,
  });
}

export type GroupAction = "confirmed" | "kept_separate";

export async function setGrouping(groupId: string, state: GroupAction) {
  return delay({ groupId, state });
}

export function getSeedGroup() {
  return seedGroup;
}

export function getSeedDecisionLog() {
  return seedDecisionLog;
}
