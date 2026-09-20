import express, { type Express, type Request, type Response } from 'express';
import { ingestionRouter } from './src/routes/ingestion.routes.ts';
import { imagesRouter } from './src/routes/images.routes.ts';
import { incidentsRouter } from './src/routes/incidents.ts';

const app: Express = express();
const port = 3000;

// Health check
app.get('/', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

// Ingestion routes
app.use(ingestionRouter);

// Image read routes
app.use(imagesRouter);

// AI severity assessment routes
app.use(incidentsRouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});