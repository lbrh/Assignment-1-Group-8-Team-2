import '../utils/load-env.ts';

const IAM_TOKEN_URL = 'https://iam.cloud.ibm.com/identity/token';

let cachedToken: { token: string; expiresAt: number } | undefined;

// IAM tokens last ~1hr; cache and reuse rather than exchanging on every scoring call.
async function getIamToken(): Promise<string> {
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
        return cachedToken.token;
    }

    const res = await fetch(IAM_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: new URLSearchParams({
            grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
            apikey: process.env.WATSONX_API_KEY ?? '',
        }),
    });
    if (!res.ok) {
        throw new Error(`IAM token exchange failed: ${res.status} ${await res.text()}`);
    }
    const body = await res.json();
    cachedToken = { token: body.access_token, expiresAt: Date.now() + (body.expires_in - 60) * 1000 };
    return cachedToken.token;
}

// Raw watsonx.ai Runtime (Watson Machine Learning) scoring call for a custom ONNX
// deployment. `tensor` is the exact rank-4 array the deployed model expects — see
// preprocess-image.ts for how an image becomes one.
export async function scoreDeployment(deploymentId: string, tensor: number[][][][]): Promise<unknown> {
    const token = await getIamToken();
    const region = process.env.WATSONX_REGION ?? 'ca-tor';

    const res = await fetch(
        `https://${region}.ml.cloud.ibm.com/ml/v4/deployments/${deploymentId}/predictions?version=2021-05-01`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ input_data: [{ values: tensor }] }),
        },
    );

    if (!res.ok) {
        throw new Error(`watsonx scoring failed (${res.status}): ${await res.text()}`);
    }

    return res.json();
}
