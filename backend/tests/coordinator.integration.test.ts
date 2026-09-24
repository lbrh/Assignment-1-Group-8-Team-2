import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { randomUUID } from 'node:crypto';
import express from 'express';
import { Pool } from 'pg';
import { coordinatorRouter } from '../src/routes/coordinator.routes.ts';
import { incidentsRouter } from '../src/routes/incidents.ts';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
after(() => pool.end());

function startServer(caller: string) {
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
        res.locals.caller = caller; // stands in for requireApiKey
        next();
    });
    app.use(coordinatorRouter);
    app.use(incidentsRouter);
    return new Promise<{ close: () => void; url: string }>((resolve) => {
        const server = app.listen(0, () => {
            const { port } = server.address() as AddressInfo;
            resolve({ close: () => server.close(), url: `http://127.0.0.1:${port}` });
        });
    });
}

// Inserts a flagged (below-threshold) image directly — no COS upload needed for these routes.
async function seedFlaggedImage() {
    const incidentId = randomUUID();
    const imageId = randomUUID();
    await pool.query(
        `INSERT INTO images (image_id, incident_id, "timestamp", source_type, latitude, longitude,
            severity_score, confidence_score, assessment_status, classification_label, upload_status)
         VALUES ($1, $2, now(), 'citizen', -37.8, 144.9, 3, 0.6, 'unable_to_assess', 'fire', 'stored')`,
        [imageId, incidentId],
    );
    return { incidentId, imageId };
}

async function cleanup(incidentId: string) {
    await pool.query('DELETE FROM decisions WHERE incident_id = $1', [incidentId]);
    await pool.query('DELETE FROM incident_dispatch WHERE incident_id = $1', [incidentId]);
    await pool.query('DELETE FROM images WHERE incident_id = $1', [incidentId]);
}

const json = (method: string, body: unknown) => ({
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
});

test('review confirm, undo, dispatch and extinguish are applied, logged, and visible on the incident', async () => {
    const { close, url } = await startServer('frontend');
    const { incidentId, imageId } = await seedFlaggedImage();
    try {
        // confirm the AI's provisional tag
        let res = await fetch(
            `${url}/images/${imageId}/decision`,
            json('PATCH', { severityScoreOverride: 3, classificationLabelOverride: 'fire', assessmentStatus: 'assessed', by: 'EC' }),
        );
        assert.equal(res.status, 200);
        let image = await res.json();
        assert.equal(image.severityScoreOverride, 3);
        assert.equal(image.assessmentStatus, 'assessed');
        assert.equal(image.severityScore, 3, 'AI output is never overwritten');
        assert.equal(image.overriddenBy, 'EC');

        // undo = send the previous values back
        res = await fetch(
            `${url}/images/${imageId}/decision`,
            json('PATCH', { severityScoreOverride: null, classificationLabelOverride: null, assessmentStatus: 'unable_to_assess', by: 'EC' }),
        );
        image = await res.json();
        assert.equal(image.severityScoreOverride, null);
        assert.equal(image.assessmentStatus, 'unable_to_assess');

        // dispatch, then extinguish
        for (const state of ['live', 'extinguished']) {
            res = await fetch(`${url}/incidents/${incidentId}/dispatch`, json('PUT', { state, by: 'EC' }));
            assert.equal(res.status, 200);
        }

        // the incident read now carries the dispatch state
        const images = await fetch(`${url}/incidents/${incidentId}`).then((r) => r.json());
        assert.equal(images[0].dispatchState, 'extinguished');

        // 3 fields confirmed + 3 undone + 2 dispatch changes, newest first, with before/after
        const decisions = await fetch(`${url}/incidents/${incidentId}/decisions`).then((r) => r.json());
        assert.equal(decisions.length, 8);
        assert.deepEqual(
            { field: decisions[0].field, from: decisions[0].fromValue, to: decisions[0].toValue, by: decisions[0].decidedBy },
            { field: 'dispatchState', from: 'live', to: 'extinguished', by: 'EC' },
        );
        assert.ok(decisions.some((d: { field: string; fromValue: string; toValue: string }) =>
            d.field === 'severityScoreOverride' && d.fromValue === null && d.toValue === '3'));
    } finally {
        close();
        await cleanup(incidentId);
    }
});

test('a no-op decision logs nothing, unknown ids 404, bad input 400', async () => {
    const { close, url } = await startServer('frontend');
    const { incidentId, imageId } = await seedFlaggedImage();
    try {
        await fetch(`${url}/images/${imageId}/decision`, json('PATCH', { assessmentStatus: 'unable_to_assess', by: 'EC' }));
        const decisions = await fetch(`${url}/incidents/${incidentId}/decisions`).then((r) => r.json());
        assert.equal(decisions.length, 0);

        assert.equal((await fetch(`${url}/images/${randomUUID()}/decision`, json('PATCH', { assessmentStatus: 'assessed', by: 'EC' }))).status, 404);
        assert.equal((await fetch(`${url}/images/not-a-uuid/decision`, json('PATCH', { assessmentStatus: 'assessed', by: 'EC' }))).status, 404);
        assert.equal((await fetch(`${url}/incidents/${randomUUID()}/dispatch`, json('PUT', { state: 'live', by: 'EC' }))).status, 404);
        assert.equal((await fetch(`${url}/incidents/${incidentId}/dispatch`, json('PUT', { state: 'on_fire', by: 'EC' }))).status, 400);
    } finally {
        close();
        await cleanup(incidentId);
    }
});

test('only the frontend caller may make coordinator decisions', async () => {
    const { close, url } = await startServer('classifier');
    const { incidentId, imageId } = await seedFlaggedImage();
    try {
        const res = await fetch(`${url}/images/${imageId}/decision`, json('PATCH', { assessmentStatus: 'assessed', by: 'EC' }));
        assert.equal(res.status, 403);
    } finally {
        close();
        await cleanup(incidentId);
    }
});
