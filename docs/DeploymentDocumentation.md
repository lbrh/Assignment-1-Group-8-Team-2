## IBM Cloud / watsonx.ai Deployment (macOS)

# Prerequisites:
You need access to the itz-watsonx-event-001 IBM Technology Zone reservation account.
You also need the IBM Cloud CLI installed locally.


# 1. Check your Mac's chip type first

Open Terminal and run:

uname -m

If this returns arm64, you have Apple Silicon. If it returns x86_64, you have an Intel Mac. You'll need this to pick the right download in the next step.

# 2. Install the IBM Cloud CLI

Go to https://github.com/IBM-Cloud/ibm-cloud-cli-release/releases/ and click the latest version at the top of the list to open that release's own page.

The download link is not a normal file attachment on this page. There is no Assets section with a ready file to click. Instead, read through the written description text on that release page itself, the actual download link is inline within that text, and it points out to an IBM-hosted file, not hosted on GitHub. Look for a filename matching the chip type you found out before, for example IBM_Cloud_CLI_2.47.0_macos_arm64.tgz for Apple Silicon, or the equivalent without arm64 in the name for an Intel Mac.

Download that file, extract it, and move the ibmcloud binary somewhere on your PATH, for example /usr/local/bin.

Verify the install using these commands:
ibmcloud -v
ibmcloud login

The first command confirms the binary is installed and working. The second confirms you can actually authenticate with it.

# 3. Join and switch into the account

Accept the itz-watsonx-event-001 reservation invitation, from the Notifications icon on cloud.ibm.com or the email invite, if you have not already. Then use the account switcher near your profile icon and select itz-watsonx-event-001.

Once switched, target the correct resource group:
ibmcloud target -g itz-wxo-6a7a76ec3dae69a2d9ca20

# 4. Confirm the existing watsonx.ai Studio and Runtime instances are actually yours

This account already has watsonx.ai Studio-jp, watsonx.ai Studio-ud, and watsonx.ai Runtime-xe provisioned. Don't just click into each and assume it's fine if it opens. Open each resource's Details panel and check the "Created by" field. If it shows your own account, it's genuinely yours. If it shows someone else's, it isn't, even if it opens without an error.

# 5. Create a project and deployment space, from the right starting point

Studio, Runtime, and the project all need to sit in the same region. This isn't optional, a mismatch will fail.

Don't start from the generic project creation page at dataplatform.cloud.ibm.com/projects?context=wx. That page can wrongly report "Your Lite services must be created in the same service region" even when everything actually is in the same region, because it isn't scoped to any particular region itself.

Instead, go to your Studio instance in the IBM Cloud resource list and click its "Launch in" button. This takes you to the region-specific address for your instance, something like <region>.dai.cloud.ibm.com, and avoids the false error entirely.

From there, create a new project. Use the existing Cloud Object Storage instance in this account for file storage rather than creating a new one.

Create a deployment space next, with a name distinct from the project if the project's name is already taken. Set its stage to Development, not Production, and associate it with watsonx.ai Runtime-xe.

# 6. Generate an API key

Go to Manage, then Access (IAM), then API keys, and create one. This may come back tied to a Service ID rather than a personal identity, which is expected in this account.

Note down these four values:

Project ID, found in the project's Manage/General settings
Deployment Space ID, found in the space's settings
Region: au-syd
The API key itself, shown only once, so save it securely

# 7. Local environment setup

Add these to your local .env file. Never commit this file.

IBM_CLOUD_API_KEY=
WATSONX_PROJECT_ID=
WATSONX_SPACE_ID=
WATSONX_REGION=

# 8. Verify access
ibmcloud login --apikey <the api key>
ibmcloud target -g itz-wxo-6a7a76ec3dae69a2d9ca20
ibmcloud resource service-instances

A successful, non-empty response confirms the credentials and access are real and reach the correct account.

Out of scope for this setup

IBM Cloud Code Engine is not required. This project's app stays on Vercel for the frontend and Firebase Functions for the backend. watsonx.ai is called through its API, not hosted alongside the app.

No product or model logic is included here. This document covers environment access only.

## IBM Cloud / watsonx.ai Setup (Windows)

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