import { createHash } from 'node:crypto';
import { newIncidentId, newImageId } from '../utils/ids.ts';
import { buildObjectKey, uploadImage } from '../storage/cos.service.ts';
import * as metadataRepository from '../metadata/metadata.repository.ts';
import { extractExif } from './exif.ts';
import { validateIngestion } from './validate.ts';
import { findIncidentToAttachTo } from './group-incident.ts';
import { requestClassification } from './classification.service.ts';
import { logger, errorMeta } from '../utils/logger.ts';
import type { IngestionInput, ImageMetadata } from '../metadata/metadata.types.ts';

export interface IngestedFile {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
}

// Flow per docs/storage/Storage_and_metadata_V2.md section 3: fill gaps from EXIF,
// validate, create the pending metadata record, then write to storage and update status.
export async function processImage(input: IngestionInput, file: IngestedFile): Promise<ImageMetadata> {
    const exif = await extractExif(file.buffer);
    const merged: IngestionInput = {
        sourceType: input.sourceType,
        latitude: input.latitude ?? exif.latitude,
        longitude: input.longitude ?? exif.longitude,
        timestamp: input.timestamp ?? exif.timestamp,
        incidentId: input.incidentId,
    };

    validateIngestion(merged);

    // Exact-duplicate resubmission (same bytes) attaches to nothing new — the addendum's
    // second dedup check, alongside the spatial/temporal auto-grouping below.
    const contentHash = createHash('md5').update(file.buffer).digest('hex');
    const existing = await metadataRepository.findByContentHash(contentHash);
    if (existing) {
        return existing;
    }

    const imageId = newImageId();
    const ext = file.originalname.split('.').pop() || 'jpg';

    // Locked so two near-simultaneous uploads in the same area/window can't each miss
    // the other's not-yet-committed row and create two incidents instead of one.
    const pending = await metadataRepository.withIncidentGroupingLock(async () => {
        const incidentId =
            merged.incidentId ??
            (await findIncidentToAttachTo(merged.latitude, merged.longitude, merged.timestamp)) ??
            newIncidentId();

        return metadataRepository.create({
            incidentId,
            imageId,
            storagePath: null,
            timestamp: merged.timestamp,
            sourceType: merged.sourceType,
            latitude: merged.latitude,
            longitude: merged.longitude,
            severityScore: null,
            severityScoreOverride: null,
            overriddenBy: null,
            overriddenAt: null,
            confidenceScore: null,
            severityExplanation: null,
            smokeDensity: null,
            flameVisibility: null,
            vegetationImpact: null,
            structurePeopleProximity: null,
            assessmentStatus: 'pending_review',
            classificationLabel: null,
            priorityRank: null,
            uploadStatus: 'pending',
            ingestionError: null,
            contentHash,
        });
    });

    const key = buildObjectKey(pending.incidentId, merged.sourceType, merged.timestamp, imageId, ext);

    try {
        await uploadImage(key, file.buffer, file.mimetype);
        const stored = await metadataRepository.update(imageId, { storagePath: key, uploadStatus: 'stored' });

        // Fire-and-forget: whether ingestion holds the connection open for classification
        // is an explicitly open question in the interface doc; running it after the
        // response is already on its way avoids the /ingest call blocking on an ML call
        // with no agreed SLA yet. A coordinator can still override the result later
        // regardless of whether this finishes before or after the client sees the response.
        void classifyAndUpdate(stored);

        return stored;
    } catch (err) {
        return await metadataRepository.update(imageId, {
            uploadStatus: 'failed',
            ingestionError: err instanceof Error ? err.message : String(err),
        });
    }
}

async function classifyAndUpdate(record: ImageMetadata): Promise<void> {
    if (!record.storagePath) return;
    const result = await requestClassification({
        imageId: record.imageId,
        storagePath: record.storagePath,
        sourceType: record.sourceType,
    });
    if (!result) return; // CLASSIFICATION_SERVICE_URL not configured yet — no-op

    try {
        await metadataRepository.update(record.imageId, result);
    } catch (err) {
        logger.error('failed to write classification result', errorMeta(err));
    }
}
