// Field set and flow per docs/storage/Storage_and_metadata_V2.md section 2-3, extended by
// docs/storage/Storage_and_Metadata_Finalisation_Addendum.md (confidence_score, override/audit
// trail) and docs/ai-ml/Dataset_Classes_Label_Proposal_for_Aryaveer.md (per-indicator labels).

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
export type VegetationImpact = 'none_at_risk' | 'scorching' | 'noticeable_impact' | 'extensive_burnt_area';
export type StructurePeopleProximity =
    | 'no_structure_at_risk'
    | 'infrastructure_in_fire_line'
    | 'extensive_infrastructure_damage_people_in_proximity';

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
    structurePeopleProximity: StructurePeopleProximity | null;
    assessmentStatus: AssessmentStatus;
    classificationLabel: ClassificationLabel | null;
    priorityRank: number | null;
    uploadStatus: UploadStatus;
    ingestionError: string | null;
}

export interface IngestionInput {
    sourceType: SourceType;
    latitude?: number;
    longitude?: number;
    timestamp?: string;
    incidentId?: string;
}
