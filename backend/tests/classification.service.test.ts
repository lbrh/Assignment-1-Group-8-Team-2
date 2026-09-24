import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import express from 'express';
import { requestClassification } from '../src/pipeline/classification.service.ts';

// Stubs "the classification service" per the documented contract
// (docs/ai-ml/Dataset_Integration_Interface_for_Htet.md), so this test verifies the
// ingestion side of that contract without needing a real watsonx deployment.
function startStubClassificationService(respond: (body: unknown) => { status: number; body: unknown }) {
    const app = express();
    app.use(express.json());
    let lastRequestBody: unknown;
    app.post('/classify', (req, res) => {
        lastRequestBody = req.body;
        const { status, body } = respond(req.body);
        res.status(status).json(body);
    });
    return new Promise<{ close: () => void; url: string; getLastRequestBody: () => unknown }>((resolve) => {
        const server = app.listen(0, () => {
            const { port } = server.address() as AddressInfo;
            resolve({
                close: () => server.close(),
                url: `http://127.0.0.1:${port}/classify`,
                getLastRequestBody: () => lastRequestBody,
            });
        });
    });
}

test('sends the documented request shape and parses a successful response', async () => {
    const stub = await startStubClassificationService(() => ({
        status: 200,
        body: {
            image_id: 'img-123',
            severity_score: 3,
            confidence_score: 0.81,
            severity_explanation: 'Dense and dark smoke, visible high flames and embers.',
            assessment_status: 'assessed',
            indicators: {
                smoke_density: { value: 'dense_dark', confidence: 0.88 },
                flame_visibility: { value: 'visible_high_flames_and_embers', confidence: 0.81 },
                vegetation_impact: { value: 'moderate_vegetation', confidence: 0.9 },
                infrastructure_impact: { value: 'moderate_infrastructure', confidence: 0.85 },
            },
            model_version: 'indicator-classifier-v0.1',
        },
    }));
    process.env.CLASSIFICATION_SERVICE_URL = stub.url;

    try {
        const result = await requestClassification({
            imageId: 'img-123',
            storagePath: '/inc-1/citizen/2026-01-01T00-00-00.000Z_img-123.jpg',
            sourceType: 'citizen',
        });

        const sentBody = stub.getLastRequestBody() as Record<string, unknown>;
        assert.equal(sentBody.image_id, 'img-123');
        assert.equal(sentBody.storage_path, '/inc-1/citizen/2026-01-01T00-00-00.000Z_img-123.jpg');
        assert.equal(sentBody.source_type, 'citizen');
        assert.equal((sentBody.image_access as Record<string, unknown>).type, 'signed_url');
        assert.ok((sentBody.image_access as Record<string, unknown>).url);

        assert.equal(result?.severityScore, 3);
        assert.equal(result?.confidenceScore, 0.81);
        assert.equal(result?.assessmentStatus, 'assessed');
        assert.equal(result?.smokeDensity, 'dense_dark');
        assert.equal(result?.flameVisibility, 'visible_high_flames_and_embers');
        assert.equal(result?.vegetationImpact, 'moderate_vegetation');
        assert.equal(result?.infrastructureImpact, 'moderate_infrastructure');
    } finally {
        stub.close();
        delete process.env.CLASSIFICATION_SERVICE_URL;
    }
});

test('falls back to pending_review when the classification service is unreachable', async () => {
    process.env.CLASSIFICATION_SERVICE_URL = 'http://127.0.0.1:1/unreachable';

    try {
        const result = await requestClassification({
            imageId: 'img-456',
            storagePath: '/inc-1/citizen/2026-01-01T00-00-00.000Z_img-456.jpg',
            sourceType: 'citizen',
        });

        assert.equal(result?.assessmentStatus, 'pending_review');
        assert.equal(result?.severityScore, null);
    } finally {
        delete process.env.CLASSIFICATION_SERVICE_URL;
    }
});

test('is a no-op when CLASSIFICATION_SERVICE_URL is not configured', async () => {
    delete process.env.CLASSIFICATION_SERVICE_URL;

    const result = await requestClassification({
        imageId: 'img-789',
        storagePath: '/inc-1/citizen/2026-01-01T00-00-00.000Z_img-789.jpg',
        sourceType: 'citizen',
    });

    assert.equal(result, null);
});
