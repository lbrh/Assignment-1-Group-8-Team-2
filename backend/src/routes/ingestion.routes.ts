import { Router, type Request, type Response } from 'express';
import { upload } from '../middleware/upload.middleware.ts';
import { processImage, ValidationError } from '../pipeline/index.ts';
import { logger, errorMeta } from '../utils/logger.ts';

export const ingestionRouter: Router = Router();

// Single ingestion API, shared by the web form and any direct API client (drone/CCTV/
// satellite) per docs/storage/Storage_and_metadata_V2.md section 1.
ingestionRouter.post('/ingest', upload, async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).json({ error: 'image file is required' });
        return;
    }

    const { source_type, latitude, longitude, timestamp, incident_id } = req.body;

    try {
        const record = await processImage(
            {
                sourceType: source_type,
                latitude: latitude !== undefined ? Number(latitude) : undefined,
                longitude: longitude !== undefined ? Number(longitude) : undefined,
                timestamp,
                incidentId: incident_id,
            },
            { buffer: req.file.buffer, mimetype: req.file.mimetype, originalname: req.file.originalname },
        );
        res.status(201).json(record);
    } catch (err) {
        if (err instanceof ValidationError) {
            res.status(400).json({ error: err.message });
            return;
        }
        logger.error('ingest failed', errorMeta(err));
        res.status(500).json({ error: 'internal error' });
    }
});
