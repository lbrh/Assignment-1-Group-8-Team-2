import * as metadataRepository from '../metadata/metadata.repository.ts';

const RADIUS_KM = 2;
const WINDOW_HOURS = 6;

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Hybrid auto-grouping rule confirmed in
// docs/storage/Storage_and_Metadata_Finalisation_Addendum.md: attach to the nearest
// existing incident if its most recent image is within 2km and 6 hours, else the caller
// starts a new incident. A coordinator confirming/splitting a wrong auto-group is a
// separate, not-yet-built feature (that's UI, not ingestion).
export async function findIncidentToAttachTo(latitude: number, longitude: number, timestamp: string): Promise<string | null> {
    const candidates = await metadataRepository.findLatestImagePerIncident();
    const newTime = new Date(timestamp).getTime();

    let nearest: { incidentId: string; distanceKm: number } | null = null;
    for (const candidate of candidates) {
        const hoursApart = Math.abs(newTime - new Date(candidate.timestamp).getTime()) / 3_600_000;
        if (hoursApart > WINDOW_HOURS) continue;

        const distanceKm = haversineKm(latitude, longitude, candidate.latitude, candidate.longitude);
        if (distanceKm > RADIUS_KM) continue;

        if (!nearest || distanceKm < nearest.distanceKm) {
            nearest = { incidentId: candidate.incidentId, distanceKm };
        }
    }

    return nearest?.incidentId ?? null;
}
