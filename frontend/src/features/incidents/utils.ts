// Straight-line distance between two coordinates, in kilometres.
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Smoke/flame/damage indicators per severity level, from the finalised
// Sprint 1 AI Requirements rubric (section 10).
export const SEVERITY_RUBRIC: Record<
  1 | 2 | 3 | 4,
  { smoke: string; flame: string; damage: string }
> = {
  1: {
    smoke: 'Light haze, minimal smoke',
    flame: 'No visible flame',
    damage: 'No vegetation or structures at risk',
  },
  2: {
    smoke: 'Moderate smoke, some visibility reduction',
    flame: 'Some flame visible',
    damage: 'Vegetation scorching, no structures at risk',
  },
  3: {
    smoke: 'Dense, dark smoke',
    flame: 'Visible high flames with embers',
    damage: 'Noticeable vegetation impact, infrastructure in the fire line',
  },
  4: {
    smoke: 'Very dense smoke, blocking vision',
    flame: 'Large flame wall front, embers flying everywhere',
    damage: 'Extensive burnt area, including vegetation and infrastructure',
  },
}
