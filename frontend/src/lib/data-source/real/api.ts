import { ARCHIVED_REASON, normalizeIncident } from "@/lib/normalize";
import { bandFromSum } from "@/lib/constants/severity";
import type {
  ApiIncidentRecord,
  BackendDispatchState,
  ClassificationLabel,
  DecisionLogEntry,
  Incident,
  SeverityBand,
} from "@/lib/types";
import type { SubmitImagePayload } from "../mock/mockApi";

/**
 * Real API implementation — same signatures as mock/mockApi.ts. Calls go through the Next.js
 * proxy at /api/backend (src/app/api/backend/[...path]/route.ts), which adds the API key
 * server-side. Coordinator actions map onto PATCH /images/:id/decision and PUT /incidents/:id/dispatch;
 * grouping has no backend endpoint yet and still throws.
 */
const BASE = "/api/backend";

// Operating region, same box the backend validates ingestion against (backend/src/pipeline/validate.ts).
// ponytail: one fetch for the whole region; switch to per-viewport queries if incident volume grows.
const REGION = { minLat: -39.2, maxLat: -33.98, minLon: 140.96, maxLon: 150.03 };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store", ...init });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error ?? `${res.status} ${res.statusText}`);
  return body as T;
}

export async function listIncidents(): Promise<Incident[]> {
  const query = new URLSearchParams(Object.entries(REGION).map(([k, v]) => [k, String(v)]));
  const records = await request<ApiIncidentRecord[]>(`/incidents?${query}`);
  return records.map((r) => normalizeIncident(r));
}

export async function getIncident(id: string): Promise<Incident | null> {
  try {
    // every image at the incident, most recent first — the newest one represents the incident
    const images = await request<ApiIncidentRecord[]>(`/incidents/${encodeURIComponent(id)}`);
    return images[0] ? normalizeIncident(images[0]) : null;
  } catch {
    return null;
  }
}

/** Downscaled WebP of the stored image, cached by the browser. Safe to use as an <img> src. */
export function getImagePreviewUrl(imageId: string, width: 240 | 800 = 800): string | null {
  return `${BASE}/images/${encodeURIComponent(imageId)}/preview?w=${width}`;
}

/** Signed link to the full-resolution stored image, valid for 15 minutes. */
export async function getImageUrl(imageId: string): Promise<string | null> {
  const { url } = await request<{ url: string }>(`/images/${encodeURIComponent(imageId)}`);
  return url;
}

export async function submitImage(
  payload: SubmitImagePayload
): Promise<{ ref: string; record: ApiIncidentRecord }> {
  if (!payload.file) throw new Error("An image file is required.");
  const form = new FormData();
  form.append("image", payload.file);
  form.append("source_type", payload.sourceType);
  // omitted fields fall back to the image's EXIF on the backend
  if (payload.latitude != null) form.append("latitude", String(payload.latitude));
  if (payload.longitude != null) form.append("longitude", String(payload.longitude));
  if (payload.timestamp) form.append("timestamp", payload.timestamp);
  const record = await request<ApiIncidentRecord>("/ingest", { method: "POST", body: form });
  return { ref: record.imageId, record };
}

function notImplemented(name: string): never {
  throw new Error(`No backend endpoint for ${name}() yet.`);
}

// ponytail: sent as `by` on every decision; there's no login yet, so the backend records it unverified.
export const COORDINATOR_NAME = "EC · Emergency Coordinator";

type ReviewPatch = {
  severityScoreOverride?: number | null;
  classificationLabelOverride?: ClassificationLabel | null;
  assessmentStatus?: "assessed" | "unable_to_assess";
};

const jsonInit = (method: string, body: object): RequestInit => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ ...body, by: COORDINATOR_NAME }),
});

// The review fields of an incident as the server now has them — merged into the store by the caller.
function reviewFields(record: ApiIncidentRecord, incident: Incident): Partial<Incident> {
  const next = normalizeIncident({ ...record, dispatchState: incident.backend.dispatchState });
  const { flag, band, provenance, reviewReason, dismissedReason, dismissedBy, dismissedAtIso, dispatch, backend } = next;
  return { flag, band, provenance, reviewReason, dismissedReason, dismissedBy, dismissedAtIso, dispatch, backend };
}

async function decide(incident: Incident, patch: ReviewPatch): Promise<Partial<Incident>> {
  const record = await request<ApiIncidentRecord>(
    `/images/${incident.backend.imageId}/decision`,
    jsonInit("PATCH", patch)
  );
  return reviewFields(record, incident);
}

