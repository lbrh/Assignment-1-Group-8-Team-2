/** Operating region: the same box the backend validates ingestion against
 * (backend/src/pipeline/validate.ts). Keep the two in sync. */
export const OPERATING_REGION = { minLat: -39.2, maxLat: -33.98, minLon: 140.96, maxLon: 150.03 };

/** Fixed staging ground used as the distance reference for ranking (demo-only placeholder). */
export const STAGING_COORDS = { lat: -37.65, lng: 145.25 };

/** Haversine distance in km. */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number } = STAGING_COORDS
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}
