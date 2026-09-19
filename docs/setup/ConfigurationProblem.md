# Configuration Issues: IBM Cloud / watsonx.ai Environment

IBM Cloud reservation resources appeared owned, but were inaccessible

# Symptom: 
After accepting an IBM Technology Zone reservation, several watsonx.ai resources appeared in the personal IBM Cloud account's resource list under plain, ordinary-looking names. Clicking into them returned "you cannot access this resource because it's owned by a different account."

# Root cause: 
Accepting the reservation grants view access across resources tied to it, including instances that carry no obvious naming signal of that origin. Naming alone is not a reliable way to judge ownership on this platform.

# Status: 
Resolved. Every resource was individually confirmed accessible before being treated as owned. Two resources were confirmed genuinely owned and kept. New Studio and Runtime instances were provisioned separately once the mismatch was identified.

# IBM Cloud account issuse

The IBM Cloud account doesn't have much access to many services, could possibly be the wrong account even while using the right criteria.

# Symptom:
Code Engine service is blocked by a paywall requring me to upgrade the account even though I have perfect access to other services. This could suggest the account might be created the wrong way. The account name is, also, my personal name, whereas, through cross-referencing and collaborating with other team (as suggested by supervisor and client), the IBM cloud account name should be the team's name.

# Root cause:
It is unknown what the root cause of this blocker is due to the fact that I followed every step given by IBM on creating an account.

# Status:
Unresolved. Some resources are blocked by paywalls and need upgraded account. Otherwise, every other feature works as intended and the login credentials are the same as provided.

(Documentation have had AI reformatting and paraphrase but using fundamental original ideas of my own)