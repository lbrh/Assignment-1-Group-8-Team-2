import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Request, Response } from 'express';

// The middleware reads ALLOWED_API_KEYS once at import time, so it must be set before
// the (dynamic) import below rather than via a static import at the top of the file.
process.env.ALLOWED_API_KEYS = 'frontend:frontend-secret,drone:drone-secret';
const { requireApiKey } = await import('../src/middleware/api-key.middleware.ts');

function fakeReq(apiKey?: string): Request {
    return { header: (name: string) => (name.toLowerCase() === 'x-api-key' ? apiKey : undefined) } as unknown as Request;
}

function fakeRes() {
    const res = {
        statusCode: 0,
        body: undefined as unknown,
        status(code: number) {
            res.statusCode = code;
            return res;
        },
        json(body: unknown) {
            res.body = body;
            return res;
        },
    };
    return res as unknown as Response & typeof res;
}

test('rejects a request with no api key', () => {
    const res = fakeRes();
    let nextCalled = false;
    requireApiKey(fakeReq(), res, () => {
        nextCalled = true;
    });
    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
});

test('rejects a request with an unknown api key', () => {
    const res = fakeRes();
    let nextCalled = false;
    requireApiKey(fakeReq('not-a-real-key'), res, () => {
        nextCalled = true;
    });
    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
});

test('accepts a request with a valid api key', () => {
    const res = fakeRes();
    let nextCalled = false;
    requireApiKey(fakeReq('frontend-secret'), res, () => {
        nextCalled = true;
    });
    assert.equal(nextCalled, true);
    assert.equal(res.statusCode, 0);
});

test('accepts a different valid caller from the same allowlist', () => {
    const res = fakeRes();
    let nextCalled = false;
    requireApiKey(fakeReq('drone-secret'), res, () => {
        nextCalled = true;
    });
    assert.equal(nextCalled, true);
});
