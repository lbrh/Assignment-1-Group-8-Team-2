# AI-Powered Bushfire Situational Awareness & Emergency Response

Ingests bushfire imagery (citizen uploads, drone/CCTV/satellite feeds) through a single API, stores the image and its metadata, and runs an AI severity assessment so emergency coordinators can see incidents on a map ranked by severity instead of reviewing photos manually.

Client: IBM · Team 8 — AI for Emergency & Environmental Response, Team B

## Architecture

```
Web form ─┐
Drone/CCTV/─┼─► POST /ingest ─► Cloud Object Storage (image)
Satellite  ┘         │          Postgres (metadata record)
                     │
                     ▼ background, ~10 s
        4 indicator models on watsonx.ai Runtime
        (smoke, flame, vegetation, infrastructure)
                     │
                     ▼
        rubric → severity 1–4, confidence, explanation
                     │
                     ▼
   GET /incidents, /order ─► frontend (Map / Incident / Order pages)
```

- **Backend** (`backend/`) — Express + TypeScript API: ingestion, storage, metadata, and severity assessment.
- **Frontend** (`frontend/`) — Next.js app: Map, Incident, Order, and Image Submission pages.

See [`docs/live/architecture.md`](docs/live/architecture.md) for the full pipeline and API, [`docs/live/severity-rubric.md`](docs/live/severity-rubric.md) for how severity is scored, and [`docs/live/ai-models-and-dataset.md`](docs/live/ai-models-and-dataset.md) for the models.

## Prerequisites

- Node.js 24+ (the backend runs TypeScript directly via `node index.ts`, which needs Node's native type-stripping support)
- A Postgres database (currently a Neon project; see [`docs/live/metadata-schema.md`](docs/live/metadata-schema.md))
- IBM Cloud Object Storage credentials (image storage)
- An IBM Cloud / watsonx.ai account for the AI severity assessment — see [`docs/live/dev-setup.md`](docs/live/dev-setup.md) for full setup steps (macOS and Windows)

## Running locally

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in the values below
npm start
```

Runs on `http://localhost:3000`. Required `.env` values (see `backend/.env.example`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string for metadata |
| `COS_ENDPOINT`, `COS_BUCKET`, `COS_ACCESS_KEY_ID`, `COS_SECRET_ACCESS_KEY` | Cloud Object Storage for images |
| `IBM_CLOUD_API_KEY`, `WATSONX_API_KEY`, `WATSONX_PROJECT_ID`, `WATSONX_SPACE_ID`, `WATSONX_REGION` | watsonx.ai access |
| `WATSONX_*_DEPLOYMENT_ID` (smoke, flame, vegetation, infrastructure) | One per indicator model; unset skips that indicator |
| `ALLOWED_API_KEYS` | `name:key` pairs allowed to call the API |

Full list: [`docs/live/architecture.md`](docs/live/architecture.md#4-configuration).

Run backend tests with:

```bash
npm test
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Runs on `http://localhost:3000` by default — start it on a different port (e.g. `pnpm dev -p 3001`) if the backend is already running.

## API endpoints

All routes except `/` and `/health` need an `x-api-key` header.

| Endpoint | Description |
|---|---|
| `POST /ingest` | Upload an image with `source_type`, `latitude`, `longitude`, `timestamp` (optional `incident_id`). Returns the record immediately; severity is scored in the background. |
| `GET /incidents?minLat&maxLat&minLon&maxLon` | Records in a map viewport |
| `GET /incidents/:id` | Every image record in an incident, including severity |
| `GET /order` | Records by dispatch priority |
| `GET /images/:id` | Signed, time-limited download link for the image |
| `POST /images/:id/assess` | Score an image from manually supplied indicator labels |

Details: [`docs/live/architecture.md`](docs/live/architecture.md#3-api).

## Documentation

See [`docs/README.md`](docs/README.md). In short:

- [`docs/live/`](docs/live): current requirements, rubric, architecture, schema, models, deployment, setup, UI, open questions
- [`docs/decisions/decision-log.md`](docs/decisions/decision-log.md): every decision and why it was made
- [`docs/archive/`](docs/archive): past sprint documents, frozen
