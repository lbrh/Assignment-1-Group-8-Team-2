import { normalizeIncident } from "@/lib/normalize";
import type { ApiIncidentRecord, DecisionLogEntry, Incident, SeverityBand, SourceType } from "@/lib/types";
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
    const overlay = seedOverlay[record.incidentId];
    return normalizeIncident(record, { discarded: overlay?.discarded, place: overlay?.place });
  });
  return delay(incidents);
}

export async function getIncident(id: string): Promise<Incident | null> {
  const record = seedRecords.find((r) => r.incidentId === id) ?? null;
  if (!record) return delay(null);
  const overlay = seedOverlay[record.incidentId];
  return delay(normalizeIncident(record, { discarded: overlay?.discarded, place: overlay?.place }));
}

export interface SubmitImagePayload {
  file?: File;
  fileName: string;
  /** Omitted = backend reads it from the image's EXIF. */
  latitude?: number;
  longitude?: number;
  timestamp?: string;
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
  // The mock can't read EXIF, so it rejects missing fields the way the backend would without it.
  const { latitude, longitude, timestamp } = payload;
  if (latitude == null || longitude == null) throw new Error("latitude and longitude are required");
  if (!timestamp) throw new Error("timestamp is required");
  const ref = `SUB-${submitCounter}`;
  const id = `INC-${submitCounter++}`; // counter, not random — can't collide with seed IDs

  const outcome = payload.demoOutcome ?? "valid";
  const base: ApiIncidentRecord = {
    incidentId: id,
    imageId: payload.fileName,
    storagePath: `/${id}/${payload.sourceType}/${timestamp}_${payload.fileName}`,
    timestamp,
    sourceType: payload.sourceType,
    latitude,
    longitude,
    severityScore: null,
    severityScoreOverride: null,
    overriddenBy: null,
    overriddenAt: null,
    severityExplanation: null,
    confidenceScore: null,
    assessmentStatus: "pending_review",
    priorityRank: null,
    uploadStatus: "stored",
    ingestionError: null,
    smokeDensity: null,
    flameVisibility: null,
    vegetationImpact: null,
    infrastructureImpact: null,
    classificationLabel: null,
    classificationLabelOverride: null,
    contentHash: null,
  };

  // Shapes match backend assessSeverity(): a confident non-fire is "assessed" with no indicators
  // and goes straight to Archive (Sprint 2 §1.3).
  if (outcome === "not_fire") {
    base.assessmentStatus = "assessed";
    base.classificationLabel = "non_fire";
  } else if (outcome === "low_confidence") {
    base.assessmentStatus = "unable_to_assess";
    base.classificationLabel = "fire";
    base.severityScore = 2;
    base.confidenceScore = 0.38;
    base.smokeDensity = "very_dense_blocking_vision";
    base.flameVisibility = "some_flame";
    base.vegetationImpact = "sparse_vegetation";
    base.infrastructureImpact = "no_infrastructure";
  } else {
    base.assessmentStatus = "assessed";
    base.classificationLabel = "fire";
    base.confidenceScore = 0.79;
    base.severityScore = 3;
    base.smokeDensity = "dense_dark";
    base.flameVisibility = "visible_high_flames_and_embers";
    base.vegetationImpact = "moderate_vegetation";
    base.infrastructureImpact = "moderate_infrastructure";
    base.severityExplanation =
      "Continuous flame front with two outbuildings 600 m downwind; sealed-road access available.";
  }

  seedRecords.push(base);
  return delay({ ref, record: base }, 900);
}

export async function confirmReview(_incident: Incident): Promise<Partial<Incident>> {
  return delay({ flag: "processed", provenance: "ai_confirmed_by_coordinator" });
}

export async function changeReview(
  _incident: Incident,
  level: SeverityBand
): Promise<Partial<Incident>> {
  return delay({
    flag: "processed",
    provenance: "coordinator_assigned",
    band: level,
    sum: null,
    elements: { smoke: null, flame: null, vegetation: null, infrastructure: null },
  });
}

export async function discardReview(_incident: Incident): Promise<Partial<Incident>> {
  return delay({
    flag: "not_a_fire",
    dismissedReason: "Discarded by reviewer — no fire present in the image.",
    dismissedBy: "EC · Emergency Coordinator",
    dismissedAtIso: new Date().toISOString(),
  });
}

export async function overrideSeverity(
  _incident: Incident,
  level: SeverityBand
): Promise<Partial<Incident>> {
  return delay({ band: level, provenance: "coordinator_override" });
}

export async function dispatchCrew(_incident: Incident): Promise<Partial<Incident>> {
  return delay({ dispatch: "live", flag: "processed" });
}

export async function cancelDispatch(_incident: Incident): Promise<Partial<Incident>> {
  return delay({ dispatch: "awaiting" });
}

export async function markExtinguished(_incident: Incident): Promise<Partial<Incident>> {
  return delay({
    dispatch: "extinguished",
    extinguishedNote: "Crew reported the fire out",
    extinguishedBy: "EC · Emergency Coordinator",
    extinguishedAtIso: new Date().toISOString(),
  });
}

export async function reopenIncident(_incident: Incident): Promise<Partial<Incident>> {
  return delay({ dispatch: "live", extinguishedNote: null, extinguishedBy: null, extinguishedAtIso: null });
}

export async function sendToManualReview(_incident: Incident): Promise<Partial<Incident>> {
  return delay({
    flag: "flagged_review",
    band: 0,
    dispatch: "unranked",
    reviewReason: "sent_by_coordinator",
  });
}

export async function restoreFromArchive(_incident: Incident): Promise<Partial<Incident>> {
  return delay({
    flag: "flagged_review",
    dispatch: "unranked",
    reviewReason: "restored_not_fire",
    dismissedReason: null,
    dismissedBy: null,
    dismissedAtIso: null,
  });
}

/** Mock state lives only in the store, so undo is just the store restoring its snapshot. */
export async function undo(_prev: Incident, _current: Incident): Promise<void> {}

/** null = keep the store's local log (mock has no server-side log). */
export async function getDecisionLog(_incidentId: string): Promise<DecisionLogEntry[] | null> {
  return null;
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
