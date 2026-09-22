import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {
    softmax,
    smokeDensityFromLogits,
    classifySmokeDensity,
    flameVisibilityFromLogits,
    classifyFlameVisibility,
} from '../src/ai/indicator-models.ts';

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

// Exercises the assumed (alphabetical) label mapping against a real scored response
// (logits from scoring an arbitrary screenshot) — NOT a confirmed-correct example like
// smokeDensityFromLogits's test above, just a check that the mapping code runs and picks
// the argmax consistently. If flame_visibility predictions look systematically wrong,
// this assumed order (see FLAME_VISIBILITY_LABELS) is the first thing to check.
test('flameVisibilityFromLogits picks the argmax under the assumed label order', () => {
    const result = flameVisibilityFromLogits([-6.502318859100342, 4.367894649505615, -1.334071397781372, -1.8025118112564087]);

    assert.equal(result.value, 'no_visible_flame');
    assert.ok(result.confidence > 0.99, `confidence: ${result.confidence}`);
});

// Hits the real watsonx.ai Runtime deployment — skipped when its credentials aren't
// configured (e.g. a machine without this project's watsonx access).
const hasWatsonxSmokeDensity = Boolean(process.env.WATSONX_API_KEY && process.env.WATSONX_SMOKE_DENSITY_DEPLOYMENT_ID);
const hasWatsonxFlameVisibility = Boolean(process.env.WATSONX_API_KEY && process.env.WATSONX_FLAME_VISIBILITY_DEPLOYMENT_ID);

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

test(
    'classifyFlameVisibility returns a valid label and confidence from the real deployment',
    { skip: !hasWatsonxFlameVisibility && 'WATSONX_API_KEY / WATSONX_FLAME_VISIBILITY_DEPLOYMENT_ID not configured' },
    async () => {
        const pngBuffer = await sharp({
            create: { width: 64, height: 64, channels: 3, background: { r: 200, g: 200, b: 200 } },
        })
            .png()
            .toBuffer();

        const result = await classifyFlameVisibility(pngBuffer);

        assert.ok(
            [
                'no_visible_flame',
                'some_flame',
                'visible_high_flames_and_embers',
                'large_flame_wall_embers_everywhere',
            ].includes(result.value),
        );
        assert.ok(result.confidence > 0 && result.confidence <= 1);
    },
);
