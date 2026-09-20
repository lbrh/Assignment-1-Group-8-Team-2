import { Router, type Request, type Response } from 'express';
import * as metadataRepository from '../metadata/metadata.repository.ts';
import { getSignedUrl } from '../storage/cos.service.ts';

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
        res.status(500).json({ error: err instanceof Error ? err.message : 'internal error' });
    }
});
