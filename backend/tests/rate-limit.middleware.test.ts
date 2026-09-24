import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Request, Response } from 'express';
import { rateLimit } from '../src/middleware/rate-limit.middleware.ts';

function fakeReq(key: string): Request {
    return { header: () => key, ip: key } as unknown as Request;
}

function fakeRes() {
    const res = {
        statusCode: 0,
        status(code: number) {
            res.statusCode = code;
            return res;
        },
        json() {
            return res;
        },
    };
    return res as unknown as Response & typeof res;
}

// Each test uses its own key so the module-level hit counter doesn't leak between tests.

test('allows requests under the limit', () => {
    const key = 'unit-test-under-limit';
    for (let i = 0; i < 30; i++) {
        const res = fakeRes();
        let nextCalled = false;
        rateLimit(fakeReq(key), res, () => {
            nextCalled = true;
        });
        assert.equal(nextCalled, true, `request ${i + 1} should have been allowed`);
    }
});

test('blocks requests once the limit is exceeded', () => {
    const key = 'unit-test-over-limit';
    for (let i = 0; i < 30; i++) {
        rateLimit(fakeReq(key), fakeRes(), () => {});
    }
    const res = fakeRes();
    let nextCalled = false;
    rateLimit(fakeReq(key), res, () => {
        nextCalled = true;
    });
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 429);
});

test('tracks separate callers independently', () => {
    const a = 'unit-test-caller-a';
    const b = 'unit-test-caller-b';
    for (let i = 0; i < 30; i++) {
        rateLimit(fakeReq(a), fakeRes(), () => {});
    }
    const res = fakeRes();
    let nextCalled = false;
    rateLimit(fakeReq(b), res, () => {
        nextCalled = true;
    });
    assert.equal(nextCalled, true);
});

test('clients behind the same proxy key get separate budgets', () => {
    const proxied = (ip: string) =>
        ({
            header: (name: string) =>
                name === 'x-forwarded-for' ? `${ip}, 10.0.0.1` : 'unit-test-shared-proxy-key',
            ip: '10.0.0.1',
        }) as unknown as Request;
    for (let i = 0; i < 30; i++) {
        rateLimit(proxied('203.0.113.1'), fakeRes(), () => {});
    }
    let blocked = true;
    rateLimit(proxied('203.0.113.1'), fakeRes(), () => {
        blocked = false;
    });
    assert.equal(blocked, true);
    let otherAllowed = false;
    rateLimit(proxied('203.0.113.2'), fakeRes(), () => {
        otherAllowed = true;
    });
    assert.equal(otherAllowed, true);
});
