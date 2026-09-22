import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import express from 'express';
import { upload } from '../src/middleware/upload.middleware.ts';

function startServer() {
    const app = express();
    app.post('/upload', upload, (req, res) => {
        res.status(200).json({ received: true });
    });
    return new Promise<{ close: () => void; url: string }>((resolve) => {
        const server = app.listen(0, () => {
            const { port } = server.address() as AddressInfo;
            resolve({ close: () => server.close(), url: `http://127.0.0.1:${port}` });
        });
    });
}

test('accepts a file under the size limit', async () => {
    const { close, url } = await startServer();
    try {
        const form = new FormData();
        form.append('image', new Blob([Buffer.from('a small file')]), 'photo.jpg');
        const res = await fetch(`${url}/upload`, { method: 'POST', body: form });
        assert.equal(res.status, 200);
    } finally {
        close();
    }
});

test('rejects a file over the 15MB limit with 413', async () => {
    const { close, url } = await startServer();
    try {
        const oversized = Buffer.alloc(16 * 1024 * 1024, 1);
        const form = new FormData();
        form.append('image', new Blob([oversized]), 'photo.jpg');
        const res = await fetch(`${url}/upload`, { method: 'POST', body: form });
        assert.equal(res.status, 413);
    } finally {
        close();
    }
});
