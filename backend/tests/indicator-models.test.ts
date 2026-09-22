import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { softmax, smokeDensityFromLogits, classifySmokeDensity } from '../src/ai/indicator-models.ts';

test('softmax sums to 1 and picks the largest logit as most probable', () => {
    const probabilities = softmax([-0.64, -2.01, 2.80, -3.76]);
    const sum = probabilities.reduce((a, b) => a + b, 0);

    assert.ok(Math.abs(sum - 1) < 1e-9, `should sum to 1, got ${sum}`);
    assert.equal(probabilities.indexOf(Math.max(...probabilities)), 2);
});

test('softmax is stable for large logits (no NaN/Infinity)', () => {
    const probabilities = softmax([1000, 1001, 999, 998]);
    assert.ok(probabilities.every((p) => Number.isFinite(p)));
});

// Locks in a real scored example against the confirmed class order (alphabetical:
// dense_dark, moderate, none_or_haze, very_dense_blocking_vision) — logits
// [0.323, 2.168, 0.831, -6.969] softmax to [11.1%, 70.4%, 18.5%, 0.0%], predicting
// moderate. If this ever fails, the class order assumption is the first thing to check.
test('smokeDensityFromLogits maps a real scored example to the confirmed label', () => {
    const result = smokeDensityFromLogits([0.3225570023059845, 2.1680192947387695, 0.8309815526008606, -6.968880653381348]);

    assert.equal(result.value, 'moderate');
    assert.ok(Math.abs(result.confidence - 0.704) < 0.001, `confidence: ${result.confidence}`);
});

// Hits the real watsonx.ai Runtime deployment — skipped when its credentials aren't
// configured (e.g. a machine without this project's watsonx access).
const hasWatsonxSmokeDensity = Boolean(process.env.WATSONX_API_KEY && process.env.WATSONX_SMOKE_DENSITY_DEPLOYMENT_ID);

test(
    'classifySmokeDensity returns a valid label and confidence from the real deployment',
    { skip: !hasWatsonxSmokeDensity && 'WATSONX_API_KEY / WATSONX_SMOKE_DENSITY_DEPLOYMENT_ID not configured' },
    async () => {
        const pngBuffer = await sharp({
            create: { width: 64, height: 64, channels: 3, background: { r: 200, g: 200, b: 200 } },
        })
            .png()
            .toBuffer();

        const result = await classifySmokeDensity(pngBuffer);

        assert.ok(
            ['none_or_haze', 'moderate', 'dense_dark', 'very_dense_blocking_vision'].includes(result.value),
        );
        assert.ok(result.confidence > 0 && result.confidence <= 1);
    },
);
