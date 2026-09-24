import { preprocessImage } from './preprocess-image.ts';
import { scoreDeployment } from './watsonx-client.ts';
import type { IndicatorReadings } from '../pipeline/assess-severity.ts';

// One small ONNX classifier per indicator, each its own watsonx.ai Runtime deployment
// (docs/ai-ml/AI_Framework_and_Technical_Approach.md). Swapping a model is just pointing
// its envVar at the new deployment ID; unset means that indicator is skipped.
//
// Label order = the model's output order. The training notebooks build it with
// `sorted(df[INDICATOR].unique())`, i.e. alphabetical over the classes present in the
// training data — confirmed for smoke by a real scored example. If a retrained model's
// output count doesn't match its label list (a class missing from its training data),
// classifyIndicator throws rather than silently mislabelling.
export const INDICATOR_MODELS = {
    smokeDensity: {
        envVar: 'WATSONX_SMOKE_DENSITY_DEPLOYMENT_ID',
        labels: ['dense_dark', 'moderate', 'none_or_haze', 'very_dense_blocking_vision'],
    },
    flameVisibility: {
        envVar: 'WATSONX_FLAME_VISIBILITY_DEPLOYMENT_ID',
        labels: [
            'large_flame_wall_embers_everywhere',
            'no_visible_flame',
            'some_flame',
            'visible_high_flames_and_embers',
        ],
    },
    // The currently deployed vegetation model was trained on the old damage-based labels,
    // so its outputs don't mean these yet; correct once retrained on the relabelled subset.
    vegetationImpact: {
        envVar: 'WATSONX_VEGETATION_IMPACT_DEPLOYMENT_ID',
        labels: ['dense_vegetation', 'moderate_vegetation', 'no_vegetation', 'sparse_vegetation'],
    },
    infrastructureImpact: {
        envVar: 'WATSONX_INFRASTRUCTURE_IMPACT_DEPLOYMENT_ID',
        labels: ['dense_infrastructure', 'moderate_infrastructure', 'no_infrastructure', 'sparse_infrastructure'],
    },
} as const satisfies {
    [K in keyof IndicatorReadings]: { envVar: string; labels: readonly IndicatorReadings[K][] };
};

export type Indicator = keyof typeof INDICATOR_MODELS;

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

export function predictionFromLogits<T extends string>(labels: readonly T[], logits: number[]): IndicatorPrediction<T> {
    if (logits.length !== labels.length) {
        throw new Error(`model returned ${logits.length} outputs, expected ${labels.length} (${labels.join(', ')})`);
    }
    const probabilities = softmax(logits);
    const bestIndex = probabilities.indexOf(Math.max(...probabilities));
    return { value: labels[bestIndex], confidence: probabilities[bestIndex] };
}

export function isIndicatorConfigured(indicator: Indicator): boolean {
    return Boolean(process.env[INDICATOR_MODELS[indicator].envVar]);
}

export async function classifyIndicator<K extends Indicator>(
    indicator: K,
    imageBuffer: Buffer,
): Promise<IndicatorPrediction<IndicatorReadings[K]>> {
    const { envVar, labels } = INDICATOR_MODELS[indicator];
    const deploymentId = process.env[envVar];
    if (!deploymentId) {
        throw new Error(`${envVar} is not configured`);
    }

    const tensor = await preprocessImage(imageBuffer);
    const response = (await scoreDeployment(deploymentId, tensor)) as RawScoringResponse;
    return predictionFromLogits<string>(labels, response.predictions[0].values[0]) as IndicatorPrediction<
        IndicatorReadings[K]
    >;
}
