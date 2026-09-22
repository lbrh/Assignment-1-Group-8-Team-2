import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import express from 'express';
import { Pool } from 'pg';
import { ingestionRouter } from '../src/routes/ingestion.routes.ts';
import { deleteImage } from '../src/storage/cos.service.ts';

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

function ingestForm(bytes: string) {
    const form = new FormData();
    form.append('image', new Blob([Buffer.from(bytes)]), 'photo.jpg');
    form.append('source_type', 'citizen');
    form.append('latitude', '-37.8136');
    form.append('longitude', '144.9631');
    form.append('timestamp', '2026-09-19T00:00:00.000Z');
    return form;
}

test('re-uploading the same image bytes returns the existing record instead of a duplicate', async () => {
    const { close, url } = await startServer();
    const bytes = `dedup-test-${Date.now()}`;
    try {
        const first = await fetch(`${url}/ingest`, { method: 'POST', body: ingestForm(bytes) });
        assert.equal(first.status, 201);
        const firstBody = await first.json();

        const second = await fetch(`${url}/ingest`, { method: 'POST', body: ingestForm(bytes) });
        assert.equal(second.status, 201);
        const secondBody = await second.json();

        assert.equal(secondBody.imageId, firstBody.imageId);

        const { rows } = await pool.query('SELECT count(*) FROM images WHERE content_hash = $1', [firstBody.contentHash]);
        assert.equal(Number(rows[0].count), 1, 'only one row should exist for this content hash');

        await deleteImage(firstBody.storagePath);
        await pool.query('DELETE FROM images WHERE image_id = $1', [firstBody.imageId]);
    } finally {
        close();
    }
});
