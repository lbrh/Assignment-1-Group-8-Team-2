# Development Setup

**Status:** Live
**Owner:** Htet (Dev 1), Liam Robinson Hounsell (Dev 2)
**Last updated:** 2026-09-24
**Supersedes:** [Setup requirements](../archive/sprint-1/setup/DevelopmentSetupRequirements.md) · [Setup steps](../archive/sprint-1/setup/SetupStepsDocumentation.md) · [watsonx verification](../archive/sprint-1/setup/watsonx-Setup-Verification.md) · [Configuration problems](../archive/sprint-1/setup/ConfigurationProblem.md)

---

## 1. Tools

- **Node.js 24+.** The backend runs TypeScript directly (`node index.ts`) using Node's type stripping.
- **pnpm** for the frontend (`corepack enable`, or `npm i -g pnpm@12`).
- **IBM Cloud CLI** with the `code-engine` and `container-registry` plugins.
  - **macOS:** the GitHub release page has no attached assets. The download link (for example `IBM_Cloud_CLI_2.47.0_macos_arm64.tgz`) is inline in the release notes text. Check your chip with `uname -m`.
  - **Windows:** download the `win64` release, extract it to for example `C:\IBM\Cloud\bin`, and add that folder to PATH. A manual install can't use `ibmcloud update`.
- **For training:** Python 3.13 with PyTorch/torchvision, Pillow, numpy, and Ollama with `qwen2.5vl:7b` for labelling.

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env    # fill in values; see architecture.md §4 for each variable
npm start               # http://localhost:3000
npm test                # node --test; live watsonx tests skip if their env vars are unset
```

The database tests need `DATABASE_URL` and apply to whatever database it points at. Use a dev branch, not prod.

## 3. Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

## 4. IBM Cloud and watsonx

1. Log in: `ibmcloud login --apikey <key> -r ca-tor`, then `ibmcloud target -g Default`.
2. **Check resources are really yours.** Open each resource's Details panel and compare "Created by" with your IBMid. Reservation accounts can show resources you can see but not use.
3. **Same region for everything.** watsonx.ai Studio, Runtime, the project and the deployment space must be in one region. Create projects from the Studio instance's own **Launch in** button (`<region>.dai.cloud.ibm.com`). The generic `dataplatform.cloud.ibm.com` page wrongly reports "Lite services must be created in the same service region".
4. Put the project ID, space ID, region and API keys in `backend/.env`. Never commit it.
5. Verify with `ibmcloud resource service-instances`: it should show a non-empty, `active` list.

## 5. Known account issues

- The original Techzone reservation (`itz-watsonx-event-001`) and a personal account both had problems. A personal account had Code Engine behind a paywall, and reservation resources could be seen but not used. The project now runs in account `itz-saas-281`.
- The Techzone sandbox has a 3-hour idle timeout and a fixed expiry, so long training or evaluation sessions need re-checking.
