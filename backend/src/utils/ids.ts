import { randomUUID } from 'node:crypto';
import { v7 as uuidv7 } from 'uuid';

// incident_id is UUIDv7 (time-ordered, so it sorts chronologically) per the V2 schema.
// Node's crypto.randomUUID only produces v4, hence the uuid package for v7.
export function newIncidentId(): string {
    return uuidv7();
}

export function newImageId(): string {
    return randomUUID();
}
