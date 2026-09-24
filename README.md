# AI-Powered Bushfire Situational Awareness & Emergency Response

Ingests bushfire imagery (citizen uploads, drone/CCTV/satellite feeds) through a single API, stores the image and its metadata, and runs an AI severity assessment so emergency coordinators can see incidents on a map ranked by severity instead of reviewing photos manually.

Client: IBM · Team 8 — AI for Emergency & Environmental Response, Team B

## Architecture

```
Web form ─┐
Drone/CCTV/─┼─► POST /ingest ─► Cloud Object Storage (image)
Satellite  ┘         │          Postgres (metadata record)
                      ▼
              POST /images/:id/assess ─► severity_score + explanation
                      │
                      ▼
        GET /images/:id ─► signed read URL ─► frontend (Map/Incident/Order pages)
```

- **Backend** (`backend/`) — Express + TypeScript API: ingestion, storage, metadata, and severity assessment.
- **Frontend** (`frontend/`) — Next.js app: Map, Incident, Order, and Image Submission pages.

See [`docs/storage/Storage_and_metadata_V2.md`](docs/storage/Storage_and_metadata_V2.md) for the full ingestion pipeline design and metadata schema, and [`docs/ai-ml/AI_Framework_and_Technical_Approach.md`](docs/ai-ml/AI_Framework_and_Technical_Approach.md) for the severity-classification approach.

## Prerequisites

- Node.js 24+ (the backend runs TypeScript directly via `node index.ts`, which needs Node's native type-stripping support)
- A Postgres database (currently a Neon project; see [`docs/storage/Storage_and_Metadata_Finalisation_Addendum.md`](docs/storage/Storage_and_Metadata_Finalisation_Addendum.md))
- IBM Cloud Object Storage credentials (image storage)
- An IBM Cloud / watsonx.ai account for the AI severity assessment — see [`docs/setup/DevelopmentSetupRequirements.md`](docs/setup/DevelopmentSetupRequirements.md) and [`docs/setup/SetupStepsDocumentation.md`](docs/setup/SetupStepsDocumentation.md) for full setup steps (macOS and Windows)

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
| `IBM_CLOUD_API_KEY`, `WATSONX_PROJECT_ID`, `WATSONX_SPACE_ID`, `WATSONX_REGION` | watsonx.ai severity assessment |

Run backend tests with:

```bash
npm test
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000` by default — start it on a different port (e.g. `npm run dev -- -p 3001`) if the backend is already running.

## API endpoints

| Endpoint | Description |
|---|---|
| `POST /ingest` | Upload an image with metadata (`source_type`, `latitude`, `longitude`, `timestamp`, `incident_id`). Shared by the web form and any direct API client (drone/CCTV/satellite). |
| `GET /images/:id` | Returns a signed, time-limited read URL for the stored image. |
| `POST /images/:id/assess` | Runs the AI severity assessment and stores the result. |

## Documentation

More detailed docs live under [`docs/`](docs), organised by area:

- [`docs/requirements/`](docs/requirements) — target users, requirements, and acceptance criteria
- [`docs/ai-ml/`](docs/ai-ml) — AI framework selection, dataset status, and technical approach
- [`docs/storage/`](docs/storage) — ingestion pipeline and metadata schema
- [`docs/setup/`](docs/setup) — IBM Cloud / watsonx.ai environment setup
- [`docs/ui/`](docs/ui) — UI research, mockups, and prototypes
