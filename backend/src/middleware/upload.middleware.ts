import multer from 'multer';

// Ingestion API only ever receives one image per request (V2 doc section 1).
export const upload = multer({ storage: multer.memoryStorage() }).single('image');
