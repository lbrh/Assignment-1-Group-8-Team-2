# Development Setup Requirements

# Accounts needed

The account for this project is the IBM Technology Zone reservation account, itz-watsonx-event-001. Accept the reservation invitation first, from the Notifications icon on cloud.ibm.com or the email invite, then switch into this account using the account switcher near your profile icon.

# Tools needed locally

The latest released version of the IBM Cloud CLI with the correct OS type, installed and confirmed working with ibmcloud -v and ibmcloud login.

# Cloud services needed

A watsonx.ai Studio instance, which hosts the project workspace.

A watsonx.ai Runtime instance, which backs the deployment space and actually runs deployments.

A Cloud Object Storage instance, required by any watsonx.ai project for file storage.

All of these Cloud services are required to be in the same region.

# Access needed

An IBM Cloud API key, generated at the account level under Manage, then Access (IAM), then API keys. This is what both local development and CI use to authenticate, and it is separate from any service-specific credentials.

(Documentation have had AI reformatting and paraphrase but using fundamental original ideas of my own)