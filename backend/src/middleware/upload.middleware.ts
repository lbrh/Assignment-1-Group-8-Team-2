import multer from 'multer';
import type { NextFunction, Request, Response } from 'express';

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // generous for a phone photo, caps abuse

// Ingestion API only ever receives one image per request (V2 doc section 1).
const multerUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
}).single('image');

export function upload(req: Request, res: Response, next: NextFunction): void {
    multerUpload(req, res, (err: unknown) => {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            res.status(413).json({ error: `image exceeds ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB limit` });
            return;
        }
        if (err) {
            next(err);
            return;
        }
        next();
    });
}
