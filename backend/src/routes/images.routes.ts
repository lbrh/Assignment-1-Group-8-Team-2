import { Router, type Request, type Response } from 'express';
import sharp from 'sharp';
import * as metadataRepository from '../metadata/metadata.repository.ts';
import { downloadImage, getSignedUrl } from '../storage/cos.service.ts';
import { logger, errorMeta } from '../utils/logger.ts';

export const imagesRouter: Router = Router();

// Signed, time-limited read URL for the Map/Incident/Order pages (V2 doc section 5) —
// clients read images this way and never hold a COS credential themselves.
imagesRouter.get('/images/:id', async (req: Request<{ id: string }>, res: Response) => {
    const record = await metadataRepository.get(req.params.id);
    if (!record) {
        res.status(404).json({ error: 'image not found' });
        return;
    }
    if (!record.storagePath) {
        res.status(409).json({ error: 'image is not stored yet', uploadStatus: record.uploadStatus });
        return;
    }

    try {
        const url = await getSignedUrl(record.storagePath);
        res.json({ url });
    } catch (err) {
        logger.error('signed url failed', errorMeta(err));
        res.status(500).json({ error: err instanceof Error ? err.message : 'internal error' });
    }
});

// Preview widths the UI asks for: list thumbnails and the incident / review image panel.
const PREVIEW_WIDTHS = new Set([240, 800]);

/** Downscaled WebP for on-screen previews; the full-resolution original stays one click away. */
export function toPreview(original: Buffer, width: number): Promise<Buffer> {
    return sharp(original)
        .rotate() // honour EXIF orientation before it's stripped
        .resize({ width, height: width, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 72 })
        .toBuffer();
}

// ponytail: resized on every request, leaning on the year-long browser cache below (an image
// never changes once stored); write previews to COS at ingest if repeat cold loads get heavy.
imagesRouter.get('/images/:id/preview', async (req: Request<{ id: string }>, res: Response) => {
    const width = Number(req.query.w ?? 800);
    if (!PREVIEW_WIDTHS.has(width)) {
        res.status(400).json({ error: `w must be one of ${[...PREVIEW_WIDTHS].join(', ')}` });
        return;
    }
    const record = await metadataRepository.get(req.params.id);
    if (!record) {
        res.status(404).json({ error: 'image not found' });
        return;
    }
    if (!record.storagePath) {
        res.status(409).json({ error: 'image is not stored yet', uploadStatus: record.uploadStatus });
        return;
    }

    try {
        const preview = await toPreview(await downloadImage(record.storagePath), width);
        res.set('Cache-Control', 'private, max-age=31536000, immutable').type('image/webp').send(preview);
    } catch (err) {
        logger.error('preview failed', errorMeta(err));
        res.status(500).json({ error: 'internal error' });
    }
});
