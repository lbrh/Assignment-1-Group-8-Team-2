import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {
    softmax,
    predictionFromLogits,
    classifyIndicator,
    isIndicatorConfigured,
    INDICATOR_MODELS,
    type Indicator,
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
test('smoke labels map a real scored example to the confirmed label', () => {
    const result = predictionFromLogits(INDICATOR_MODELS.smokeDensity.labels, [0.3225570023059845, 2.1680192947387695, 0.8309815526008606, -6.968880653381348]);

    assert.equal(result.value, 'moderate');
    assert.ok(Math.abs(result.confidence - 0.704) < 0.001, `confidence: ${result.confidence}`);
});

// Real logits from scoring an arbitrary screenshot, just a check the mapping picks the argmax.
test('flame labels pick the argmax', () => {
    const result = predictionFromLogits(INDICATOR_MODELS.flameVisibility.labels, [-6.502318859100342, 4.367894649505615, -1.334071397781372, -1.8025118112564087]);

    assert.equal(result.value, 'no_visible_flame');
    assert.ok(result.confidence > 0.99, `confidence: ${result.confidence}`);
});

test('predictionFromLogits rejects a model whose output count does not match its labels', () => {
    assert.throws(() => predictionFromLogits(INDICATOR_MODELS.vegetationImpact.labels, [0.1, 0.2, 0.3]), /3 outputs, expected 4/);
});

// Hits each real watsonx.ai Runtime deployment that's configured — skipped otherwise
// (e.g. a machine without this project's watsonx access).
for (const indicator of Object.keys(INDICATOR_MODELS) as Indicator[]) {
    const configured = Boolean(process.env.WATSONX_API_KEY) && isIndicatorConfigured(indicator);
    test(
        `classifyIndicator(${indicator}) returns a valid label and confidence from the real deployment`,
        { skip: !configured && `WATSONX_API_KEY / ${INDICATOR_MODELS[indicator].envVar} not configured` },
        async () => {
            const pngBuffer = await sharp({
                create: { width: 64, height: 64, channels: 3, background: { r: 200, g: 200, b: 200 } },
            })
                .png()
                .toBuffer();

            const result = await classifyIndicator(indicator, pngBuffer);

            assert.ok((INDICATOR_MODELS[indicator].labels as readonly string[]).includes(result.value));
            assert.ok(result.confidence > 0 && result.confidence <= 1);
        },
    );
}
