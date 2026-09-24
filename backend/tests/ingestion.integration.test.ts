import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import express from 'express';
import { Pool } from 'pg';
import { ingestionRouter } from '../src/routes/ingestion.routes.ts';
import { deleteImage } from '../src/storage/cos.service.ts';
import { testImage } from './test-image.ts';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
after(() => pool.end());

function startServer() {
    const app = express();
    app.use(ingestionRouter);
    return new Promise<{ close: () => void; url: string }>((resolve) => {
        const server = app.listen(0, () => {
            const { port } = server.address() as AddressInfo;
            resolve({ close: () => server.close(), url: `http://127.0.0.1:${port}` });
        });
    });
}

test('rejects a submission missing required fields', async () => {
    const { close, url } = await startServer();
    try {
        const form = new FormData();
        form.append('image', new Blob([await testImage(`ingest-${Date.now()}`)]), 'photo.jpg');
        // source_type/latitude/longitude/timestamp intentionally omitted

        const res = await fetch(`${url}/ingest`, { method: 'POST', body: form });
        assert.equal(res.status, 400);
    } finally {
        close();
    }
});

test('creates a metadata record for a valid submission', async () => {
    const { close, url } = await startServer();
    try {
        const form = new FormData();
        form.append('image', new Blob([await testImage(`ingest-${Date.now()}`)]), 'photo.jpg');
        form.append('source_type', 'citizen');
        form.append('latitude', '-37.8136');
        form.append('longitude', '144.9631');
        form.append('timestamp', '2026-09-19T00:00:00.000Z');

        const res = await fetch(`${url}/ingest`, { method: 'POST', body: form });
        assert.equal(res.status, 201);

        const body = await res.json();
        assert.equal(body.sourceType, 'citizen');
        assert.equal(body.assessmentStatus, 'pending_review');
        // Real COS credentials are configured (backend/.env), so this hits the actual
        // bucket — the upload is expected to succeed, not fail.
        assert.equal(body.uploadStatus, 'stored');
        assert.equal(body.ingestionError, null);
        assert.ok(body.storagePath);

        await deleteImage(body.storagePath);
        await pool.query('DELETE FROM images WHERE image_id = $1', [body.imageId]);
    } finally {
        close();
    }
});
