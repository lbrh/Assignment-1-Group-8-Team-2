# IBM Cloud / watsonx.ai Setup

# Prerequisites:
You need an IBM Cloud account to get started.
You also need the IBM Cloud CLI installed locally.

# 1. Install the IBM Cloud CLI

Go to the official releases page at https://github.com/IBM-Cloud/ibm-cloud-cli-release/releases/. This is the source that IBM's own documentation at cloud.ibm.com/docs/cli points you to for a manual install.

Find the latest release at the top of the page. Look through its attached files for the one built for the system. On Windows, look for the entry labeled win64 (or win32 if you're on an older 32-bit system). Download that file.

Extract the downloaded package. Once extracted, you should see these files:

LICENSE
NOTICE
ibmcloud-analytics.exe
ibmcloud.exe

Place the extracted folder somewhere permanent, for example C:\IBM\Cloud\bin, and add that folder to the system PATH so ibmcloud is callable from any terminal. To test it in the current PowerShell session before setting it up permanently through Windows System Properties:

($env:Path += ";C:\IBM\Cloud\bin")

Verify the install using these commands:
ibmcloud -v
ibmcloud login

The first command confirms the binary is on your PATH and working. The second confirms you can actually authenticate with it.

One tradeoff worth knowing. A manual, custom-directory install cannot use the built-in ibmcloud update command later. Future version upgrades need to be done the same way, by downloading a new release and replacing the files, rather than running an automatic updater.


# 2. Provision watsonx.ai Studio and Runtime

Search "watsonx" in the IBM Cloud catalog. Don't use the Containers category. Create two services:

watsonx.ai Studio. This is where the project lives.
watsonx.ai Runtime. This backs the deployment space and actually runs deployments.

Known gotcha. IBM Cloud allows only one Lite-plan instance of a given service per resource group. If you're joined to any IBM Technology Zone reservation or similar shared event environment beforehand, you may see a pre-existing instance of Studio or Runtime already occupying that slot. Clicking into it may return "you cannot access this resource because it's owned by a different account." If this happens:

Confirm ownership by clicking into every resource before assuming it's yours. A plain, ordinary-looking name is not a reliable signal of ownership.
Try deleting the inaccessible instance from its resource detail page rather than the full app view. That may free the quota slot.
If deletion is also blocked, try a paid plan instead of Lite for the new instance. This only works once your account can support billed usage.

# 3. Create a project and deployment space

Inside watsonx.ai Studio, create a new project. This needs a Cloud Object Storage instance for file storage. Create one on the Lite plan if you don't already have one.

Create a deployment space next. Note that spaces are not nested under projects. They're independent. The link between them happens later, per asset, when you promote something from the project to the space.

When creating the space, associate it with the watsonx.ai Runtime instance. This is the step that actually gives the space the ability to run deployments. A space without a linked Runtime instance can exist but can't deploy anything.

# 4. Generate an API key

Go to Manage, then Access (IAM), then API keys, and create one. This is an account-level key, not tied to any specific service. It's what CI and local scripts use to authenticate.

Note down these four values:

Project ID, found in the project's Manage/General settings
Deployment Space ID, found in the space's settings
Region
The API key itself, shown only once, so save it securely

# 5. Local environment setup

Add these to the local .env file. Never commit this file.

IBM_CLOUD_API_KEY= 
WATSONX_PROJECT_ID= 
WATSONX_SPACE_ID= 
WATSONX_REGION= 

# 6. Verify access
ibmcloud login --apikey <the api key>
ibmcloud resource service-instances

A successful, non-empty response confirms the credentials and access are real and working, not borrowed from any shared or reservation environment.

Out of scope for this setup

IBM Cloud Code Engine is not required. It's for hosting a running application or container. This project's app stays on Vercel for the frontend and Firebase Functions for the backend. watsonx.ai is called through its API, not hosted alongside the app.

No product or model logic is included here. This document covers environment access only.

(Documentation have had AI reformatting and paraphrase but using fundamental original ideas of my own)