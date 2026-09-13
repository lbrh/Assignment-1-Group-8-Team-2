# watsonx.ai Setup Verification (Dev 1 instructions)

Verified independently against `SetupStepsDocumentation.md` and `DeploymentDocumentation.md`, on macOS (arm64), 2026-09-06.

## Environment

- IBM Cloud CLI 2.47.0 installed manually (macOS arm64 binary, no Homebrew) at `~/ibmcloud-cli`, added to `PATH` via `~/.zshrc`.
- Logged in and confirmed working:
  ```
  ibmcloud login --apikey <key> -r ca-tor
  ibmcloud resource service-instances
  ```
  Returns: `Cloud Object Storage-gb`, `WatsonMachineLearning`, `WatsonStudio`, `watsonx.governance` - all `active`, same resource group.

## Cloud resources

| Resource             | Name                                 | Region           | Notes                                                                                           |
| -------------------- | ------------------------------------ | ---------------- | ----------------------------------------------------------------------------------------------- |
| watsonx.ai Studio    | WatsonStudio                         | ca-tor (Toronto) | Pre-existing, created 8/24/2026 by this account's own IBMid - not a shared/reservation instance |
| watsonx.ai Runtime   | WatsonMachineLearning                | ca-tor (Toronto) | Same as above                                                                                   |
| Cloud Object Storage | Cloud Object Storage-gb              | global           | Auto-attached when creating the project                                                         |
| Project              | IBM Capstone - AI Emergency Response | ca-tor           | ID: `24987c3e-1685-41f7-98b7-4086a37fba7d`                                                      |
| Deployment space     | IBM Capstone - Deployment Space      | ca-tor           | ID: `2f0bea78-436d-4bfa-b3c0-5e9e49a8a12a`, linked to WatsonMachineLearning                     |

`.env` and `.env.example` updated with `IBM_CLOUD_API_KEY`, `WATSONX_PROJECT_ID`, `WATSONX_SPACE_ID`, `WATSONX_REGION=ca-tor`.

## Setup failures / unclear instructions found

1. **No macOS install path documented.** Both setup docs only cover the Windows manual install (win64 `.exe`, PowerShell `$env:Path`). There's no equivalent for macOS/Linux - needed to source the macOS arm64 binary tarball from the release notes body on GitHub (`IBM_Cloud_CLI_2.47.0_macos_arm64.tgz`), since the GitHub release itself ships no attached assets, only links out to IBM's own CDN.
2. **Region isn't called out as a hard requirement.** The docs don't mention that watsonx.ai Studio, Runtime, and the project must all sit in the same region. Hit this directly: the account already had Studio + Runtime in `ca-tor` (Toronto) from an earlier session, and going through the generic project-creation entry point (`dataplatform.cloud.ibm.com/projects?context=wx`) failed with _"Your Lite services must be created in the same service region"_ even though everything actually was in the same region. Fix: launch the project creation flow from the existing service instance's own "Launch in" button (routes to the region-specific `<region>.dai.cloud.ibm.com` URL) instead of the generic multi-region entry point.
3. **"Confirm it's actually yours" step needs a concrete method.** The docs flag the Lite-plan/reservation gotcha but don't say how to check. Used the resource's Details panel -> "Created by" field, matched against the logged-in IBMid, to confirm both existing instances belonged to this account and weren't borrowed from a shared reservation.

None of these blocked completion - all worked around - but worth tightening in the docs for the next person following them on a Mac.

## Final test result

`ibmcloud resource service-instances` returned a non-empty, `active` list of all four resources under the account, confirming credentials and access are real (see Environment section above). Deployment space confirmed linked to the Runtime instance via its Manage page.
