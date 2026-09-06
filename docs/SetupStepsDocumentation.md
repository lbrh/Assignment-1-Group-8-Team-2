Setup Steps

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