import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateSeverityScore } from '../src/pipeline/assess-severity.ts';

test('dense vegetation adds nothing when there is no smoke or flame', () => {
    const score = calculateSeverityScore({
        smokeDensity: 'none_or_haze',
        flameVisibility: 'no_visible_flame',
        vegetationImpact: 'dense_vegetation',
        infrastructureImpact: 'nearby_not_burnt',
    });
    assert.equal(score, 1); // 1 + 1 + 4*0 + 2 = 4
});

test('dense vegetation counts in full once there is smoke or flame', () => {
    const indicators = {
        smokeDensity: 'very_dense_blocking_vision',
        flameVisibility: 'visible_high_flames_and_embers',
        infrastructureImpact: 'no_infrastructure_nearby',
    } as const;
    assert.equal(calculateSeverityScore({ ...indicators, vegetationImpact: 'dense_vegetation' }), 3); // 4+3+4+1 = 12
    assert.equal(calculateSeverityScore({ ...indicators, vegetationImpact: 'no_vegetation' }), 2); // 4+3+1+1 = 9
});

test('smoke alone is enough to count vegetation', () => {
    const score = calculateSeverityScore({
        smokeDensity: 'moderate',
        flameVisibility: 'no_visible_flame',
        vegetationImpact: 'dense_vegetation',
        infrastructureImpact: 'nearby_not_burnt',
    });
    assert.equal(score, 2); // 2 + 1 + 4 + 2 = 9
});
