import type { IngestionInput } from '../metadata/metadata.types.ts';

const SOURCE_TYPES = new Set(['drone', 'cctv', 'citizen', 'satellite']);

export class ValidationError extends Error {}

export type ValidatedIngestionInput = Required<Pick<IngestionInput, 'sourceType' | 'latitude' | 'longitude' | 'timestamp'>> &
    IngestionInput;

// Per docs/storage/Storage_and_metadata_V2.md section 3, step 2: location + timestamp
// must be present and coordinates must fall within the operating region's bounding box.
export function validateIngestion(input: IngestionInput): asserts input is ValidatedIngestionInput {
    if (!input.sourceType || !SOURCE_TYPES.has(input.sourceType)) {
        throw new ValidationError('source_type is required and must be one of drone, cctv, citizen, satellite');
    }
    if (input.latitude === undefined || input.longitude === undefined) {
        throw new ValidationError('latitude and longitude are required');
    }
    if (input.latitude < -90 || input.latitude > 90 || input.longitude < -180 || input.longitude > 180) {
        throw new ValidationError('latitude/longitude out of range');
    }

    if (!input.timestamp) {
        throw new ValidationError('timestamp is required');
    }
}
