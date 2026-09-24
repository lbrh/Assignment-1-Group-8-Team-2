import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { preprocessImage } from '../src/ai/preprocess-image.ts';

test('produces a (1, 3, 128, 128) tensor from an arbitrary image', async () => {
    // A real decodable image is required (sharp needs to actually parse it) — any size,
    // any content; a solid-colour PNG generated on the fly avoids depending on a repo file.
    const pngBuffer = await sharp({
        create: { width: 300, height: 200, channels: 3, background: { r: 10, g: 120, b: 200 } },
    })
        .png()
        .toBuffer();

    const tensor = await preprocessImage(pngBuffer);

    assert.equal(tensor.length, 1, 'batch dimension');
    assert.equal(tensor[0].length, 3, 'channel dimension (RGB)');
    assert.equal(tensor[0][0].length, 128, 'height');
    assert.equal(tensor[0][0][0].length, 128, 'width');
});

test('normalizes a known solid colour against the ImageNet mean/std', async () => {
    // Pure red (255,0,0): channel 0 should normalize to (1 - 0.485) / 0.229, channels 1/2
    // to (0 - mean) / std. Confirms the normalization math, not just the shape.
    const pngBuffer = await sharp({
        create: { width: 16, height: 16, channels: 3, background: { r: 255, g: 0, b: 0 } },
    })
        .png()
        .toBuffer();

    const tensor = await preprocessImage(pngBuffer);
    const [r, g, b] = [tensor[0][0][0][0], tensor[0][1][0][0], tensor[0][2][0][0]];

    assert.ok(Math.abs(r - (1 - 0.485) / 0.229) < 1e-3, `red channel: ${r}`);
    assert.ok(Math.abs(g - (0 - 0.456) / 0.224) < 1e-3, `green channel: ${g}`);
    assert.ok(Math.abs(b - (0 - 0.406) / 0.225) < 1e-3, `blue channel: ${b}`);
});
