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
    contentHash: 'content_hash',
} as const satisfies Record<keyof ImageMetadata, string>;

function fromRow(row: Record<string, unknown>): ImageMetadata {
    const record: Record<string, unknown> = {};
    for (const [field, column] of Object.entries(COLUMNS)) {
        const value = row[column];
        record[field] = value instanceof Date ? value.toISOString() : value;
    }
    return record as unknown as ImageMetadata;
}

function isUniqueViolation(err: unknown): boolean {
    return typeof err === 'object' && err !== null && 'code' in err && (err as { code: unknown }).code === '23505';
}

export async function create(record: ImageMetadata): Promise<ImageMetadata> {
    const fields = Object.keys(COLUMNS) as (keyof ImageMetadata)[];
    const columns = fields.map((field) => COLUMNS[field]);
    const placeholders = fields.map((_, i) => `$${i + 1}`);
    const values = fields.map((field) => record[field]);

    try {
        const { rows } = await pool.query(
            `INSERT INTO images (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
            values,
        );
        return fromRow(rows[0]);
    } catch (err) {
        // Two identical uploads landing at the same instant both pass the pre-insert
        // findByContentHash check; the UNIQUE constraint is the real guarantee.
        if (isUniqueViolation(err) && record.contentHash) {
            const existing = await findByContentHash(record.contentHash);
            if (existing) return existing;
        }
        throw err;
    }
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

export async function findByContentHash(hash: string): Promise<ImageMetadata | undefined> {
    const { rows } = await pool.query('SELECT * FROM images WHERE content_hash = $1 LIMIT 1', [hash]);
    return rows[0] ? fromRow(rows[0]) : undefined;
}

export async function checkDatabaseConnection(): Promise<void> {
    await pool.query('SELECT 1');
}

const INCIDENT_GROUPING_LOCK_KEY = 727100;

// ponytail: one global advisory lock serializes the "find nearest incident or create
// one" decision across concurrent /ingest calls, closing the race where two near-
// simultaneous uploads in the same area/window each miss the other's uncommitted row
// and create two incidents instead of one. Global (not per-region) because traffic here
// is low enough that serializing this one step is unmeasurable; a per-bucket lock would
// only be worth the added complexity at much higher throughput.
export async function withIncidentGroupingLock<T>(fn: () => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock($1)', [INCIDENT_GROUPING_LOCK_KEY]);
        const result = await fn();
        await client.query('COMMIT');
        return result;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export interface BoundingBox {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
}

// One row per incident (its most recent image) within a map viewport — per
// docs/storage/Storage_and_metadata_V2.md section 7, the Map Page reads coordinates,
// severity_score, and assessment_status for markers.
export async function findInBoundingBox(bounds: BoundingBox): Promise<ImageMetadata[]> {
    const { rows } = await pool.query(
        `SELECT DISTINCT ON (incident_id) *
         FROM images
         WHERE latitude BETWEEN $1 AND $2 AND longitude BETWEEN $3 AND $4
         ORDER BY incident_id, "timestamp" DESC`,
        [bounds.minLat, bounds.maxLat, bounds.minLon, bounds.maxLon],
    );
    return rows.map(fromRow);
}

// All images for one incident — the Incident Page joins the full record plus
// storage_path and severity_explanation (V2 doc section 7).
export async function findByIncidentId(incidentId: string): Promise<ImageMetadata[]> {
    const { rows } = await pool.query('SELECT * FROM images WHERE incident_id = $1 ORDER BY "timestamp" DESC', [incidentId]);
    return rows.map(fromRow);
}

// Dispatch order — the Order Page reads priority_rank (V2 doc section 7). Prioritisation
// logic itself doesn't exist yet (a separate, not-yet-built phase per the docs), so this
// is just the sort; priority_rank is null for every row until that logic is built.
export async function findOrderedByPriority(): Promise<ImageMetadata[]> {
    const { rows } = await pool.query(
        `SELECT * FROM images ORDER BY priority_rank ASC NULLS LAST, "timestamp" DESC`,
    );
    return rows.map(fromRow);
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
