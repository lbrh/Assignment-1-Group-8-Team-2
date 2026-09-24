// Field set per docs/live/metadata-schema.md; indicator labels per docs/live/severity-rubric.md.

export type SourceType = 'drone' | 'cctv' | 'citizen' | 'satellite';
export type UploadStatus = 'pending' | 'stored' | 'failed';
export type AssessmentStatus = 'assessed' | 'unable_to_assess' | 'pending_review';
export type ClassificationLabel = 'fire' | 'non_fire' | 'extinguished' | 'uncertain';

export type SmokeDensity = 'none_or_haze' | 'moderate' | 'dense_dark' | 'very_dense_blocking_vision';
export type FlameVisibility =
    | 'no_visible_flame'
    | 'some_flame'
    | 'visible_high_flames_and_embers'
    | 'large_flame_wall_embers_everywhere';
// Amount of vegetation (fuel load) in frame, whether burning or not.
export type VegetationImpact = 'no_vegetation' | 'sparse_vegetation' | 'moderate_vegetation' | 'dense_vegetation';
// Amount of infrastructure in/near the scene, burning or not: fires near towns get higher priority.
export type InfrastructureImpact = 'no_infrastructure' | 'sparse_infrastructure' | 'moderate_infrastructure' | 'dense_infrastructure';

export interface ImageMetadata {
    incidentId: string;
    imageId: string;
    storagePath: string | null;
    timestamp: string;
    sourceType: SourceType;
    latitude: number;
    longitude: number;
    severityScore: number | null;
    // AI's own output, never overwritten in place — see severityScoreOverride.
    severityScoreOverride: number | null;
    overriddenBy: string | null;
    overriddenAt: string | null;
    confidenceScore: number | null;
    severityExplanation: string | null;
    smokeDensity: SmokeDensity | null;
    flameVisibility: FlameVisibility | null;
    vegetationImpact: VegetationImpact | null;
    infrastructureImpact: InfrastructureImpact | null;
    assessmentStatus: AssessmentStatus;
    classificationLabel: ClassificationLabel | null;
    priorityRank: number | null;
    uploadStatus: UploadStatus;
    ingestionError: string | null;
    contentHash: string | null;
}

export interface IngestionInput {
    sourceType: SourceType;
    latitude?: number;
    longitude?: number;
    timestamp?: string;
    incidentId?: string;
}
