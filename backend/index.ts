import express, { type Express, type Request, type Response } from 'express';
import { ingestionRouter } from './src/routes/ingestion.routes.ts';
import { imagesRouter } from './src/routes/images.routes.ts';
import { incidentsRouter } from './src/routes/incidents.ts';
import { requireApiKey } from './src/middleware/api-key.middleware.ts';
import { rateLimit } from './src/middleware/rate-limit.middleware.ts';
import { cors } from './src/middleware/cors.middleware.ts';
import { checkDatabaseConnection } from './src/metadata/metadata.repository.ts';
import { logger, errorMeta } from './src/utils/logger.ts';

const app: Express = express();
const port = 3000;

app.use(cors);

// Liveness: process is up, no dependency checks (fast, always 200 while running).
app.get('/', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

// Readiness: dependencies are actually reachable. Kept separate from '/' so a slow DB
// doesn't fail a liveness probe and trigger an unnecessary restart loop.
app.get('/health', async (req: Request, res: Response) => {
    try {
        await checkDatabaseConnection();
        res.json({ status: 'ok', database: 'reachable' });
    } catch (err) {
        logger.error('health check failed', errorMeta(err));
        res.status(503).json({ status: 'unhealthy' });
    }
});

// Ingestion routes
app.use(requireApiKey, rateLimit, ingestionRouter);

// Image read routes
app.use(requireApiKey, rateLimit, imagesRouter);

// AI severity assessment routes
app.use(requireApiKey, rateLimit, incidentsRouter);

const server = app.listen(port, () => {
    logger.info('app listening', { port });
});

// Code Engine sends SIGTERM on scale-down; finish in-flight requests instead of
// dropping them mid-upload.
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
});
