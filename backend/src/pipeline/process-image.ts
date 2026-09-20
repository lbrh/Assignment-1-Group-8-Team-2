import { newIncidentId, newImageId } from '../utils/ids.ts';
import { buildObjectKey, uploadImage } from '../storage/cos.service.ts';
import * as metadataRepository from '../metadata/metadata.repository.ts';
import { extractExif } from './exif.ts';
import { validateIngestion } from './validate.ts';
import { findIncidentToAttachTo } from './group-incident.ts';
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

    const imageId = newImageId();
    const incidentId =
        merged.incidentId ??
        (await findIncidentToAttachTo(merged.latitude, merged.longitude, merged.timestamp)) ??
        newIncidentId();
    const ext = file.originalname.split('.').pop() || 'jpg';

    await metadataRepository.create({
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
    });

    const key = buildObjectKey(incidentId, merged.sourceType, merged.timestamp, imageId, ext);

    try {
        await uploadImage(key, file.buffer, file.mimetype);
        return await metadataRepository.update(imageId, { storagePath: key, uploadStatus: 'stored' });
    } catch (err) {
        return await metadataRepository.update(imageId, {
            uploadStatus: 'failed',
            ingestionError: err instanceof Error ? err.message : String(err),
        });
    }
}
