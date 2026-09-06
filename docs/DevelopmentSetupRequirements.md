# Development Setup Requirements

# Accounts needed

An IBM Cloud account is sufficient for initial development.

# Tools needed locally

The IBM Cloud CLI, installed and confirmed working with ibmcloud -v and ibmcloud login.

# Cloud services needed

A watsonx.ai Studio instance, which hosts the project workspace.

A watsonx.ai Runtime instance, which backs the deployment space and actually runs deployments.

A Cloud Object Storage instance, required by any watsonx.ai project for file storage.

# Access needed

An IBM Cloud API key, generated at the account level under Manage, then Access (IAM), then API keys. This is what both local development and CI use to authenticate, and it is separate from any service-specific credentials.

(Documentation have had AI reformatting and paraphrase but using fundamental original ideas of my own)