import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Request, Response } from 'express';

process.env.FRONTEND_ORIGIN = 'https://example-frontend.test';
const { cors } = await import('../src/middleware/cors.middleware.ts');

function fakeRes() {
    const headers: Record<string, string> = {};
    const res = {
        statusCode: 0,
        headers,
        setHeader(name: string, value: string) {
            headers[name] = value;
        },
        sendStatus(code: number) {
            res.statusCode = code;
            return res;
        },
    };
    return res as unknown as Response & typeof res;
}

test('sets the configured frontend origin on a normal request', () => {
    const res = fakeRes();
    let nextCalled = false;
    cors({ method: 'GET' } as Request, res, () => {
        nextCalled = true;
    });
    assert.equal(res.headers['Access-Control-Allow-Origin'], 'https://example-frontend.test');
    assert.equal(nextCalled, true);
});

test('short-circuits an OPTIONS preflight with 204 and does not call next', () => {
    const res = fakeRes();
    let nextCalled = false;
    cors({ method: 'OPTIONS' } as Request, res, () => {
        nextCalled = true;
    });
    assert.equal(res.statusCode, 204);
    assert.equal(nextCalled, false);
});
