/**
 * Linear lat/lng -> percentage projection within a fixed bounding box covering the seed
 * dataset's spread. Good enough for a stylised, non-geographic map canvas (the redline's canvas
 * is an "organic terrain" backdrop, not a real basemap) — swap for a real projection (Leaflet /
 * Mapbox) if the map ever needs real geography.
 */
const BOUNDS = {
  latMin: -37.85,
  latMax: -37.55,
  lngMin: 145.0,
  lngMax: 145.45,
};

export function projectToPercent(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - BOUNDS.lngMin) / (BOUNDS.lngMax - BOUNDS.lngMin)) * 100;
  const y = (1 - (lat - BOUNDS.latMin) / (BOUNDS.latMax - BOUNDS.latMin)) * 100;
  return { x: Math.min(96, Math.max(4, x)), y: Math.min(92, Math.max(8, y)) };
}

/** Proximity-based clustering (pixel distance within a % canvas), computed from projected
 * positions rather than an authored per-zoom incident-ID list — a marker only ever drops out of
 * a cluster when it isn't currently visible (e.g. flagged/dismissed), by construction. */
export function clusterByProximity<T extends { id: string; x: number; y: number }>(
  points: T[],
  thresholdPct: number
): T[][] {
  const remaining = [...points];
  const clusters: T[][] = [];

  while (remaining.length > 0) {
    const seed = remaining.shift()!;
    const cluster = [seed];
    for (let i = remaining.length - 1; i >= 0; i--) {
      const p = remaining[i];
      const d = Math.hypot(p.x - seed.x, p.y - seed.y);
      if (d < thresholdPct) {
        cluster.push(p);
        remaining.splice(i, 1);
      }
    }
    clusters.push(cluster);
  }

  return clusters;
}
