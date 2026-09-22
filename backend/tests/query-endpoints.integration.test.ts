import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import express from 'express';
import { Pool } from 'pg';
import { ingestionRouter } from '../src/routes/ingestion.routes.ts';
import { incidentsRouter } from '../src/routes/incidents.ts';
import { deleteImage } from '../src/storage/cos.service.ts';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
after(() => pool.end());

function startServer() {
    const app = express();
    app.use(express.json());
    app.use(ingestionRouter);
    app.use(incidentsRouter);
    return new Promise<{ close: () => void; url: string }>((resolve) => {
        const server = app.listen(0, () => {
            const { port } = server.address() as AddressInfo;
            resolve({ close: () => server.close(), url: `http://127.0.0.1:${port}` });
        });
    });
}

function ingestForm(bytes: string, latitude: string, longitude: string) {
    const form = new FormData();
    form.append('image', new Blob([Buffer.from(bytes)]), 'photo.jpg');
    form.append('source_type', 'citizen');
    form.append('latitude', latitude);
    form.append('longitude', longitude);
    form.append('timestamp', '2026-09-19T00:00:00.000Z');
    return form;
}

async function cleanup(image: { storagePath: string | null; imageId: string }) {
    if (image.storagePath) await deleteImage(image.storagePath);
    await pool.query('DELETE FROM images WHERE image_id = $1', [image.imageId]);
}

test('GET /incidents returns a marker within the given viewport and excludes ones outside it', async () => {
    const { close, url } = await startServer();
    const tag = Date.now();
    try {
        const inside = await fetch(`${url}/ingest`, {
            method: 'POST',
            body: ingestForm(`bbox-inside-${tag}`, '-37.80', '144.90'),
        }).then((r) => r.json());
        const outside = await fetch(`${url}/ingest`, {
            method: 'POST',
            body: ingestForm(`bbox-outside-${tag}`, '-38.50', '145.50'),
        }).then((r) => r.json());

        const res = await fetch(`${url}/incidents?minLat=-37.9&maxLat=-37.7&minLon=144.8&maxLon=145.0`);
        assert.equal(res.status, 200);
        const incidents: { incidentId: string }[] = await res.json();

        assert.ok(incidents.some((i) => i.incidentId === inside.incidentId));
        assert.ok(!incidents.some((i) => i.incidentId === outside.incidentId));

        await cleanup(inside);
        await cleanup(outside);
    } finally {
        close();
    }
});

test('GET /incidents rejects a request missing bounding box params', async () => {
    const { close, url } = await startServer();
    try {
        const res = await fetch(`${url}/incidents?minLat=-37.9`);
        assert.equal(res.status, 400);
    } finally {
        close();
    }
});

test('GET /incidents/:id returns every image for that incident', async () => {
    const { close, url } = await startServer();
    const tag = Date.now();
    try {
        const first = await fetch(`${url}/ingest`, {
            method: 'POST',
            body: ingestForm(`incident-detail-a-${tag}`, '-37.82', '144.92'),
        }).then((r) => r.json());
        const second = await fetch(`${url}/ingest`, {
            method: 'POST',
            body: (() => {
                const form = ingestForm(`incident-detail-b-${tag}`, '-37.821', '144.921');
                form.set('incident_id', first.incidentId);
                return form;
            })(),
        }).then((r) => r.json());

        const res = await fetch(`${url}/incidents/${first.incidentId}`);
        assert.equal(res.status, 200);
        const images: { imageId: string }[] = await res.json();
        const ids = images.map((i) => i.imageId);
        assert.ok(ids.includes(first.imageId));
        assert.ok(ids.includes(second.imageId));

        await cleanup(first);
        await cleanup(second);
    } finally {
        close();
    }
});

test('GET /incidents/:id returns 404 for an unknown incident', async () => {
    const { close, url } = await startServer();
    try {
        const res = await fetch(`${url}/incidents/00000000-0000-0000-0000-000000000000`);
        assert.equal(res.status, 404);
    } finally {
        close();
    }
});

test('GET /order returns images sorted with null priority_rank last', async () => {
    const { close, url } = await startServer();
    const tag = Date.now();
    try {
        const image = await fetch(`${url}/ingest`, {
            method: 'POST',
            body: ingestForm(`order-test-${tag}`, '-37.83', '144.93'),
        }).then((r) => r.json());

        const res = await fetch(`${url}/order`);
        assert.equal(res.status, 200);
        const ordered: { imageId: string; priorityRank: number | null }[] = await res.json();
        assert.ok(ordered.some((i) => i.imageId === image.imageId));

        await cleanup(image);
    } finally {
        close();
    }
});
