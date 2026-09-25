import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { toPreview } from '../src/routes/images.routes.ts';

test('previews are WebP, fit inside the requested width, and never upscale', async () => {
    const big = await sharp({ create: { width: 3000, height: 2000, channels: 3, background: '#c33' } }).jpeg().toBuffer();
    const meta = await sharp(await toPreview(big, 800)).metadata();
    assert.equal(meta.format, 'webp');
    assert.equal(meta.width, 800);
    assert.equal(meta.height, 533);

    const small = await sharp({ create: { width: 120, height: 90, channels: 3, background: '#3c3' } }).png().toBuffer();
    assert.equal((await sharp(await toPreview(small, 800)).metadata()).width, 120);
});