async function setDispatch(incident: Incident, state: BackendDispatchState): Promise<Partial<Incident>> {
  await request(`/incidents/${encodeURIComponent(incident.id)}/dispatch`, jsonInit("PUT", { state }));
  const now = new Date().toISOString();
  const archived = state === "archived";
  return {
    dispatch: state,
    backend: { ...incident.backend, dispatchState: state },
    extinguishedNote: state === "extinguished" ? "Crew reported the fire out" : null,
    extinguishedBy: state === "extinguished" ? COORDINATOR_NAME : null,
    extinguishedAtIso: state === "extinguished" ? now : null,
    dismissedReason: archived ? ARCHIVED_REASON : incident.dismissedReason,
    dismissedBy: archived ? COORDINATOR_NAME : incident.dismissedBy,
    dismissedAtIso: archived ? now : incident.dismissedAtIso,
  };
}

/** Confirming keeps the AI's own provisional score, recorded as the coordinator's decision. */
export async function confirmReview(incident: Incident): Promise<Partial<Incident>> {
  if (incident.sum == null) throw new Error("There's no AI severity to confirm — assign one instead.");
  return decide(incident, {
    severityScoreOverride: bandFromSum(incident.sum),
    classificationLabelOverride: "fire",
    assessmentStatus: "assessed",
  });
}

export async function changeReview(incident: Incident, level: SeverityBand): Promise<Partial<Incident>> {
  return decide(incident, { severityScoreOverride: level, classificationLabelOverride: "fire", assessmentStatus: "assessed" });
}

export async function discardReview(incident: Incident): Promise<Partial<Incident>> {
  return decide(incident, { classificationLabelOverride: "non_fire", assessmentStatus: "assessed" });
}

export async function overrideSeverity(incident: Incident, level: SeverityBand): Promise<Partial<Incident>> {
  return decide(incident, { severityScoreOverride: level });
}

export async function sendToManualReview(incident: Incident): Promise<Partial<Incident>> {
  return decide(incident, { assessmentStatus: "unable_to_assess" });
}

/** "uncertain" puts it back in review even when the AI itself said non-fire. */
export async function restoreFromArchive(incident: Incident): Promise<Partial<Incident>> {
  return decide(incident, { classificationLabelOverride: "uncertain", assessmentStatus: "unable_to_assess" });
}

export const dispatchCrew = (incident: Incident) => setDispatch(incident, "live");
export const cancelDispatch = (incident: Incident) => setDispatch(incident, "awaiting");
export const markExtinguished = (incident: Incident) => setDispatch(incident, "extinguished");
export const reopenIncident = (incident: Incident) => setDispatch(incident, "live");
export const archiveIncident = (incident: Incident) => setDispatch(incident, "archived");

/** Puts the server back to the snapshot taken before the action, sending only what changed.
 * The backend logs the undo like any other decision. */
export async function undo(prev: Incident, current: Incident): Promise<void> {
  const before = prev.backend;
  const now = current.backend;
  const reviewChanged =
    before.severityScoreOverride !== now.severityScoreOverride ||
    before.classificationLabelOverride !== now.classificationLabelOverride ||
    before.assessmentStatus !== now.assessmentStatus;
  if (reviewChanged) {
    await request(
      `/images/${before.imageId}/decision`,
      jsonInit("PATCH", {
        severityScoreOverride: before.severityScoreOverride,
        classificationLabelOverride: before.classificationLabelOverride,
        // pending_review can't be set by a coordinator; it means "not yet assessed", same as needing review
        assessmentStatus: before.assessmentStatus === "assessed" ? "assessed" : "unable_to_assess",
      })
    );
  }
  if (before.dispatchState !== now.dispatchState) {
    // no dispatch row before = the default "awaiting" for a confirmed fire
    await request(`/incidents/${encodeURIComponent(prev.id)}/dispatch`, jsonInit("PUT", { state: before.dispatchState ?? "awaiting" }));
  }
}

interface ApiDecision {
  id: number;
  incidentId: string;
  field: string;
  fromValue: string | null;
  toValue: string | null;
  decidedBy: string;
  decidedAt: string;
}

const FIELD_LABELS: Record<string, string> = {
  severityScoreOverride: "Severity",
  classificationLabelOverride: "Classification",
  assessmentStatus: "Review status",
  dispatchState: "Dispatch",
};

export async function getDecisionLog(incidentId: string): Promise<DecisionLogEntry[]> {
  const decisions = await request<ApiDecision[]>(`/incidents/${encodeURIComponent(incidentId)}/decisions`);
  return decisions.map((d) => ({
    id: String(d.id),
    incidentId: d.incidentId,
    summary: `${FIELD_LABELS[d.field] ?? d.field}: ${d.fromValue ?? "none"} → ${d.toValue ?? "none"}`,
    who: d.decidedBy,
    whenIso: d.decidedAt,
  }));
}

export async function setGrouping(
  ..._args: Parameters<typeof import("../mock/mockApi").setGrouping>
): ReturnType<typeof import("../mock/mockApi").setGrouping> {
  return notImplemented("setGrouping");
}
