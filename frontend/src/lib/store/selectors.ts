import type { Incident, SeverityBand } from "@/lib/types";

function byIds(incidents: Record<string, Incident>, order: string[]): Incident[] {
  return order.map((id) => incidents[id]).filter(Boolean);
}

/** Severity desc, then distance-from-staging asc — matches the redline's ranking rule. */
function bySeverityThenDistance(a: Incident, b: Incident): number {
  if (a.band !== b.band) return (b.band as number) - (a.band as number);
  return a.distanceKm - b.distanceKm;
}

export function rankedAwaiting(incidents: Record<string, Incident>, order: string[]): Incident[] {
  return byIds(incidents, order)
    .filter((i) => i.dispatch === "awaiting" && i.band > 0)
    .sort(bySeverityThenDistance);
}

export function liveDispatched(incidents: Record<string, Incident>, order: string[]): Incident[] {
  return byIds(incidents, order).filter((i) => i.dispatch === "live");
}

export function reviewQueue(incidents: Record<string, Incident>, order: string[]): Incident[] {
  return byIds(incidents, order)
    .filter((i) => i.flag === "flagged_review")
    .sort((a, b) => (a.capturedAtIso < b.capturedAtIso ? 1 : -1));
}

export function archiveList(incidents: Record<string, Incident>, order: string[]): Incident[] {
  return byIds(incidents, order)
    .filter((i) => i.flag === "not_a_fire")
    .sort((a, b) => ((a.dismissedAtIso ?? "") < (b.dismissedAtIso ?? "") ? 1 : -1));
}

export function resolvedList(incidents: Record<string, Incident>, order: string[]): Incident[] {
  return byIds(incidents, order)
    .filter((i) => i.dispatch === "extinguished")
    .sort((a, b) => ((a.extinguishedAtIso ?? "") < (b.extinguishedAtIso ?? "") ? 1 : -1));
}

/** Legend / map marker set: anything with an applied severity and not extinguished, per the
 * redline's "flagged and dismissed images are never drawn on the map" rule. */
export function mapMarkers(incidents: Record<string, Incident>, order: string[]): Incident[] {
  return byIds(incidents, order).filter(
    (i) => i.band > 0 && i.dispatch !== "extinguished" && i.flag !== "not_a_fire"
  );
}

export function extinguishedMarkers(
  incidents: Record<string, Incident>,
  order: string[]
): Incident[] {
  return byIds(incidents, order).filter((i) => i.dispatch === "extinguished");
}

export function legendCounts(
  incidents: Record<string, Incident>,
  order: string[]
): Record<SeverityBand, number> {
  const counts: Record<SeverityBand, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const i of mapMarkers(incidents, order)) {
    if (i.band) counts[i.band as SeverityBand] += 1;
  }
  return counts;
}

export function nearby(
  incidents: Record<string, Incident>,
  order: string[],
  currentId: string,
  limit = 3
): Incident[] {
  return rankedAwaiting(incidents, order)
    .filter((i) => i.id !== currentId)
    .slice(0, limit);
}

export function rankOf(incidents: Record<string, Incident>, order: string[], id: string): number {
  const ranked = rankedAwaiting(incidents, order);
  const idx = ranked.findIndex((i) => i.id === id);
  return idx === -1 ? 0 : idx + 1;
}
