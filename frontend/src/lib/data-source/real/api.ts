import { normalizeIncident } from "@/lib/normalize";
import type { ApiIncidentRecord, Incident } from "@/lib/types";
import type { SubmitImagePayload } from "../mock/mockApi";

/**
 * Real API implementation — same signatures as mock/mockApi.ts. Calls go through the Next.js
 * proxy at /api/backend (src/app/api/backend/[...path]/route.ts), which adds the API key
 * server-side. The coordinator-workflow calls below listIncidents/getIncident/submitImage have no
 * backend endpoint yet and still throw.
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

export async function confirmReview(
  ..._args: Parameters<typeof import("../mock/mockApi").confirmReview>
): ReturnType<typeof import("../mock/mockApi").confirmReview> {
  return notImplemented("confirmReview");
}

export async function changeReview(
  ..._args: Parameters<typeof import("../mock/mockApi").changeReview>
): ReturnType<typeof import("../mock/mockApi").changeReview> {
  return notImplemented("changeReview");
}

export async function discardReview(
  ..._args: Parameters<typeof import("../mock/mockApi").discardReview>
): ReturnType<typeof import("../mock/mockApi").discardReview> {
  return notImplemented("discardReview");
}

export async function overrideSeverity(
  ..._args: Parameters<typeof import("../mock/mockApi").overrideSeverity>
): ReturnType<typeof import("../mock/mockApi").overrideSeverity> {
  return notImplemented("overrideSeverity");
}

export async function dispatchCrew(
  ..._args: Parameters<typeof import("../mock/mockApi").dispatchCrew>
): ReturnType<typeof import("../mock/mockApi").dispatchCrew> {
  return notImplemented("dispatchCrew");
}

export async function cancelDispatch(
  ..._args: Parameters<typeof import("../mock/mockApi").cancelDispatch>
): ReturnType<typeof import("../mock/mockApi").cancelDispatch> {
  return notImplemented("cancelDispatch");
}

export async function markExtinguished(
  ..._args: Parameters<typeof import("../mock/mockApi").markExtinguished>
): ReturnType<typeof import("../mock/mockApi").markExtinguished> {
  return notImplemented("markExtinguished");
}

export async function reopenIncident(
  ..._args: Parameters<typeof import("../mock/mockApi").reopenIncident>
): ReturnType<typeof import("../mock/mockApi").reopenIncident> {
  return notImplemented("reopenIncident");
}

export async function sendToManualReview(
  ..._args: Parameters<typeof import("../mock/mockApi").sendToManualReview>
): ReturnType<typeof import("../mock/mockApi").sendToManualReview> {
  return notImplemented("sendToManualReview");
}

export async function restoreFromArchive(
  ..._args: Parameters<typeof import("../mock/mockApi").restoreFromArchive>
): ReturnType<typeof import("../mock/mockApi").restoreFromArchive> {
  return notImplemented("restoreFromArchive");
}

export async function setGrouping(
  ..._args: Parameters<typeof import("../mock/mockApi").setGrouping>
): ReturnType<typeof import("../mock/mockApi").setGrouping> {
  return notImplemented("setGrouping");
}
