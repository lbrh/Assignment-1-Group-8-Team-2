import { test } from 'node:test';
import assert from 'node:assert/strict';
import { placeFromResult } from '../src/pipeline/place-name.ts';

// Shapes taken from real Nominatim reverse responses (zoom=14) for the demo locations.
test('uses the locality name Nominatim returns', () => {
    assert.equal(placeFromResult({ name: 'Halls Gap', address: { village: 'Halls Gap', state: 'Victoria' } }), 'Halls Gap');
    assert.equal(placeFromResult({ name: 'Olinda', address: { suburb: 'Olinda', city: 'Melbourne' } }), 'Olinda');
});

test('falls back to the most specific address part, then null', () => {
    assert.equal(placeFromResult({ name: '', address: { city_district: 'Whipstick', city: 'Bendigo' } }), 'Whipstick');
    assert.equal(placeFromResult({ address: { county: 'Shire of Hindmarsh', state: 'Victoria' } }), 'Shire of Hindmarsh');
    assert.equal(placeFromResult({}), null);
});
