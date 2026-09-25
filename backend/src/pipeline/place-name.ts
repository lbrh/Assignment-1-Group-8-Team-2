import { logger, errorMeta } from '../utils/logger.ts';

// Reverse geocoding for a human place name ("Kinglake", "Halls Gap") instead of bare coordinates.
// OpenStreetMap's public Nominatim: free, no key, but its usage policy asks for an identifying
// User-Agent and at most one request a second.
const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse';
const USER_AGENT = 'EMBERA-bushfire-triage/0.1 (RMIT student project)';
const MIN_GAP_MS = 1100;
const TIMEOUT_MS = 5000;

interface NominatimResult {
    name?: string;
    address?: Record<string, string>;
}

// zoom=14 asks for the suburb/locality level, so `name` is the town or locality itself; the
// address parts are a fallback for points Nominatim can only place in a wider area.
const LOCALITY_KEYS = ['town', 'village', 'suburb', 'hamlet', 'city_district', 'locality', 'city', 'municipality', 'county'];

export function placeFromResult(result: NominatimResult): string | null {
    if (result.name?.trim()) return result.name.trim();
    const address = result.address ?? {};
    return LOCALITY_KEYS.map((key) => address[key]).find(Boolean) ?? null;
}

// ponytail: one process-wide queue keeps us under Nominatim's 1 req/s; move to a paid or
// self-hosted geocoder if ingest volume ever needs more than that.
let queue: Promise<unknown> = Promise.resolve();

/** The locality at a point, or null when it can't be looked up (the UI falls back to coordinates). */
export function lookUpPlaceName(latitude: number, longitude: number): Promise<string | null> {
    const run = async (): Promise<string | null> => {
        const url = `${NOMINATIM}?format=jsonv2&zoom=14&addressdetails=1&lat=${latitude}&lon=${longitude}`;
        try {
            const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(TIMEOUT_MS) });
            if (!res.ok) throw new Error(`Nominatim ${res.status}`);
            return placeFromResult((await res.json()) as NominatimResult);
        } catch (err) {
            logger.warn('place name lookup failed', errorMeta(err));
            return null;
        } finally {
            await new Promise((resolve) => setTimeout(resolve, MIN_GAP_MS));
        }
    };
    const result = queue.then(run);
    queue = result;
    return result;
}
