import { getSignedUrl } from '../storage/cos.service.ts';
import { logger, errorMeta } from '../utils/logger.ts';
import type { ImageMetadata } from '../metadata/metadata.types.ts';

const SIGNED_URL_EXPIRY_SECONDS = 900;
const REQUEST_TIMEOUT_MS = 30_000;

export type ClassificationResult = Pick<
    ImageMetadata,
    | 'severityScore'
    | 'confidenceScore'
    | 'severityExplanation'
    | 'assessmentStatus'
    | 'classificationLabel'
    | 'smokeDensity'
    | 'flameVisibility'
    | 'vegetationImpact'
    | 'infrastructureImpact'
>;

// Contract per docs/archive/sprint-1/ai-ml/Dataset_Integration_Interface_for_Htet.md: this ingestion API
// calls a classification service — proposed to be a custom model deployed into
// watsonx.ai Runtime, or a thin wrapper in front of it — with a signed URL to the image,
// and writes its response back onto the metadata record. That service doesn't exist yet
// (no labelled dataset, no trained model, no deployment id — see
// Technical_Assumptions_and_Limitations.md), so CLASSIFICATION_SERVICE_URL is unset for
// now and this is a no-op; point it at whatever ends up serving that contract and this
// starts working with no other change.
//
// Note: the interface doc's proposed response has no classification_label field, but the
// DB schema and assess-severity.ts's rubric both need one (fire/non_fire/extinguished/
// uncertain) — a real gap between that doc and the schema, not something to paper over
// here. classification_label is read from the response if present, else left null.
export async function requestClassification(image: {
    imageId: string;
    storagePath: string;
    sourceType: string;
}): Promise<ClassificationResult | null> {
    const serviceUrl = process.env.CLASSIFICATION_SERVICE_URL;
    if (!serviceUrl) {
        return null;
    }

    try {
        const signedUrl = await getSignedUrl(image.storagePath, SIGNED_URL_EXPIRY_SECONDS);
        const expiresAt = new Date(Date.now() + SIGNED_URL_EXPIRY_SECONDS * 1000).toISOString();

        const res = await fetch(serviceUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_id: image.imageId,
                storage_path: image.storagePath,
                source_type: image.sourceType,
                image_access: { type: 'signed_url', url: signedUrl, expires_at: expiresAt },
            }),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        if (!res.ok) {
            throw new Error(`classification service responded ${res.status}`);
        }

        const body = await res.json();
        return {
            severityScore: body.severity_score ?? null,
            confidenceScore: body.confidence_score ?? null,
            severityExplanation: body.severity_explanation ?? null,
            assessmentStatus: body.assessment_status ?? 'unable_to_assess',
            classificationLabel: body.classification_label ?? null,
            smokeDensity: body.indicators?.smoke_density?.value ?? null,
            flameVisibility: body.indicators?.flame_visibility?.value ?? null,
            vegetationImpact: body.indicators?.vegetation_impact?.value ?? null,
            infrastructureImpact: body.indicators?.infrastructure_impact?.value ?? null,
        };
    } catch (err) {
        // Per the interface doc's error table: an unreachable/failed classification call
        // doesn't fail the submission — it already passed ingestion validation — the
        // image just stays pending_review for a human.
        logger.error('classification request failed', errorMeta(err));
        return {
            severityScore: null,
            confidenceScore: null,
            severityExplanation: null,
            assessmentStatus: 'pending_review',
            classificationLabel: null,
            smokeDensity: null,
            flameVisibility: null,
            vegetationImpact: null,
            infrastructureImpact: null,
        };
    }
}
