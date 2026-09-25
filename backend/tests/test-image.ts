import sharp from 'sharp';

// A real, decodable PNG whose pixels come from `seed`: different seeds give different
// bytes (dedup treats them as new images), the same seed gives identical bytes.
export async function testImage(seed: string): Promise<Uint8Array<ArrayBuffer>> {
    const px = Buffer.from(seed);
    const raw = Buffer.alloc(px.length * 3);
    px.forEach((b, i) => (raw[i * 3] = b));
    return new Uint8Array(await sharp(raw, { raw: { width: px.length, height: 1, channels: 3 } }).png().toBuffer());
}
