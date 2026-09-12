## IBM Cloud / watsonx.ai Setup (Windows)

# Prerequisites:
Prerequisites and requirements are covered in Development Setup Requirements. This document assumes those are already met and covers the actual steps in order.

# 1. Check your Mac's chip type first

Open Terminal and run:

uname -m

arm64 means Apple Silicon. x86_64 means Intel. You'll need this for the next step.

# 2. Install the IBM Cloud CLI

Go to https://github.com/IBM-Cloud/ibm-cloud-cli-release/releases/ and click the latest version to open that release's own page.

There's no ready-made download button here. Read through the written text of that release page itself, the actual download link is inline within it, pointing out to an IBM-hosted file rather than something attached to GitHub directly. Look for the filename matching your chip, for example IBM_Cloud_CLI_2.47.0_macos_arm64.tgz for Apple Silicon, or the same without arm64 in the name for Intel.

Extract the downloaded file and move the ibmcloud binary onto your PATH, for example into /usr/local/bin.

Verify with:
ibmcloud -v
ibmcloud login

# 3. Join and switch into the account

Accept the itz-watsonx-event-001 reservation invitation, then switch into it using the account switcher near your profile icon.

Target the correct resource group:
ibmcloud target -g itz-wxo-6a7a76ec3dae69a2d9ca20

# 4. Confirm the existing watsonx.ai Studio and Runtime instances are actually yours

Open each resource's Details panel and check the "Created by" field against your own account. If it matches, it's genuinely yours. If it doesn't, it isn't, even if it opens without an error.

# 5. Create a project, from the right starting point

Studio, Runtime, and the project all need to be in the same region, this is required, not optional.

Don't use the generic project creation page. It can wrongly say your services are in different regions even when they aren't. Instead, go to your Studio instance in the resource list and click its "Launch in" button, which takes you to the correct region-specific page.

From there, create a new project, attaching the existing Cloud Object Storage instance for file storage.

# 6. Create a deployment space

Create it separately from the project, with a distinct name if the project's name is already taken. Set its stage to Development, and associate it with the Runtime instance. A space without a linked Runtime instance can exist but cannot run any deployments.

# 7. Generate an API key

Go to Manage, then Access (IAM), then API keys, and create one. Record the project ID, the deployment space ID, the region, and the key itself. The key is shown only once.

# 8. Set up local environment variables

Add these to your local .env file, which should never be committed:

IBM_CLOUD_API_KEY=
WATSONX_PROJECT_ID=
WATSONX_SPACE_ID=
WATSONX_REGION=

# 9. Verify access
ibmcloud login --apikey <your key>
ibmcloud target -g itz-wxo-6a7a76ec3dae69a2d9ca20
ibmcloud resource service-instances

## IBM Cloud / watsonx.ai Setup (Windows)

# Prerequisites:
Prerequisites and requirements are covered in Development Setup Requirements. This document assumes those are already met and covers the actual steps in order.

# 1. Install the IBM Cloud CLI

Go to https://github.com/IBM-Cloud/ibm-cloud-cli-release/releases/, the source IBM's own documentation points to for a manual install. Download the release built for your system. On Windows, look for the entry labeled win64.

Extract the package and place it somewhere permanent, for example C:\IBM\Cloud\bin. Add that folder to your system PATH.

Verify with:
ibmcloud -v
ibmcloud login

# 2. Provision watsonx.ai Studio and Runtime

Search "watsonx" in the IBM Cloud catalog. Create a watsonx.ai Studio instance and a watsonx.ai Runtime instance.

Before treating either as usable, click into it and confirm it opens normally. If it returns an access-denied error mentioning a different account, it is not actually yours, even if the name looks ordinary. This is the Lite plan and reservation issue covered in Development Setup Requirements.

# 3. Create a project

Inside Studio, create a new project. Attach a Cloud Object Storage instance for file storage, creating one on the Lite plan if you don't already have one.

# 4. Create a deployment space

Create a deployment space separately from the project. Associate it with your Runtime instance during creation. A space without a linked Runtime instance can exist but cannot run any deployments.

# 5. Generate an API key

Go to Manage, then Access (IAM), then API keys, and create one. Record the project ID, the deployment space ID, the region, and the key itself. The key is shown only once.

# 6. Set up local environment variables

Add these to your local .env file, which should never be committed:

IBM_CLOUD_API_KEY=
WATSONX_PROJECT_ID=
WATSONX_SPACE_ID=
WATSONX_REGION=

# 7. Verify access
ibmcloud login --apikey <your key>
ibmcloud resource service-instances

(Documentation have had AI reformatting and paraphrase but using fundamental original ideas of my own)