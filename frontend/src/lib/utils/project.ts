/** Proximity-based clustering over projected screen positions (Leaflet container pixels),
 * computed from the markers currently visible rather than an authored per-zoom incident-ID
 * list — a marker only ever drops out of a cluster when it isn't currently visible (e.g.
 * flagged/dismissed), by construction. */
export function clusterByProximity<T extends { id: string; x: number; y: number }>(
  points: T[],
  threshold: number
): T[][] {
  const remaining = [...points];
  const clusters: T[][] = [];

  while (remaining.length > 0) {
    const seed = remaining.shift()!;
    const cluster = [seed];
    for (let i = remaining.length - 1; i >= 0; i--) {
      const p = remaining[i];
      const d = Math.hypot(p.x - seed.x, p.y - seed.y);
      if (d < threshold) {
        cluster.push(p);
        remaining.splice(i, 1);
      }
    }
    clusters.push(cluster);
  }

  return clusters;
}
