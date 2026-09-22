import { preprocessImage } from './preprocess-image.ts';
import { scoreDeployment } from './watsonx-client.ts';
import type { SmokeDensity, FlameVisibility } from '../metadata/metadata.types.ts';

// Class order confirmed against a real scored example (logits [0.323, 2.168, 0.831,
// -6.969] -> softmax [11.1%, 70.4%, 18.5%, 0.0%] -> moderate predicted at 70.4%,
// matching index 1). It's alphabetical by label name, not the schema's declaration
// order — a common default when a training script builds its label encoding from
// `sorted(set(labels))`.
const SMOKE_DENSITY_LABELS: readonly SmokeDensity[] = [
    'dense_dark',
    'moderate',
    'none_or_haze',
    'very_dense_blocking_vision',
];

// UNCONFIRMED — unlike SMOKE_DENSITY_LABELS, no real scored example has verified this
// order for flame_visibility. Assumed alphabetical by analogy (same owner, same naming
// convention, deployed the same way — bushfire-flame_visibility-classifier-deployment
// alongside bushfire-smoke_density-classifier-deployment, both in the same space), but
// that's an inference, not a confirmation. Verify with a real scored example (a photo
// with an obvious, undisputed flame level) before trusting this in production; if
// predictions look systematically off, this ordering is the first thing to check.
const FLAME_VISIBILITY_LABELS: readonly FlameVisibility[] = [
    'large_flame_wall_embers_everywhere',
    'no_visible_flame',
    'some_flame',
    'visible_high_flames_and_embers',
];

export function softmax(logits: number[]): number[] {
    const max = Math.max(...logits);
    const exps = logits.map((x) => Math.exp(x - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map((x) => x / sum);
}

export interface IndicatorPrediction<T extends string> {
    value: T;
    confidence: number;
}

interface RawScoringResponse {
    predictions: { values: number[][] }[];
}

// Pulled out from classifySmokeDensity so the label-mapping logic (the part that's
// actually easy to get subtly wrong) is directly unit-testable against a known example,
// without needing a real network call.
export function smokeDensityFromLogits(logits: number[]): IndicatorPrediction<SmokeDensity> {
    const probabilities = softmax(logits);
    const bestIndex = probabilities.indexOf(Math.max(...probabilities));
    return { value: SMOKE_DENSITY_LABELS[bestIndex], confidence: probabilities[bestIndex] };
}

// Deployed per docs/ai-ml/AI_Framework_and_Technical_Approach.md's recommended approach:
// one small ONNX classifier per indicator dimension, each its own watsonx.ai Runtime
// deployment. Only smoke_density and flame_visibility are deployed so far; the other two
// indicator functions don't exist yet because their deployments don't either.
export async function classifySmokeDensity(imageBuffer: Buffer): Promise<IndicatorPrediction<SmokeDensity>> {
    const deploymentId = process.env.WATSONX_SMOKE_DENSITY_DEPLOYMENT_ID;
    if (!deploymentId) {
        throw new Error('WATSONX_SMOKE_DENSITY_DEPLOYMENT_ID is not configured');
    }

    const tensor = await preprocessImage(imageBuffer);
    const response = (await scoreDeployment(deploymentId, tensor)) as RawScoringResponse;
    const logits = response.predictions[0].values[0];
    return smokeDensityFromLogits(logits);
}

export function flameVisibilityFromLogits(logits: number[]): IndicatorPrediction<FlameVisibility> {
    const probabilities = softmax(logits);
    const bestIndex = probabilities.indexOf(Math.max(...probabilities));
    return { value: FLAME_VISIBILITY_LABELS[bestIndex], confidence: probabilities[bestIndex] };
}

export async function classifyFlameVisibility(imageBuffer: Buffer): Promise<IndicatorPrediction<FlameVisibility>> {
    const deploymentId = process.env.WATSONX_FLAME_VISIBILITY_DEPLOYMENT_ID;
    if (!deploymentId) {
        throw new Error('WATSONX_FLAME_VISIBILITY_DEPLOYMENT_ID is not configured');
    }

    const tensor = await preprocessImage(imageBuffer);
    const response = (await scoreDeployment(deploymentId, tensor)) as RawScoringResponse;
    const logits = response.predictions[0].values[0];
    return flameVisibilityFromLogits(logits);
}
