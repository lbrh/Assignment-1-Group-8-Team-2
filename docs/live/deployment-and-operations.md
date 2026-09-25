# Deployment and Operations

**Status:** Live
**Owner:** Liam Robinson Hounsell (Dev 2), Htet (Dev 1)
**Last updated:** 2026-09-25
**Supersedes:** [Sprint 1 deployment doc](../archive/sprint-1/setup/DeploymentDocumentation.md) (which predates Code Engine hosting and said Vercel/Firebase)

---

## 1. Where things run

| Thing | Where |
|---|---|
| IBM Cloud account / region / resource group | `itz-saas-281` · `ca-tor` · `Default` |
| Code Engine project | `assignment-1-backend` |
| Backend app | `assignment-1-backend` → https://assignment-1-backend.2f2h3a30vd69.ca-tor.codeengine.appdomain.cloud |
| Frontend app | `assignment-1-frontend` |
| Container registry | `ca.icr.io/assignment1group8team2/{backend,frontend}`, tagged by git SHA |
| Backend config | Code Engine secret `backend-secrets` (mounted with env-from-secret) + plain env `FRONTEND_ORIGIN` |
| Database | Neon Postgres: prod (`DATABASE_URL`) and staging (`STAGING_DATABASE_URL`), see §4 |
| Models | watsonx.ai Runtime deployment space, ca-tor |

## 2. CI/CD

| Workflow | Trigger | Does |
|---|---|---|
| `ci.yml` | PR into `main` | Frontend lint/typecheck/build/test. Backend typecheck, applies `schema.sql` to **staging**, runs tests against staging. |
| `deploy.yml` | Push to `prod`, or manual run | Same checks against staging, then builds both images, pushes to ICR, `ibmcloud ce application update --image …` for each app. The backend job applies `schema.sql` to **prod** after its image is pushed, just before the update. |

- `application update --image` only swaps the image. **Environment and secrets are not touched by a deploy.**
- Workflows run Node 24. The Dockerfiles use `node:25-alpine`, which no longer ships corepack, so the frontend Dockerfile installs `pnpm@12` with npm.

## 3. Changing configuration

Update the secret from a local env file. Keys are added or updated, not removed (`--rm KEY` removes one):

```bash
ibmcloud ce project select --name assignment-1-backend
ibmcloud ce secret update --name backend-secrets --from-env-file backend/.env
```

The app reads the secret at start-up, so roll a new revision to pick it up:

```bash
ibmcloud ce app update --name assignment-1-backend --env SECRETS_REFRESHED_AT="$(date +%s)"
```

Before pushing a local `.env`, compare it with what prod has. On 2026-09-24 all shared keys matched; `ALLOWED_API_KEYS` exists only in the secret.

**Swapping a model:** set its `WATSONX_*_DEPLOYMENT_ID` and roll a revision. See [AI models](ai-models-and-dataset.md#swapping-in-a-new-model).

## 4. Database changes

Two Neon databases, as GitHub repository secrets:

| Secret | Database | Touched by |
|---|---|---|
| `STAGING_DATABASE_URL` | staging / dev | `ci.yml` on every PR (schema + tests), `deploy.yml` tests |
| `DATABASE_URL` | prod | `deploy.yml` only: the backend deploy job, after tests pass and the image is built |

- A PR never touches prod. Prod gets `schema.sql` in the backend deploy job, moments before the new image rolls out. The old code runs against the new schema for that window, so **keep schema changes additive**: add columns and tables, don't drop or rename in the same deploy as the code change.
- `psql` runs with `ON_ERROR_STOP=1`, so a failing statement fails the job instead of deploying half a migration.
- Local development: point `backend/.env` at staging.
- Still shared: the `COS_*` secrets. CI's ingestion test uploads real files to the prod bucket.

## 5. Live checks

A test script against prod (run 2026-09-24) confirmed:
- health, API-key rejection (401) and region rejection (400)
- upload (201), exact-duplicate return, incident and order reads, signed URL
- background classification writing smoke, flame and vegetation within about 10 s
- the rubric via `/assess`

Test records left in prod: incident `01a0d172-26e0-722c-94fa-c4e35935fbf6` at -34.05, 141.0 (two images, one marked severity 4 by the manual test).

Logs:

```bash
ibmcloud ce app logs --name assignment-1-backend --tail 200
```

## 6. Registry housekeeping

Keep the images the live revisions use (and optionally the previous one for rollback). Delete everything else, index first, then its two children. Old backend images from before 2026-09-24 write the dropped `structure_people_proximity` column and **cannot be rolled back to**.
