import exifr from 'exifr';

export interface ExifData {
    latitude?: number;
    longitude?: number;
    timestamp?: string;
}

// Fallback source for location/timestamp when the client doesn't supply them
// (docs/storage/Storage_and_metadata_V2.md section 1: web form prompts for manual
// entry only when EXIF is missing; direct API callers may pre-populate instead).
export async function extractExif(buffer: Buffer): Promise<ExifData> {
    const gps = await exifr.gps(buffer).catch(() => undefined);
    const tags = await exifr.parse(buffer, ['DateTimeOriginal']).catch(() => undefined);

    return {
        latitude: gps?.latitude,
        longitude: gps?.longitude,
        timestamp: tags?.DateTimeOriginal instanceof Date ? tags.DateTimeOriginal.toISOString() : undefined,
    };
}
