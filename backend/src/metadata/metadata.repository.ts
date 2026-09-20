import '../utils/load-env.ts';
import { Pool } from 'pg';
import type { ImageMetadata } from './metadata.types.ts';

// Schema applied via schema.sql against the DATABASE_URL project (currently the free
// Neon "capstone" project — see backend/.env.example). Swapping to IBM Cloud Databases
// for PostgreSQL later is just changing DATABASE_URL; this file doesn't change.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const COLUMNS = {
    incidentId: 'incident_id',
    imageId: 'image_id',
    storagePath: 'storage_path',
    timestamp: 'timestamp',
    sourceType: 'source_type',
    latitude: 'latitude',
    longitude: 'longitude',
    severityScore: 'severity_score',
    severityScoreOverride: 'severity_score_override',
    overriddenBy: 'overridden_by',
    overriddenAt: 'overridden_at',
    confidenceScore: 'confidence_score',
    severityExplanation: 'severity_explanation',
    smokeDensity: 'smoke_density',
    flameVisibility: 'flame_visibility',
    vegetationImpact: 'vegetation_impact',
    structurePeopleProximity: 'structure_people_proximity',
    assessmentStatus: 'assessment_status',
    classificationLabel: 'classification_label',
    priorityRank: 'priority_rank',
    uploadStatus: 'upload_status',
    ingestionError: 'ingestion_error',
} as const satisfies Record<keyof ImageMetadata, string>;

function fromRow(row: Record<string, unknown>): ImageMetadata {
    const record: Record<string, unknown> = {};
    for (const [field, column] of Object.entries(COLUMNS)) {
        const value = row[column];
        record[field] = value instanceof Date ? value.toISOString() : value;
    }
    return record as unknown as ImageMetadata;
}

export async function create(record: ImageMetadata): Promise<ImageMetadata> {
    const fields = Object.keys(COLUMNS) as (keyof ImageMetadata)[];
    const columns = fields.map((field) => COLUMNS[field]);
    const placeholders = fields.map((_, i) => `$${i + 1}`);
    const values = fields.map((field) => record[field]);

    const { rows } = await pool.query(
        `INSERT INTO images (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
        values,
    );
    return fromRow(rows[0]);
}

export async function update(imageId: string, patch: Partial<ImageMetadata>): Promise<ImageMetadata> {
    const fields = Object.keys(patch) as (keyof ImageMetadata)[];
    if (fields.length === 0) {
        const existing = await get(imageId);
        if (!existing) throw new Error(`No metadata record for image ${imageId}`);
        return existing;
    }

    const setClauses = fields.map((field, i) => `${COLUMNS[field]} = $${i + 2}`);
    const values = fields.map((field) => patch[field]);

    const { rows } = await pool.query(
        `UPDATE images SET ${setClauses.join(', ')} WHERE image_id = $1 RETURNING *`,
        [imageId, ...values],
    );
    if (rows.length === 0) {
        throw new Error(`No metadata record for image ${imageId}`);
    }
    return fromRow(rows[0]);
}

export async function get(imageId: string): Promise<ImageMetadata | undefined> {
    const { rows } = await pool.query('SELECT * FROM images WHERE image_id = $1', [imageId]);
    return rows[0] ? fromRow(rows[0]) : undefined;
}

export interface LatestIncidentImage {
    incidentId: string;
    latitude: number;
    longitude: number;
    timestamp: string;
}

// One row per incident: its most recent image, for the auto-grouping check in
// pipeline/group-incident.ts.
export async function findLatestImagePerIncident(): Promise<LatestIncidentImage[]> {
    const { rows } = await pool.query(
        `SELECT DISTINCT ON (incident_id) incident_id, latitude, longitude, "timestamp"
         FROM images
         ORDER BY incident_id, "timestamp" DESC`,
    );
    return rows.map((row) => ({
        incidentId: row.incident_id,
        latitude: row.latitude,
        longitude: row.longitude,
        timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : row.timestamp,
    }));
}
