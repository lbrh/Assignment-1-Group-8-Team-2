/**
 * Real API implementation — same function signatures as mock/mockApi.ts, so switching
 * NEXT_PUBLIC_USE_MOCK_API to "false" is the only change components/store ever need.
 * Fill these in once the ingestion API (docs/storage/Storage_and_metadata_V2.md) and the
 * coordinator-workflow endpoints (decision log, dispatch, review actions — see the plan's
 * "schema gap" list) exist.
 */

function notImplemented(name: string): never {
  throw new Error(
    `real data-source not wired up yet: ${name}(). Set NEXT_PUBLIC_USE_MOCK_API=true, or implement this against the real API.`
  );
}

export async function listIncidents(): ReturnType<
  typeof import("../mock/mockApi").listIncidents
> {
  return notImplemented("listIncidents");
}

export async function getIncident(
  ..._args: Parameters<typeof import("../mock/mockApi").getIncident>
): ReturnType<typeof import("../mock/mockApi").getIncident> {
  return notImplemented("getIncident");
}

export async function submitImage(
  ..._args: Parameters<typeof import("../mock/mockApi").submitImage>
): ReturnType<typeof import("../mock/mockApi").submitImage> {
  return notImplemented("submitImage");
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
