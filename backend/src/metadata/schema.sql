-- Agreed metadata schema per docs/storage/Storage_and_metadata_V2.md section 2,
-- extended by Storage_and_Metadata_Finalisation_Addendum.md and
-- docs/ai-ml/Dataset_Classes_Label_Proposal_for_Aryaveer.md. One row per image/video object.

CREATE TABLE IF NOT EXISTS images (
    image_id UUID PRIMARY KEY,
    incident_id UUID NOT NULL,
    storage_path TEXT,
    "timestamp" TIMESTAMPTZ NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('drone', 'cctv', 'citizen', 'satellite')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,

    severity_score INTEGER,
    severity_score_override INTEGER,
    overridden_by TEXT,
    overridden_at TIMESTAMPTZ,
    confidence_score DOUBLE PRECISION,
    severity_explanation TEXT,

    smoke_density TEXT CHECK (smoke_density IN ('none_or_haze', 'moderate', 'dense_dark', 'very_dense_blocking_vision')),
    flame_visibility TEXT CHECK (flame_visibility IN ('no_visible_flame', 'some_flame', 'visible_high_flames_and_embers', 'large_flame_wall_embers_everywhere')),
    vegetation_impact TEXT CHECK (vegetation_impact IN ('none_at_risk', 'scorching', 'noticeable_impact', 'extensive_burnt_area')),
    structure_people_proximity TEXT CHECK (structure_people_proximity IN ('no_structure_at_risk', 'infrastructure_in_fire_line', 'extensive_infrastructure_damage_people_in_proximity')),

    assessment_status TEXT NOT NULL CHECK (assessment_status IN ('assessed', 'unable_to_assess', 'pending_review')),
    priority_rank INTEGER,
    upload_status TEXT NOT NULL CHECK (upload_status IN ('pending', 'stored', 'failed')),
    ingestion_error TEXT
);

-- Map viewport range queries and per-incident prefix fetches (V2 doc section 4/7).
CREATE INDEX IF NOT EXISTS images_incident_id_idx ON images (incident_id);
CREATE INDEX IF NOT EXISTS images_lat_lon_idx ON images (latitude, longitude);
CREATE INDEX IF NOT EXISTS images_priority_rank_idx ON images (priority_rank);
