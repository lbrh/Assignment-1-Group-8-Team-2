import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateIngestion, ValidationError } from '../src/pipeline/validate.ts';

const VALID = { sourceType: 'citizen' as const, latitude: -37.8136, longitude: 144.9631, timestamp: '2026-09-19T00:00:00.000Z' };

test('accepts a valid submission', () => {
    assert.doesNotThrow(() => validateIngestion({ ...VALID }));
});

test('rejects a missing source_type', () => {
    assert.throws(() => validateIngestion({ ...VALID, sourceType: undefined as never }), ValidationError);
});

test('rejects an unknown source_type', () => {
    assert.throws(() => validateIngestion({ ...VALID, sourceType: 'satellite-drone' as never }), ValidationError);
});

test('rejects missing coordinates', () => {
    assert.throws(() => validateIngestion({ ...VALID, latitude: undefined }), ValidationError);
    assert.throws(() => validateIngestion({ ...VALID, longitude: undefined }), ValidationError);
});

test('rejects coordinates outside the global lat/lon range', () => {
    assert.throws(() => validateIngestion({ ...VALID, latitude: 91 }), ValidationError);
    assert.throws(() => validateIngestion({ ...VALID, longitude: 181 }), ValidationError);
});

test('rejects coordinates inside the global range but outside the operating region', () => {
    // Sydney — valid lat/lon, but outside the Victoria placeholder bounding box.
    assert.throws(() => validateIngestion({ ...VALID, latitude: -33.8688, longitude: 151.2093 }), ValidationError);
});

test('rejects a missing timestamp', () => {
    assert.throws(() => validateIngestion({ ...VALID, timestamp: undefined }), ValidationError);
});
