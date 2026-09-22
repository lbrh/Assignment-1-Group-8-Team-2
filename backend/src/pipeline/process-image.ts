import { createHash } from 'node:crypto';
import { newIncidentId, newImageId } from '../utils/ids.ts';
import { buildObjectKey, uploadImage } from '../storage/cos.service.ts';
import * as metadataRepository from '../metadata/metadata.repository.ts';
import { extractExif } from './exif.ts';
import { validateIngestion } from './validate.ts';
import { findIncidentToAttachTo } from './group-incident.ts';
import { requestClassification } from './classification.service.ts';
import { classifySmokeDensity, classifyFlameVisibility } from '../ai/indicator-models.ts';
import { logger, errorMeta } from '../utils/logger.ts';
import type { IngestionInput, ImageMetadata } from '../metadata/metadata.types.ts';

// Direct per-indicator watsonx.ai Runtime deployments (AI_Framework_and_Technical_Approach.md's
// recommended architecture). Add an entry here as each indicator's model gets deployed;
// an unconfigured envVar just skips that indicator, so this stays a no-op field by field
// until all four exist. Full severity_score/assessment_status need all four indicators,
// which assessSeverity() (assess-severity.ts) computes once they do.
const INDICATOR_CLASSIFIERS: {
    envVar: string;
    field: 'smokeDensity' | 'flameVisibility';
    classify: (imageBuffer: Buffer) => Promise<{ value: string; confidence: number }>;
}[] = [
    { envVar: 'WATSONX_SMOKE_DENSITY_DEPLOYMENT_ID', field: 'smokeDensity', classify: classifySmokeDensity },
    { envVar: 'WATSONX_FLAME_VISIBILITY_DEPLOYMENT_ID', field: 'flameVisibility', classify: classifyFlameVisibility },
];

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
        void classifyAndUpdate(stored, file.buffer);

        return stored;
    } catch (err) {
        return await metadataRepository.update(imageId, {
            uploadStatus: 'failed',
            ingestionError: err instanceof Error ? err.message : String(err),
        });
    }
}

async function classifyAndUpdate(record: ImageMetadata, imageBuffer: Buffer): Promise<void> {
    if (!record.storagePath) return;

    // External classification service per the interface doc (still a no-op — nothing's
    // configured at CLASSIFICATION_SERVICE_URL yet).
    const externalResult = await requestClassification({
        imageId: record.imageId,
        storagePath: record.storagePath,
        sourceType: record.sourceType,
    });
    if (externalResult) {
        try {
            await metadataRepository.update(record.imageId, externalResult);
        } catch (err) {
            logger.error('failed to write classification result', errorMeta(err));
        }
    }

    for (const indicator of INDICATOR_CLASSIFIERS) {
        if (!process.env[indicator.envVar]) continue;
        try {
            const prediction = await indicator.classify(imageBuffer);
            await metadataRepository.update(record.imageId, { [indicator.field]: prediction.value });
        } catch (err) {
            logger.error(`${indicator.field} classification failed`, errorMeta(err));
        }
    }
}
